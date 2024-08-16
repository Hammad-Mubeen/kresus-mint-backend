/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  return knex.schema.createTable("social_blades", function (t) {
    t.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    t.uuid("url_id");

    t.integer("t_followers").defaultTo(0);
    t.integer("t_following").defaultTo(0);
    t.integer("t_tweets").defaultTo(0);

    t.integer("i_followers").defaultTo(0);
    t.integer("i_following").defaultTo(0);
    t.integer("i_media").defaultTo(0);
    t.integer("i_engagement_rate").defaultTo(0);

    t.integer("fb_likes").defaultTo(0);
    t.integer("fb_talking_about").defaultTo(0);

    t.integer("yt_subscribers").defaultTo(0);
    t.integer("yt_views").defaultTo(0);

    t.integer("twitch_views").defaultTo(0);
    t.integer("twitch_followers").defaultTo(0);

    t.dateTime("created_at").notNull();
    t.dateTime("updated_at").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("social_blades");
};
