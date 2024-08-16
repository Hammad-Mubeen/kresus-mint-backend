/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  return knex.schema.createTable("sites_trackers", function (t) {
    t.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    t.text("site");
    t.text("trackers");
    t.uuid("url_id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("sites_trackers");
};
