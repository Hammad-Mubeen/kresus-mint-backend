const fs = require("fs");
const { parse } = require("csv-parse");

const DB = require("./../db/index");
const TrackerModel = require("./../db/models/sites_trackers.model");

const onlyUnique = (value, index, self) => {
  return self.indexOf(value) === index;
};

var sites = [];
var trackers = [];

// AVG parsing time is 7:30 minutes
const parseData = async () => {
  try {
    const data = await DB.select("site").from(TrackerModel.table);
    if (data.length === 0) {
      console.log("*** Database Trackers Process Started ***");
      fs.createReadStream("./src/db/sites_trackers.csv")
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on("data", async function (row) {
          sites.push([row[3], row[4]]);
        })
        .on("end", async function () {
          trackers = sites
            .map((s) => s[0])
            .filter(onlyUnique)
            .map((t) => ({
              site: t,
              trackers: sites
                .filter((s) => s[0] === t)
                .map((x) => x[1])
                .filter(onlyUnique),
            }));

          for (let item of trackers) {
            await DB(TrackerModel.table).insert({
              site: item.site,
              trackers: JSON.stringify(item.trackers),
            });
          }

          console.log("*** Database Trackers Process finished ***");
          process.exit(0);
        });
    } else {
      console.log("Data is alread parsed in DB.");
      process.exit(0);
    }
  } catch (error) {
    process.exit(1);
  }
};

process.on("message", (msg) => {
  msg.signal === true && parseData();
});
