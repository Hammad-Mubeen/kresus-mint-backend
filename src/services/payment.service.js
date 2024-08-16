const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } = process.env;
const stripe = require("stripe")(STRIPE_SECRET_KEY);
const moment = require("moment");

const DB = require("../db");
const UserModel = require("../db/models/user.model");
const PackageModel = require("../db/models/package.model");
const UserPurchasingHistoryModel = require("../db/models/user_purchasing_history.model");

const HTTP = require("../utils/httpCodes");
const Logger = require("../utils/logger");

module.exports = {
  createCheckoutSession: async ({ package_id }, { user }) => {
    try {
      const package = await DB.select("*")
        .from(PackageModel.table)
        .where({ id: package_id })
        .first();

      if (!package) {
        throw {
          code: HTTP.BadRequest,
          error: "Package not found",
        };
      }
      // 1) If the current user isn't in the stripe customer list, we add it there.
      let customer = user.stripe_customer_id;
      if (!user.stripe_customer_id) {
        customer = await stripe.customers.create({
          name: `${user.first_name} ${user.last_name}` || "N/A",
          email: user.email || "N/A",
        });

        // 2) Adding a stripe_customer_id reference in the user model.
        await DB(UserModel.table).where({ id: user.id }).update({
          stripe_customer_id: customer.id,
        });

        customer = customer.id;
      }

      // 5) Create new Checkout Session for the order.
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price: package.product_id,
            quantity: 1,
          },
        ],
        success_url: "https://v3-datablitzer.netlify.app",
        cancel_url: "https://v3-datablitzer.netlify.app",
        client_reference_id: customer,
        customer_email: user.email,
        metadata: {
          quantity: package["credits"],
          user_id: user.id,
        },
      });

      return {
        code: HTTP.Success,
        body: { redirectUrl: session.url },
      };
      //
    } catch (err) {
      Logger.error("payment.service -> createCheckoutSession \n", err);
      throw err;
    }
  },
  webhook: async ({ body, headers }) => {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        headers["stripe-signature"],
        STRIPE_WEBHOOK_SECRET
      );

      switch (event.type) {
        case "checkout.session.completed":
          const User = await DB.select("*")
            .from(UserModel.table)
            .where({ id: event.data.object.metadata.user_id })
            .first();

          const creditsBought = Number(event.data.object.metadata.quantity);

          // Adding the bought credits to user account
          await DB(`${UserModel.table}`)
            .where({ id: User.id })
            .update({
              user_credits:
                +User.user_credits > 0
                  ? +User.user_credits + creditsBought
                  : creditsBought,
            });

          // Updating user_purchasing_history table to add record for this checkout
          await DB(UserPurchasingHistoryModel.table).insert({
            user_id: User.id,
            transaction_data: event,
            created_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
            updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
          });
          break;
        default:
          throw {
            code: HTTP.BadRequest,
            error: "Unexpected event type",
          };
      }
      return {
        code: HTTP.Success,
        body: {},
      };
    } catch (err) {
      Logger.error("stripe.service -> webhook \n", err);
      throw err;
    }
  },
  getPurchasingHistory: async ({ user }) => {
    try {
      const purchasingHistory = await DB.select("*")
        .from(UserPurchasingHistoryModel.table)
        .where({ user_id: user.id })
        .returning("*");

      return {
        code: HTTP.Success,
        body: purchasingHistory,
      };
    } catch (err) {
      Logger.error("payment.service -> getPurchasingHistory \n", err);
      throw err;
    }
  },
};
