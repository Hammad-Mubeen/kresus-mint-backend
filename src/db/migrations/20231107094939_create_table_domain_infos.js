/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  return knex.schema.createTable("domain_infos", function (t) {
    t.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    t.uuid("url_id");

    t.specificType("name_server", "text ARRAY");
    t.string("domain_name").nullable();
    t.string("registry_domain_id").nullable();
    t.string("registry_whois_server").nullable();
    t.string("registrar_url").nullable();

    t.string("created_date").nullable();
    t.string("updated_date").nullable();
    t.string("expiry_date").nullable();
    t.string("registrar").nullable();
    t.string("registrar_iana_id").nullable();

    t.string("registrar_abuse_contact_email").nullable();
    t.string("registrar_abuse_contact_phone").nullable();

    t.dateTime("created_at").notNull();
    t.dateTime("updated_at").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("domain_infos");
};
