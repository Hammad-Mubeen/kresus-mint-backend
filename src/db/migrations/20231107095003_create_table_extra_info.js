/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  return knex.schema.createTable("extra_info", function (t) {
    t.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    t.uuid("url_id");

    t.text("light_house_report").nullable();
    t.text("domain_authority").nullable();
    t.text("google_ads").nullable();
    t.text("ad_spend").nullable();
    t.text("screenshot").nullable();

    t.dateTime("created_at").notNull();
    t.dateTime("updated_at").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("extra_info");
};
