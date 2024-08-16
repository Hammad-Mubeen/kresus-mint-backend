const Joi = require("joi");

module.exports = {
  addUrls: {
    body: Joi.object({
      urls: Joi.array().items(Joi.string().required()).required(),
      queueId: Joi.string().uuid().optional(),
    }),
  },
  addUrlsV2: {
    body: Joi.object({
      urlArr: Joi.array()
        .items(
          Joi.object({
            url: Joi.string().required(),
            depth: Joi.number().optional(),
          })
        )
        .required(),
      rrule: Joi.string().optional(),
      queueId: Joi.string().uuid().optional(),
      update_time: Joi.string().optional(),
    }),
  },
  compare: {
    body: Joi.object().keys({
      url: Joi.string().required(),
    }),
  },
  getSniffedData: {
    params: Joi.object({
      queueId: Joi.string().uuid().required(),
    }),
  },
  deleteQueue: {
    params: Joi.object({
      queueId: Joi.string().uuid().required(),
    }),
  },
  deleteUrl: {
    params: Joi.object({
      urlId: Joi.string().required(),
    }),
  },
  exportToCsv: {
    params: Joi.object({
      queueId: Joi.string().uuid().required(),
    }),
  },
  generatePdfLink: {
    query: Joi.object({
      url_id: Joi.string().uuid().required(),
    }),
  },
  getQueueStatus: {
    body: Joi.object({
      queueIds: Joi.array().items(Joi.string().required()).required(),
    }),
  },
};
