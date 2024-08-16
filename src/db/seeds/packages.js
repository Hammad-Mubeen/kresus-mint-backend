/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const moment = require("moment");
const PackageModel = require("../models/package.model");

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex(PackageModel.table).del();
  await knex(PackageModel.table).insert([
    {
      name: "Gold",
      price: 150.0,
      credits: 150.0,
      product_id: "price_1OWFAHSD60udT97CHHXtmNjI",
      description:
        "Includes Google Adspend, Email, Phone #, Twitter Handle, FB Page URL, FB Group URL, IG URL, Pinterest URL, Screenshot, DNS Info, Owner Name, Alexa Rank, Domain Authority, Google Ads, SimilarWeb traffic data,",
      created_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
      updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
    },
    {
      name: "Silver",
      price: 100.0,
      credits: 100.0,
      product_id: "price_1OWF9VSD60udT97CZtR7XIXh",
      description:
        "Includes Google Adspend, Email, Phone #, Twitter Handle, FB Page URL, FB Group URL, IG URL, Pinterest URL, Screenshot, DNS Info, Owner Name, Alexa Rank, Domain Authority, Google Ads, SimilarWeb traffic data,",
      created_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
      updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
    },
    {
      name: "Bronze",
      price: 50.0,
      credits: 50.0,
      description:
        "Includes Google Adspend, Email, Phone #, Twitter Handle, FB Page URL, FB Group URL, IG URL, Pinterest URL, Screenshot, DNS Info, Owner Name, Alexa Rank, Domain Authority, Google Ads, SimilarWeb traffic data,",
      product_id: "price_1OWF8XSD60udT97Cq1I5d6v2",
      created_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
      updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
    },
  ]);
};
