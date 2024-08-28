/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  return knex.schema.createTable("nfts", function (t) {
    t.string("nftId", 200).primary().notNull();
    t.string("name", 200).notNull();
    t.string("description", 200).notNull();
    t.string("nftURL", 200).notNull();
    t.string("email", 200).notNull();
    t.string("vaultAddress", 200).notNull();
    t.specificType('sharedNFTEmails', 'text ARRAY');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("nfts");
};
