/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  return knex.schema.createTable("urls", function (t) {
    t.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    t.uuid("queue_id").nullable();
    t.uuid("user_id");
    t.string("url");
    t.tinyint("status").defaultTo(0);

    t.text("rrule").nullable();
    t.text("update_time").nullable();
    t.string("pdf_url").nullable();

    t.dateTime("created_at").notNull();
    t.dateTime("updated_at").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("urls");
};
