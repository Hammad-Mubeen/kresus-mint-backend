const cron = require("node-cron");
const { RRule } = require("rrule");

const DB = require("../db");
const UrlModel = require("../db/models/url.model");

const { updateUrlData } = require("../services/sniffer.service");

module.exports = {
  runCronJob: async () => {
    try {
      const updateTime = "59 23 * * *";
      cron.schedule(updateTime, async () => {
        console.log(`Running the job at ${updateTime} every day`);
        const urls = await DB.select("*").from(UrlModel.table);
        for (let item of urls) {
          try {
            const rule = RRule.fromString(item.rrule);
            const date = rule.all()[0];
            if (date) {
              const todaydate = new Date().getDate();
              const currentMonth = new Date().getMonth();
              const rruledate = new Date(rule.all()[0]).getDate();
              const rruleMonth = new Date(rule.all()[0]).getMonth();
              if (currentMonth >= rruleMonth && todaydate >= rruledate) {
                await updateUrlData(item);
              }
            }
          } catch (error) {
            console.log("runCronJob error\n", error);
          }
        }
      });
    } catch (error) {
      console.log("runCronJob error\n", error);
    }
  },
};
