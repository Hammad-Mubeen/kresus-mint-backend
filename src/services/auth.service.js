const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const moment = require("moment");

const DB = require("../db");
const UserModel = require("../db/models/user.model");
const Utils = require("../utils");
const Sendgrid = require("../utils/sendgrid");
const HTTP = require("../utils/httpCodes");
const Logger = require("../utils/logger");

const { AUTH_SECRET, USER_CREDITS } = process.env;

module.exports = {
  signup: async ({ first_name, last_name, email, password }) => {
    try {
      const user = await DB.select("*")
        .from(UserModel.table)
        .where({ email: email.toLowerCase() })
        .first();

      if (user) {
        throw {
          code: HTTP.BadRequest,
          error: "Email already taken.",
        };
      }

      const email_confirmation_token = Utils.makeRandomID(60);
      const email_confirmation_code = Math.floor(100000 + Math.random() * 900000);
      const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

      const newUser = await DB(UserModel.table)
        .insert({
          first_name,
          last_name,
          email: email.toLowerCase(),
          password: passwordHash,
          user_credits: USER_CREDITS,
          email_confirmation_token,
          email_confirmation_code,
          created_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
          updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
        })
        .returning("*");

      if (newUser.length === 1) {
        await Sendgrid.signupEmailVerification(email, {
          code: email_confirmation_code,
        });
        return {
          code: HTTP.Success,
          body: {
            token: email_confirmation_token,
          },
        };
      }
    } catch (err) {
      Logger.error("auth.service -> signup \n", err);
      throw err;
    }
  },
  login: async ({ email, password }) => {
    try {
      const user = await DB.select("*")
        .from(UserModel.table)
        .where({ email: email.toLowerCase() })
        .first();

      if (!user) {
        throw {
          code: HTTP.Unauthorized,
          error: "Invalid credentials.",
        };
      }
      if (!user.is_email_verified) {
        throw {
          code: HTTP.BadRequest,
          error: "Verify your email first.",
        };
      }

      const passwordIsValid = bcrypt.compareSync(password, user.password);
      if (!passwordIsValid) {
        throw {
          code: HTTP.Unauthorized,
          error: "Invalid credentials.",
        };
      }

      const token = jwt.sign({ id: user.id }, AUTH_SECRET, {
        expiresIn: "7d",
      });

      return {
        code: HTTP.Success,
        body: {
          ...UserModel.whitelist(user),
          accessToken: token,
        },
      };
    } catch (err) {
      Logger.error("auth.service -> login \n", err);
      throw err;
    }
  },
  emailVerification: async ({ token }, { code }) => {
    try {
      const user = await DB.select("*")
        .from(UserModel.table)
        .where({ email_confirmation_code: code, email_confirmation_token: token })
        .first();

      if (!user) {
        throw {
          code: HTTP.BadRequest,
          error: "Invalid code.",
        };
      }

      const email_confirmation_code = Math.floor(100000 + Math.random() * 900000);

      await DB(UserModel.table)
        .where({ email_confirmation_code: code, email_confirmation_token: token })
        .update({
          email_confirmation_token: Utils.makeRandomID(60),
          is_email_verified: true,
          email_confirmation_code,
        });

      return {
        code: HTTP.SuccessNoContent,
        body: {},
      };
    } catch (err) {
      Logger.error("auth.service -> emailVerification \n", err);
      throw err;
    }
  },
  forgotPassword: async ({ email }) => {
    try {
      const user = await DB.select("*")
        .from(UserModel.table)
        .where({ email: email.toLowerCase() })
        .first();

      if (!user) {
        throw { code: HTTP.NotFound, error: "User not found." };
      }

      const forgot_confirmation_token = Utils.makeRandomID(60);
      const forgot_confirmation_code = Math.floor(100000 + Math.random() * 900000);

      await DB(UserModel.table)
        .where({ id: user.id })
        .update({ forgot_confirmation_token, forgot_confirmation_code });

      await Sendgrid.forgotPassword(user.email, {
        code: forgot_confirmation_code,
        fullname: `${user.first_name}  ${user.last_name}`,
      });

      return {
        code: HTTP.Success,
        body: {
          token: forgot_confirmation_token,
        },
      };
    } catch (err) {
      Logger.error("auth.service -> forgotPassword \n", err);
      throw err;
    }
  },
  recoverPassword: async ({ token }, { code, password }) => {
    try {
      const user = await DB.select("*")
        .from(UserModel.table)
        .where({ forgot_confirmation_token: token, forgot_confirmation_code: code })
        .first();

      if (!user) {
        throw { code: HTTP.BadRequest, error: "Invalid code." };
      }

      const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

      const forgot_confirmation_token = Utils.makeRandomID(60);
      const forgot_confirmation_code = Math.floor(100000 + Math.random() * 900000);

      await DB(UserModel.table).where({ id: user.id }).update({
        forgot_confirmation_token,
        forgot_confirmation_code,
        password: passwordHash,
      });

      return {
        code: HTTP.SuccessNoContent,
        body: {},
      };
    } catch (err) {
      Logger.error("auth.service -> recoverPassword \n", err);
      throw err;
    }
  },
};
