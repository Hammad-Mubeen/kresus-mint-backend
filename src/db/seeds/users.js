/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const moment = require("moment");
const UserModel = require("../models/user.model");

exports.seed = async function (knex) {
  await knex(UserModel.table).insert([
    {
      first_name: "John",
      last_name: "doe",
      email: "Johndoe@gmail.com",
      password: "$2a$10$yVtwpDRzgmLdZW8yUVCLpeTju1AJ9G4ZHhSquJuTgiRKOsXfnhhGK",
      is_email_verified: true,
      created_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
      updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
    },
  ]);
};
