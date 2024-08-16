const whitelist = require('../../utils/whitelist');

module.exports = {
  table: 'user_purchasing_history',
  whitelist: (data) =>
    whitelist(data, ['id', 'user_id', 'transaction_data', 'created_at', 'updated_at']),
};
