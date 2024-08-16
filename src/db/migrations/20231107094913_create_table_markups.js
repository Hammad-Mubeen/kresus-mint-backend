/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  return knex.schema.createTable("markups", function (t) {
    t.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    t.uuid("url_id");
    t.boolean("fb_pixels");
    t.specificType("emails", "text ARRAY");
    t.specificType("phone_numbers", "text ARRAY");
    t.specificType("social_handles", "text ARRAY");

    // t.jsonb('emails').nullable();
    // t.jsonb('phone_numbers').nullable();
    // t.jsonb('social_handles').nullable();
    t.dateTime("created_at").notNull();
    t.dateTime("updated_at").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("markups");
};
