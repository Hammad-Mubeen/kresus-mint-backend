require("isomorphic-unfetch");
const urlSrvc = require("url");
const axios = require("axios");
const request = require("request");
const cheerio = require("cheerio");
const SocialBlade = require("socialblade");
const whoiser = require("whoiser");
const pagespeed = require("gpagespeed");
const urlMetadata = require("url-metadata");
const DB = require("../db");
const MarkupModel = require("../db/models/markup.model");
const SocialBladeModel = require("../db/models/social_blades");
const DomainInfoModel = require("../db/models/domain_infos.model");
const ExtraInfoModel = require("../db/models/extra_info.model");
const MetadataModel = require("../db/models/metadata.model");
const TrafficSourceModel = require("../db/models/traffic_sources.model");
const moment = require("moment");
const captureWebsite = import("capture-website");
const {
  SPYFU_API_KEY,
  SOCIAL_BLADE_CLIENT_ID,
  SOCIAL_BLADE_ACCESS_TOKEN,
  DATA_FOR_SEO_KEY,
} = process.env;

const socialBladeClient = new SocialBlade(
  SOCIAL_BLADE_CLIENT_ID,
  SOCIAL_BLADE_ACCESS_TOKEN
);

module.exports = {
  getUrlHost: function (url) {
    // ** Data Filtering - Filtering url to a HOST
    let URL = url
      .toLowerCase()
      .trim()
      .replace("https://", "")
      .replace("http://", "")
      .replace("www.", "");

    let HOST = URL.replace(URL.slice(URL.indexOf(".")), "").trim();

    return HOST;
  },
  removeDuplicates: function (arr) {
    arr.sort();

    arr.forEach((item) => {
      var firstIndex = arr.indexOf(item);
      var lastIndex = arr.lastIndexOf(item);

      if (firstIndex != lastIndex) {
        arr.splice(firstIndex + 1, lastIndex - firstIndex);
      }
    });

    return arr;
  },
  validateUrl: function (url) {
    var urlRegEx =
      /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i;
    return urlRegEx.test(url);
  },
  makeAbsoluteUrl: function (url, host) {
    // trim the url.
    url = url.trim().toLowerCase();

    // Get the indexes.
    var queryIndex = url.indexOf("?"),
      hashIndex = url.indexOf("#"),
      slashIndex = url.indexOf("/"),
      slashLastIndex = url.lastIndexOf("/"),
      doubleSlashIndex = url.indexOf("//"),
      httpIndex = url.indexOf("http");

    // Remove query string, hash and trailing slash.
    if (queryIndex > -1) url = url.substring(0, queryIndex);
    if (hashIndex > -1 && hashIndex < url.length) url = url.substring(0, hashIndex);
    if (slashLastIndex === url.length - 1) url = url.substring(0, slashLastIndex);

    // If format is //www.example.com
    if (doubleSlashIndex === 0) url = "http:" + url;
    else if (slashIndex === 0) url = "http://" + host + url;
    else if (httpIndex === -1) url = "http://" + url;

    return url;
  },
  extractSocialHandles: function (markup) {
    var regExTwitter = /http(s)?:\/\/(www\.)?twitter\.com\/[A-z 0-9 _]+\/?/gi,
      regExFacebook =
        /http(s)?:\/\/(www\.)?(facebook|fb)\.com\/[A-Z a-z 0-9 _ - \.]{5,}\/?/gi,
      regExInstagram =
        /https?:\/\/(www\.)?instagram\.com\/([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,28}(?:[A-Za-z0-9_]))?)/gi,
      regExGooglePlus = /https?:\/\/plus\.google\.com\/\d{21}/gi,
      regExSkype =
        /(?:(?:callto|skype):)(?:[a-z][a-z0-9\\.,\\-_]{5,31})(?:\\?(?:add|call|chat|sendfile|userinfo))?/gi,
      regExTelegram =
        /https?:\/\/(t(elegram)?\.me|telegram\.org)\/([a-z0-9\_]{5,32})\/?/gi,
      regExLinkedIn =
        /http(s)?:\/\/([\w]+\.)?linkedin\.com\/(in|company)\/[A-z 0-9 _ -]+\/?/gi,
      regExGithub = /http(s)?:\/\/(www\.)?github\.com\/[A-z 0-9 _ -]+\/?/gi;
    var twitter = markup.match(regExTwitter) || [];
    var facebook = markup.match(regExFacebook) || [];
    var insta = markup.match(regExInstagram) || [];
    var gPlus = markup.match(regExGooglePlus) || [];
    var skype = markup.match(regExSkype) || [];
    var telegram = markup.match(regExTelegram) || [];
    var linkedIn = markup.match(regExLinkedIn) || [];
    var github = markup.match(regExGithub) || [];

    return [].concat(twitter, facebook, insta, gPlus, skype, telegram, linkedIn, github);
  },
  extractUrls: async function (markup, host) {
    var $ = cheerio.load(markup);
    var anchors = $("a");
    var links = [];
    anchors.each(function (i, anchor) {
      var href = $(anchor).attr("href");

      if (href) {
        links.push(href);
      }
    });

    if (links.length > 0) {
      for (var i = 0; i < links.length; i++) {
        links[i] = await this.makeAbsoluteUrl(links[i], host);
      }

      var filteredUrls = links.filter((url) => {
        var urlParts = urlSrvc.parse(url);
        if (urlParts.host == host) return true;
        else return false;
      });

      return this.removeDuplicates(filteredUrls);
    } else {
      return [];
    }
  },
  extractEmails: function (markup) {
    var emailRegEx =
      /\w(?:[a-z0-9_-]+(?:\.[a-z0-9_-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi;
    return markup.match(emailRegEx) || [];
  },
  extractPhoneNumbers: function (markup) {
    let phoneNumberRegEx = /^\+?[1-9]\d{1,14}$/gi;
    return markup.match(phoneNumberRegEx) || [];
  },
  fetchMarkup: function (url) {
    url = url.trim().toLowerCase();

    if (!this.validateUrl(url)) return Promise.reject();
    return new Promise((resolve, reject) => {
      request(
        {
          url,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36",
          },
        },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            resolve(body);
          } else {
            resolve(body);
          }
        }
      );
    });
  },
  is_fb_pixel: function (markup) {
    var $ = cheerio.load(markup);
    return $("script").is(':contains("//connect.facebook.net/en_US/fbevents.js")') ||
      $("script").is(':contains("fb_param.pixel_id")') ||
      $("script").is(':contains("pixelId")')
      ? true
      : false;
  },
  isValidHttpUrl: function (string) {
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
  },
  getAdspend: async function (url) {
    const _domain = new URL(this.isValidHttpUrl(url) ? url : `http://${url}`);
    const topPpcCompetitorsData = await axios
      .post(
        `https://api.dataforseo.com/v3/dataforseo_labs/google/competitors_domain/live`,
        JSON.stringify([
          {
            location_code: 2840,
            target: url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split("/")[0],
            language_name: "English",
            limit: 5,
          },
        ]),
        {
          headers: {
            "content-type": "application/json",
            Authorization: `Basic ${DATA_FOR_SEO_KEY}`,
          },
        }
      )
      .then((response) => {
        return response.data.tasks?.[0].result;
      })
      .catch((error) => {
        console.error("topPpcCompetitorsData: ", error);
        return [];
      });

    // const adsKeywordData = await axios
    //   .get(
    //     `https://www.spyfu.com/apis/keyword_api/v2/related/getAlsoBuysAdsForKeywords`,
    //     {
    //       params: {
    //         query: _domain.hostname.startsWith("www.")
    //           ? _domain.hostname.replace("www.", "").trim().split(".")[0].trim()
    //           : _domain.hostname,
    //         countryCode: "US",
    //         api_key: SPYFU_API_KEY,
    //       },
    //     }
    //   )
    //   .then((response) => {
    //     return response.data.results;
    //   })
    //   .catch((error) => {
    //     //console.error("relatedKeywordsData: ", error);
    //     return [];
    //   });
    const relatedKeywordsData = await axios
      .post(
        `https://api.dataforseo.com/v3/dataforseo_labs/google/related_keywords/live`,
        JSON.stringify([
          {
            location_code: 2840,
            keyword: _domain.hostname.startsWith("www.")
              ? _domain.hostname.replace("www.", "").replace(".com", "").trim()
              : _domain.hostname.replace(".com", ""),
            language_name: "English",
            limit: 15,
          },
        ]),
        {
          headers: {
            "content-type": "application/json",
            Authorization: `Basic ${DATA_FOR_SEO_KEY}`,
          },
        }
      )
      .then((response) => {
        return response.data.tasks?.[0].result;
      })
      .catch((error) => {
        console.error("relatedKeywordsData: ", error);
        return [];
      });

    // const domainStats = await axios
    //   .get(`https://www.spyfu.com/apis/domain_stats_api/v2/getLatestDomainStats`, {
    //     params: {
    //       domain: _domain.hostname.startsWith("www.")
    //         ? _domain.hostname.replace("www.", "").trim()
    //         : _domain.hostname,
    //       countryCode: "US",
    //       api_key: SPYFU_API_KEY,
    //     },
    //   })
    //   .then((response) => {
    //     return response.data.results;
    //   })
    //   .catch((error) => {
    //     //console.error("domainStats: ", error);
    //     return [];
    //   });

    // const googleAdsHistory = await axios
    //   .get(`https://www.spyfu.com/apis/ad_history_api/domain_ad_history_json`, {
    //     params: {
    //       d: _domain.hostname.startsWith("www.")
    //         ? _domain.hostname.replace("www.", "").trim()
    //         : _domain.hostname,
    //       isUs: true,
    //       api_key: SPYFU_API_KEY,
    //     },
    //   })
    //   .then((response) => {
    //     return response.data;
    //   })
    //   .catch((error) => {
    //     //console.error("googleAdsHistory: ", error);
    //     return [];
    //   });

    return {
      topPpcCompetitorsData,
      // adsKeywordData,
      relatedKeywordsData,
      // domainStats,
      // googleAdsHistory,
    };
  },
  getDomainWhois: async function (url) {
    let _domain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split("/")[0];
    const data = [
      {
        target: _domain,
        filters: ["domain", "like", `%${_domain}%`],
      },
    ];

    return await axios({
      method: "post",
      url: "https://api.dataforseo.com/v3/domain_analytics/whois/overview/live",
      data,
      headers: {
        "content-type": "application/json",
        Authorization: `Basic ${DATA_FOR_SEO_KEY}`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36",
      },
    })
      .then(function (response) {
        return response.data.tasks[0].result[0].items;
      })
      .catch(function (error) {
        return false;
      });
  },
  getCompetitorsDomain: async function (url) {
    let _domain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split("/")[0];
    const data = JSON.stringify([
      {
        target: _domain,
        location_name: "United Kingdom",
        language_name: "English",
      },
    ]);

    return await axios
      .post(
        "https://api.dataforseo.com/v3/dataforseo_labs/google/competitors_domain/live",
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${DATA_FOR_SEO_KEY}`,
          },
        }
      )
      .then((response) => {
        return response.data ? response.data : [];
      })
      .catch((error) => {
        console.error("getTrafficAnalytics \n", error);
        return [];
      });
  },
  getTrafficAnalytics: async function (url) {
    let _domain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split("/")[0];

    const post_array = [
      {
        target: _domain,
        language_code: "en",
        limit: 10,
      },
    ];

    return await axios({
      method: "post",
      url: "https://api.dataforseo.com/v3/dataforseo_labs/google/domain_rank_overview/live",
      data: post_array,
      headers: {
        "content-type": "application/json",
        Authorization: `Basic ${DATA_FOR_SEO_KEY}`,
      },
    })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.error(error);
        return false;
      });
  },
  getGoogleAds: async function (url) {
    return await new Promise((resolve, reject) => {
      let _domain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split("/")[0];
      request(
        {
          url: `https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_site/live`,
          method: "POST",
          body: JSON.stringify([{ target: _domain }]),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${DATA_FOR_SEO_KEY}`,
            "User-Agent":
              "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36",
          },
        },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            resolve(JSON.parse(body));
          } else {
            reject('Failed to process url "' + url + '"');
          }
        }
      );
    });
  },
  getScreenShot: async function (url) {
    return (await captureWebsite).default
      .base64(url, {
        launchOptions: {
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        },
      })
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        console.error(error);
        return false;
      });
    // return await new Promise((resolve, reject) => {
    //   request(
    //     {
    //       url: `https://api.dataforseo.com/v3/on_page/page_screenshot`,
    //       method: "POST",
    //       body: JSON.stringify([{ url: url }]),
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: `Basic ${DATA_FOR_SEO_KEY}`,
    //       },
    //     },
    //     function (error, response, body) {
    //       if (!error && response.statusCode == 200) {
    //         resolve(JSON.parse(body));
    //       } else {
    //         reject('Failed to process url "' + url + '"');
    //       }
    //     }
    //   );
    // });
  },
  getSocialBladeDataFromHandles: async function (domain) {
    try {
      // Using Set() Type to avoid duplicates.
      let hostsSet = new Set();
      let results = [];

      domain.forEach((item) => {
        if (item) {
          console.log(this.getUrlHost(item));
          hostsSet.add(this.getUrlHost(item));
        }
      });
      for (let item of hostsSet) {
        if (item) {
          results.push(await socialBladeClient.twitter.user(item));
          results.push(await socialBladeClient.instagram.user(item));
          results.push(await socialBladeClient.facebook.user(item));
          results.push(await socialBladeClient.youtube.user(item));
          results.push(await socialBladeClient.twitch.user(item));
        }
      }
      console.log(results);
      return results;
    } catch (error) {
      return false;
    }
  },

  getSocialBladeDataFromHandlesV2: async function (domain) {
    let isDataFetch = true;
    let ranks = {
      t_followers: 0,
      t_following: 0,
      t_tweets: 0,
      i_followers: 0,
      i_following: 0,
      i_media: 0,
      i_engagement_rate: 0,
      fb_likes: 0,
      fb_talking_about: 0,
      yt_subscribers: 0,
      yt_views: 0,
      twitch_views: 0,
      twitch_followers: 0,
    };
    try {
      const item = this.getUrlHost(domain);

      if (item) {
        const twitter = await socialBladeClient.twitter.user(item);
        if (twitter && twitter.ranks) {
          isDataFetch = true;
          ranks["t_followers"] = twitter.ranks.followers;
          ranks["t_following"] = twitter.ranks.following;
          ranks["t_tweets"] = twitter.ranks.tweets;
        }
        const instagram = await socialBladeClient.instagram.user(item);
        if (instagram && instagram.ranks) {
          isDataFetch = true;
          ranks["i_followers"] = instagram.ranks.followers;
          ranks["i_following"] = instagram.ranks.following;
          ranks["i_media"] = instagram.ranks.media;
          ranks["i_engagement_rate"] = instagram.ranks.engagement_rate;
        }

        const facebook = await socialBladeClient.facebook.user(item);
        if (facebook && facebook.ranks) {
          isDataFetch = true;
          ranks["fb_likes"] = facebook.ranks.likes;
          ranks["fb_talking_about"] = facebook.ranks.talking_about;
        }

        const youtube = await socialBladeClient.youtube.user(item);
        if (youtube && youtube.ranks) {
          isDataFetch = true;
          ranks["yt_subscribers"] = youtube.ranks.subscribers;
          ranks["yt_views"] = youtube.ranks.views;
        }

        const twitch = await socialBladeClient.twitch.user(item);
        if (twitch && twitch.ranks) {
          isDataFetch = true;
          ranks["twitch_views"] = twitch.ranks.views;
          ranks["twitch_followers"] = twitch.ranks.followers;
        }
      }

      return {
        isDataFetch,
        ranks,
      };
    } catch (error) {
      return {
        isDataFetch: false,
        ranks,
      };
    }
  },

  getDomainInfo: async function (domain) {
    try {
      let data = await whoiser(domain);
      if (data && data["whois.verisign-grs.com"]) {
        return {
          name_server: data["whois.verisign-grs.com"]["Name Server"],
          domain_name: data["whois.verisign-grs.com"]["Domain Name"],
          registry_domain_id: data["whois.verisign-grs.com"]["Registry Domain ID"],
          registry_whois_server: data["whois.verisign-grs.com"]["Registrar WHOIS Server"],
          registrar_url: data["whois.verisign-grs.com"]["Registrar URL"],
          created_date: data["whois.verisign-grs.com"]["Created Date"],
          updated_date: data["whois.verisign-grs.com"]["Updated Date"],
          expiry_date: data["whois.verisign-grs.com"]["Expiry Date"],
          registrar: data["whois.verisign-grs.com"]["Registrar"],
          registrar_iana_id: data["whois.verisign-grs.com"]["Registrar IANA ID"],
          registrar_abuse_contact_email:
            data["whois.verisign-grs.com"]["Registrar Abuse Contact Email"],
          registrar_abuse_contact_phone:
            data["whois.verisign-grs.com"]["Registrar Abuse Contact Phone"],
        };
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  getPageSpeedData: async function (pageSpeedOptions) {
    try {
      const pageSpeed = await pagespeed(pageSpeedOptions);
      return pageSpeed;
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  getMetaData: async function (url) {
    try {
      const metadata = await urlMetadata(url);
      const post_array = JSON.stringify([
        {
          location_code: 2840,
          target: url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split("/")[0],
        },
      ]);
      const { data } = await axios({
        method: "post",
        url: "https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_site/live",
        data: post_array,
        headers: {
          "content-type": "application/json",
          Authorization: `Basic ${DATA_FOR_SEO_KEY}`,
        },
      });

      return {
        title: metadata.title,
        description: metadata.description,
        keywords: JSON.stringify(data.tasks[0]?.result),
      };
    } catch (error) {
      return false;
    }
  },

  getAllLocations: async function () {
    try {
      const { data } = await axios({
        method: "get",
        url: "https://api.dataforseo.com/v3/dataforseo_labs/locations_and_languages",
        headers: {
          "content-type": "application/json",
          Authorization: `Basic ${DATA_FOR_SEO_KEY}`,
        },
      });

      return data.tasks[0].result;
    } catch (error) {
      return false;
    }
  },

  updateMarkup: async (url_id, data) => {
    let markupFound = await DB.select("*")
      .from(MarkupModel.table)
      .where({ url_id })
      .first();
    if (markupFound) {
      markupFound = await DB(MarkupModel.table)
        .where({ id: markupFound.id })
        .update({
          ...data,
          updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
        })
        .returning("*");
      markupFound = markupFound[0];
    } else {
      markupFound = await DB(MarkupModel.table)
        .insert({
          url_id,
          ...data,
          created_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
          updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
        })
        .returning("*");
      markupFound = markupFound[0];
    }
    return markupFound;
  },

  updateSocialBlade: async (url_id, data) => {
    let socialBladeFound = await DB.select("*")
      .from(SocialBladeModel.table)
      .where({ url_id })
      .first();
    if (socialBladeFound) {
      socialBladeFound = await DB(SocialBladeModel.table)
        .where({ id: socialBladeFound.id })
        .update({
          ...data,
          updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
        })
        .returning("*");
      socialBladeFound = socialBladeFound[0];
    } else {
      socialBladeFound = await DB(SocialBladeModel.table)
        .insert({
          url_id,
          ...data,
          created_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
          updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
        })
        .returning("*");
      socialBladeFound = socialBladeFound[0];
    }
    return socialBladeFound;
  },

  updateDomainInfo: async (url_id, data) => {
    let domainInfoFound = await DB.select("*")
      .from(DomainInfoModel.table)
      .where({ url_id })
      .first();
    if (domainInfoFound) {
      domainInfoFound = await DB(DomainInfoModel.table)
        .where({ id: domainInfoFound.id })
        .update({
          ...data,
          updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
        })
        .returning("*");
      domainInfoFound = domainInfoFound[0];
    } else {
      domainInfoFound = await DB(DomainInfoModel.table)
        .insert({
          url_id,
          ...data,
          created_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
          updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
        })
        .returning("*");
      domainInfoFound = domainInfoFound[0];
    }

    return domainInfoFound;
  },

  updateMetadata: async (url_id, data) => {
    let metadataFound = await DB.select("*")
      .from(MetadataModel.table)
      .where({ url_id })
      .first();
    if (metadataFound) {
      metadataFound = await DB(MetadataModel.table)
        .where({ id: metadataFound.id })
        .update({
          ...data,
          updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
        })
        .returning("*");
      metadataFound = metadataFound[0];
    } else {
      metadataFound = await DB(MetadataModel.table)
        .insert({
          url_id,
          ...data,
          created_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
          updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
        })
        .returning("*");
      metadataFound = metadataFound[0];
    }
    return metadataFound;
  },

  updateExtraInfo: async (url_id, data) => {
    let extraInfoFound = await DB.select("*")
      .from(ExtraInfoModel.table)
      .where({ url_id })
      .first();

    if (extraInfoFound) {
      extraInfoFound = await DB(ExtraInfoModel.table)
        .where({ id: extraInfoFound.id })
        .update({
          ...data,
          updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
        })
        .returning("*");
      extraInfoFound = extraInfoFound[0];
    } else {
      extraInfoFound = await DB(ExtraInfoModel.table)
        .insert({
          url_id,
          ...data,
          created_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
          updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
        })
        .returning("*");
      extraInfoFound = extraInfoFound[0];
    }
    return extraInfoFound;
  },
  updateTrafficSource: async (url_id, data) => {
    let trafficSourceFound = await DB.select("*")
      .from(TrafficSourceModel.table)
      .where({ url_id })
      .first();

    if (trafficSourceFound) {
      trafficSourceFound = await DB(TrafficSourceModel.table)
        .where({ id: trafficSourceFound.id })
        .update({
          ...data,
          updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
        })
        .returning("*");
      trafficSourceFound = trafficSourceFound[0];
    } else {
      trafficSourceFound = await DB(TrafficSourceModel.table)
        .insert({
          url_id,
          ...data,
          created_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
          updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
        })
        .returning("*");
      trafficSourceFound = trafficSourceFound[0];
    }
    return trafficSourceFound;
  },
};
