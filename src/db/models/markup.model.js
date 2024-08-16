const whitelist = require('../../utils/whitelist');

module.exports = {
  table: 'markups',
  whitelist: (data) =>
    whitelist(data, [
      'id',
      'url_id',
      'fb_pixels',
      'emails',
      'phone_numbers',
      'social_handles',
      'created_at',
      'updated_at',
    ]),
};
