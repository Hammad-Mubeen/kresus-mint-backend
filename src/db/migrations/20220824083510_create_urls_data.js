/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  return knex.schema.createTable("urls_data", function (t) {
    t.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    t.uuid("url_id");
    t.text("data");

    t.float("time_taken_in_seconds").defaultTo(0);
    t.float("cost").defaultTo(0.0);

    t.dateTime("created_at").notNull();
    t.dateTime("updated_at").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("urls_data");
};
