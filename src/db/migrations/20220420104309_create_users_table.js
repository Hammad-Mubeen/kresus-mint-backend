/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  return knex.schema.createTable("users", function (t) {
    t.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    t.string("first_name", 50).nullable();
    t.string("last_name", 50).nullable();
    t.string("password").nullable();
    t.string("email", 200).notNull();
    t.string("public_key", 200).notNull();
    t.string("private_key", 200).notNull();
    t.string("address", 200).notNull();
    t.boolean("is_white_listed").defaultTo(false);
    t.specificType('sharedNFTEmails', 'text ARRAY');

    t.string("email_confirmation_code", 10).nullable();
    t.string("email_confirmation_token", 200).nullable();
    t.boolean("is_email_verified").defaultTo(false);
    t.string("forgot_confirmation_token", 200).nullable();
    t.string("forgot_confirmation_code", 10).nullable();

    
    t.dateTime("created_at").notNull();
    t.dateTime("updated_at").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
