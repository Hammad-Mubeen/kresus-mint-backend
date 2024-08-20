/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

require("dotenv").config();
const moment = require("moment");
const UserModel = require("../models/user.model");

exports.seed = async function (knex) {
  await knex(UserModel.table).insert([
    {
      first_name: "Muhammad Hammad",
      last_name: "Mubeen",
      email: "twoface03205622887@gmail.com",
      public_key: process.env.PUBLIC_KEY,
      address: process.env.ADDRESS,
      private_key: process.env.PRIVATE_KEY,
      password: "$2a$10$yVtwpDRzgmLdZW8yUVCLpeTju1AJ9G4ZHhSquJuTgiRKOsXfnhhGK",
      sharedNFTEmails:{},
      is_email_verified: true,
      created_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
      updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
    },
  ]);
};
