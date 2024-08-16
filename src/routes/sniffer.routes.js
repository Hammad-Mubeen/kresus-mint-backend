const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const multer = require("../middlewares/multer");
const validate = require("../middlewares/validate");

const snifferController = require("../controllers/sniffer.controller");
const snifferValidation = require("../validations/sniffer.validation");

router.post(
  "/url",
  [auth, validate(snifferValidation.addUrls)],
  snifferController.addUrls
);
router.post(
  "/queueStats",
  [auth, validate(snifferValidation.getQueueStatus)],
  snifferController.getQueueStatus
);
router.get("/all", auth, snifferController.getUsersUrls);
router.get("/:queueId", auth, snifferController.getSniffedData);
router.delete("/:queueId", auth, snifferController.deleteQueue);

//   .post(
//     "/url-v2",
//     [auth, validate(snifferValidation.addUrlsV2)],
//     snifferController.addUrlsV2
//   )
//   .get(
//     "/:queueId",
//     [auth, validate(snifferValidation.getSniffedData)],
//     snifferController.getSniffedData
//   )
//   .get("/:queueId/markups", [auth], snifferController.getMarkupData)
//   .get("/:queueId/social-blades", [auth], snifferController.getSocialBladeData)
//   .get("/:queueId/domain-info", [auth], snifferController.getDomainInfoData)
//   .get("/:queueId/metadata", [auth], snifferController.getMetaData)
//   .get("/:queueId/extra-info", [auth], snifferController.getExtraInfo)
//   .get("/:websites/trackers", [auth], snifferController.getWebsiteTrackersData)
//   .post(
//     "/compare",
//     [auth, validate(snifferValidation.compare)],
//     snifferController.compareData
//   )
//   .delete(
//     "/queue/:queueId",
//     [auth, validate(snifferValidation.deleteQueue)],
//     snifferController.deleteQueue
//   )
//   .delete(
//     "/url/:urlId",
//     [auth, validate(snifferValidation.deleteUrl)],
//     snifferController.deleteUrl
//   )
//   .get(
//     "/:queueId/export",
//     [validate(snifferValidation.exportToCsv)],
//     snifferController.exportToCsv
//   )
//   .post(
//     "/pdf",
//     [auth, validate(snifferValidation.generatePdfLink), multer.singleFile("pdf")],
//     snifferController.generatePdfLink
//   );

module.exports = router;
