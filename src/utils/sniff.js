const flatten = require("flat");
const moment = require("moment");
const whoiser = require("whoiser");
const pagespeed = require("gpagespeed");
const { hrtime } = require("node:process");
const urlMetadata = require("url-metadata");

const DB = require("../db");
const UrlModel = require("../db/models/url.model");
const UserModel = require("../db/models/user.model");
const UrlDataModel = require("../db/models/url_data.model");

const { API_COST_PER_REQUEST, PAGE_SPEED_KEY } = process.env;
const sniffHelper = require("./sniffUrlsHelper");
const _API_COST_PER_REQUEST = parseFloat(API_COST_PER_REQUEST);

const markupExportData = (markup) => {
  const haveFbPixel = sniffHelper.is_fb_pixel(markup);
  const emails = sniffHelper.extractEmails(markup);
  const phoneNumbers = sniffHelper.extractPhoneNumbers(markup);
  const socialHandles = sniffHelper.extractSocialHandles(markup);

  return {
    fb_pixels: haveFbPixel ? true : false,
    emails: emails && emails.length ? emails : [],
    phone_numbers: phoneNumbers && phoneNumbers.length ? phoneNumbers : [],
    social_handles: socialHandles && socialHandles.length ? socialHandles : [],
  };
};

module.exports = {
  sniffUrl: async (data) => {
    const startTimeInNs = hrtime.bigint();

    let { urls, queueId, user } = data;

    for (const url of urls) {
      const absoluteUrl = sniffHelper.makeAbsoluteUrl(url, "www.example.com");
      const domain = new URL(absoluteUrl).hostname;
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

      console.log("URLFound", urlFound.id);

      const fetchPromises = [
        sniffHelper.fetchMarkup(absoluteUrl),
        sniffHelper.getSocialBladeDataFromHandlesV2(
          domain.startsWith("www.") ? domain.replace("www.", "").trim() : domain
        ),
        sniffHelper.getDomainInfo(
          domain.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split("/")[0]
        ),
        // sniffHelper.getPageSpeedData({
        //   url: sniffHelper.isValidHttpUrl(absoluteUrl)
        //     ? absoluteUrl
        //     : `http://${absoluteUrl}`,
        //   key: PAGE_SPEED_KEY,
        // }) not working,
        sniffHelper.getMetaData(absoluteUrl),
        sniffHelper.getCompetitorsDomain(absoluteUrl),
        sniffHelper.getGoogleAds(absoluteUrl),
        sniffHelper.getAdspend(absoluteUrl),
        sniffHelper.getScreenShot(absoluteUrl),
        sniffHelper.getTrafficAnalytics(absoluteUrl),
      ];

      const result = await Promise.all(fetchPromises);

      let creditsToBeDeducted = 0.0;
      // Markup Data
      const fetchMarkup = result[0];
      let markupData = markupExportData(fetchMarkup);
      await sniffHelper.updateMarkup(urlFound.id, markupData);
      console.log("Markup Completed");

      // Social Blades Data
      const socialBladeData = result[1];

      await sniffHelper.updateSocialBlade(urlFound.id, socialBladeData.ranks);
      creditsToBeDeducted = creditsToBeDeducted + _API_COST_PER_REQUEST;

      console.log("Social Blade Completed");

      // Domain Info Data
      const whoiserData = result[2];
      if (whoiserData) {
        await sniffHelper.updateDomainInfo(urlFound.id, whoiserData);
      }
      console.log("DomainInfo Completed");

      // Page Speed Data
      // const pageSpeed = result[3];
      // if (pageSpeed && pageSpeed.lighthouseResult && pageSpeed.lighthouseResult.audits) {
      //   await sniffHelper.updateExtraInfo(urlFound.id, {
      //     light_house_report: JSON.stringify(pageSpeed.lighthouseResult.audits),
      //   });
      // }
      // console.log("PageSpeed Completed");

      // URL MetaData
      const metadata = result[3];
      if (metadata) {
        await sniffHelper.updateMetadata(urlFound.id, metadata);
      }
      console.log("MetaData Completed");

      // Domain authority
      const competitorsData = result[4];
      if (
        competitorsData &&
        competitorsData.tasks &&
        competitorsData.tasks.length > 0 &&
        competitorsData.tasks[0].result &&
        competitorsData.tasks[0].result.length > 0 &&
        competitorsData.tasks[0].result[0].items &&
        competitorsData.tasks[0].result[0].items.length > 0 &&
        competitorsData.tasks[0].result[0].items[0]
      ) {
        await sniffHelper.updateExtraInfo(urlFound.id, {
          domain_authority: JSON.stringify(competitorsData.tasks[0].result[0].items[0]),
        });
        creditsToBeDeducted = creditsToBeDeducted + _API_COST_PER_REQUEST;
      }
      console.log("DomainAuthority Completed");

      const googleAds = result[5];
      if (
        googleAds.tasks &&
        googleAds.tasks.length > 0 &&
        googleAds.tasks[0] &&
        googleAds.tasks[0].result &&
        googleAds.tasks[0].result.length > 0 &&
        googleAds.tasks[0].result[0]
      ) {
        await sniffHelper.updateExtraInfo(urlFound.id, {
          google_ads: JSON.stringify(googleAds.tasks[0].result[0]),
        });
        creditsToBeDeducted = creditsToBeDeducted + _API_COST_PER_REQUEST;
      }
      console.log("GoogleAds Completed");

      const { topPpcCompetitorsData, relatedKeywordsData } = result[6];

      await sniffHelper.updateExtraInfo(urlFound.id, {
        ad_spend: JSON.stringify({
          adspend: [],
          relatedKeywordsData,
          topPpcCompetitorsData,
        }),
      });
      creditsToBeDeducted = creditsToBeDeducted + _API_COST_PER_REQUEST;
      console.log("AdSpend Completed");

      const screenshotData = result[7];
      if (screenshotData) {
        await sniffHelper.updateExtraInfo(urlFound.id, {
          screenshot: JSON.stringify(screenshotData),
        });
        creditsToBeDeducted = parseFloat(creditsToBeDeducted + _API_COST_PER_REQUEST);
      }
      console.log("Screenshot Completed");

      const trafficSource = result[8];
      if (
        trafficSource.tasks &&
        trafficSource.tasks.length > 0 &&
        trafficSource.tasks[0] &&
        trafficSource.tasks[0].result &&
        trafficSource.tasks[0].result.length > 0 &&
        trafficSource.tasks[0].result[0] &&
        trafficSource.tasks[0].result[0].items.length > 0 &&
        trafficSource.tasks[0].result[0].items
      ) {
        const locations = await sniffHelper.getAllLocations();
        const Items = trafficSource.tasks[0].result[0].items;
        let trafficSourceData = locations.map((location) => {
          const trafficSourceFound = Items.find(
            (item) => item.location_code === location.location_code
          );

          if (trafficSourceFound) {
            return {
              location_code: location.country_iso_code,
              location_name: location.location_name,
              traffic_source: trafficSourceFound,
            };
          }
        });

        trafficSourceData = trafficSourceData.filter((item) => Boolean(item));
        await sniffHelper.updateTrafficSource(urlFound.id, {
          traffic_sources_data: JSON.stringify(trafficSourceData),
        });
        creditsToBeDeducted = creditsToBeDeducted + _API_COST_PER_REQUEST;
      }

      console.log("trafficSource Completed");

      const endTimeInNs = hrtime.bigint();
      const calcTimeInMs = (endTimeInNs - startTimeInNs) / BigInt(1000000);
      const calcTimeInSec = calcTimeInMs / BigInt(1000);
      const timeTaken = parseInt(calcTimeInSec) || 0;
      console.log(timeTaken, creditsToBeDeducted);

      const urlDataFound = await DB(UrlDataModel.table)
        .where({ url_id: urlFound.id })
        .first();
      if (urlDataFound) {
        await DB(UrlDataModel.table)
          .where({ url_id: urlFound.id })
          .update({
            url_id: urlFound.id,
            time_taken_in_seconds: timeTaken,
            cost: creditsToBeDeducted,
            updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
          });
      } else {
        await DB(UrlDataModel.table).insert({
          url_id: urlFound.id,
          time_taken_in_seconds: timeTaken,
          cost: creditsToBeDeducted,
          created_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
          updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
        });
      }

      await DB(UrlModel.table)
        .where({ id: urlFound.id })
        .update({
          status: 1,
          updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
        });

      // Deducting credits from user
      await DB(UserModel.table)
        .where({ id: user.id })
        .update({
          user_credits: user.user_credits - creditsToBeDeducted,
          updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
        });

      // Updating user_credits_history table to maintain record for each searched url
    }
  },
};
