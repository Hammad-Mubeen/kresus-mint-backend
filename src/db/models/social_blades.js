const whitelist = require('../../utils/whitelist');

module.exports = {
  table: 'social_blades',
  whitelist: (data) =>
    whitelist(data, [
      'id',
      'url_id',
      't_followers',
      't_following',
      't_tweets',
      'i_followers',
      'i_following',
      'i_media',
      'i_engagement_rate',
      'fb_likes',
      'fb_talking_about',
      'yt_subscribers',
      'yt_views',
      'twitch_views',
      'twitch_followers',
      'created_at',
      'updated_at',
    ]),
};
