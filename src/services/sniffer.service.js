const moment = require("moment");
const { v4: uuidv4 } = require("uuid");

const DB = require("../db");
const UrlModel = require("../db/models/url.model");
const UserModel = require("../db/models/user.model");
const UrlDataModel = require("../db/models/url_data.model");
const TrackerModel = require("../db/models/sites_trackers.model");
const MarkupModel = require("../db/models/markup.model");
const SocialBladeModel = require("../db/models/social_blades");
const DomainInfoModel = require("../db/models/domain_infos.model");
const MetadataModel = require("../db/models/metadata.model");
const ExtraInfoModel = require("../db/models/extra_info.model");
const sniffHelper = require("../utils/sniffUrlsHelper");
const Logger = require("../utils/logger");
const TrafficSourceModel = require("../db/models/traffic_sources.model");
const { fileUpload } = require("../utils/S3Config");
const { publishData } = require("../utils/amqp");
const HTTP = require("../utils/httpCodes");
const Response = require("../utils/response");

module.exports = {
  addUrls: async ({ urls, queueId }, { user }) => {
    try {
      // Checking if the user has enough credits.
      if (!user.user_credits || user.user_credits < 1) {
        throw {
          code: HTTP.BadRequest,
          error:
            "You do not have enough credits for this request, please buy more credits to perform this action",
        };
      }

      if (!queueId) {
        queueId = uuidv4();
      }

      for (const url of urls) {
        const absoluteUrl = sniffHelper.makeAbsoluteUrl(url, "www.example.com");
        let urlFound = await DB.select("*")
          .from(UrlModel.table)
          .where({
            user_id: user.id,
            queue_id: queueId,
            url: absoluteUrl.toLowerCase(),
          })
          .first();

        if (urlFound) {
          await DB(UrlModel.table).where({ id: urlFound.id }).update({
            status: 0,
          });
        } else {
          urlFound = await DB(UrlModel.table)
            .insert({
              queue_id: queueId,
              user_id: user.id,
              url: absoluteUrl.toLowerCase(),
              status: 0,
              created_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
              updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
            })
            .returning("*");
          urlFound = urlFound[0];
        }
      }

      await publishData(JSON.stringify({ urls, queueId, user }));

      return {
        code: HTTP.Success,
        body: { queueId },
      };
      //
    } catch (err) {
      Logger.error("sniffer.service-> addUrls ", err);
      throw err;
    }
  },
  getSniffedData: async ({ queueId }, { user }) => {
    try {
      const urls = await DB.select("*").from(UrlModel.table).where("queue_id", queueId);

      if (!urls.length) {
        throw {
          code: HTTP.BadRequest,
          error: "Invalid QueueId",
        };
      }
      const resp = [];
      for (let i = 0; i < urls.length; i++) {
        const markup = await DB.select("*")
          .from(UrlModel.table)
          .leftJoin(MarkupModel.table, "urls.id", "=", "markups.url_id")
          .where("url_id", urls[i].id)
          .first();

        const socialBlade = await DB.select("*")
          .from(UrlModel.table)
          .leftJoin(SocialBladeModel.table, "urls.id", "=", "social_blades.url_id")
          .where("url_id", urls[i].id)
          .first();

        const domainInfo = await DB.select("*")
          .from(UrlModel.table)
          .leftJoin(DomainInfoModel.table, "urls.id", "=", "domain_infos.url_id")
          .where("url_id", urls[i].id)
          .first();

        const metadata = await DB.select("*")
          .from(UrlModel.table)
          .leftJoin(MetadataModel.table, "urls.id", "=", "metadata.url_id")
          .where("url_id", urls[i].id)
          .first();

        const extraInfo = await DB.select("*")
          .from(UrlModel.table)
          .leftJoin(ExtraInfoModel.table, "urls.id", "=", "extra_info.url_id")
          .where("url_id", urls[i].id)
          .first();

        const trafficSource = await DB.select("*")
          .from(UrlModel.table)
          .leftJoin(TrafficSourceModel.table, "urls.id", "=", "traffic_sources.url_id")
          .where("url_id", urls[i].id)
          .first();

        const trackers = await DB.select("*")
          .from(TrackerModel.table)
          .where("site", urls[i].url)
          .first();

        resp.push({
          ...urls[i],
          markup,
          socialBlade,
          domainInfo,
          metadata,
          extraInfo,
          trackers,
          trafficSource: trafficSource,
        });
      }
      return {
        code: HTTP.Success,
        body: resp,
      };
    } catch (err) {
      Logger.error("sniffer.service -> getSniffedData \n", err);
      throw err;
    }
  },
  getUsersUrls: async ({ user }) => {
    try {
      let data = await DB.select("*").from(UrlModel.table).where("user_id", user.id);

      data = data.reduce(function (acc, { id, user_id, queue_id, status, url, pdf_url }) {
        const existing = acc.find((i) => i.queue_id === queue_id);
        if (existing) {
          existing.Urls.push({ id, url, status });
        } else {
          acc.push({ user_id, queue_id, pdf_url, Urls: [{ id, url, status }] });
        }
        return acc;
      }, []);

      return {
        code: HTTP.Success,
        body: data,
      };
    } catch (err) {
      Logger.error("sniffer.service -> getUsersUrls \n", err);
      throw err;
    }
  },
  deleteQueue: async ({ queueId }, { user }) => {
    try {
      await DB(UrlModel.table)
        .where({
          user_id: user.id,
          queue_id: queueId,
        })
        .del();

      return {
        code: HTTP.SuccessNoContent,
        body: {},
      };
    } catch (err) {
      Logger.error("deleteQueue error: ", err);
      throw err;
    }
  },
  generatePdfLink: async (pdf, { queue_id }, { user }) => {
    try {
      const fileName = `sniffer/pdf/${crypto.randomUUID()}/${queue_id}`;
      const uploadedPdf = await fileUpload(fileName, pdf.buffer, pdf.mimetype);

      if (!uploadedPdf) {
        return {
          code: HTTP.Unprocessable,
          error: Response.ErrorBody(
            "This file could not be processed, Please try again",
            {}
          ),
        };
      }

      await DB(UrlModel.table)
        .where({ queue_id })
        .update({ pdf_url: uploadedPdf.Location });

      return {
        code: HTTP.Success,
        body: { pdfLink: uploadedPdf.Location },
      };
    } catch (error) {
      console.log(error);
      Logger.error("sniffer.service.js -> generatePdfLink \n", error);
      return {
        code: HTTP.ServerError,
        error: Response.ErrorBody("Something went wrong, Please try again later", error),
      };
    }
  },
  getQueueStatus: async ({ queueIds }, { user }) => {
    try {
      const fetchedUrls = [];
      for (const queueId of queueIds) {
        const data = await DB.select("*")
          .from(UrlModel.table)
          .where({ queue_id: queueId, user_id: user.id })
          .where("status", 0)
          .first();

        if (!data) {
          fetchedUrls.push(queueId);
        }
      }

      return {
        code: HTTP.Success,
        body: fetchedUrls,
      };
    } catch (err) {
      Logger.error("getQueueStatus error: ", err);
      throw err;
    }
  },
};
