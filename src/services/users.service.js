const moment = require("moment");

const DB = require("../db");
const UserModel = require("../db/models/user.model");
const { fileUpload, deleteFile } = require("../utils/S3Config");
const { v4: uuidv4 } = require("uuid");

const HTTP = require("../utils/httpCodes");
const Logger = require("../utils/logger");
const { AWS_BUCKET_BASE_URL } = process.env;

module.exports = {
  user: async ({ user }) => {
    try {
      return {
        code: HTTP.Success,
        body: {
          ...UserModel.whitelist(user),
        },
      };
    } catch (err) {
      Logger.error("user.service -> user \n", err);
      throw err;
    }
  },
  updateUser: async ({ firstName, lastName }, { user }) => {
    try {
      await DB(UserModel.table)
        .where({ id: user.id })
        .update({
          first_name: firstName,
          last_name: lastName,
          updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
        });

      return {
        code: HTTP.SuccessNoContent,
        body: {},
      };
    } catch (error) {
      Logger.error("users.service -> updateUser \n", error);
      throw err;
    }
  },
  updateImage: async (profile, { user }) => {
    try {
      if (profile && profile.length !== 0) {
        if (user.image_url) await deleteFile(user.image_url);

        const url = `User/${uuidv4()}${moment().format("YYYY-MM-DDTHH:mm:ss")}`;

        await fileUpload(url, profile.buffer, profile.mimetype);

        await DB(UserModel.table)
          .where("id", user.id)
          .update({
            image_url: `${AWS_BUCKET_BASE_URL}/${url}`,
            updated_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
          });
      }

      return {
        code: HTTP.Success,
        body: {},
      };
    } catch (err) {
      Logger.error("users.service -> updateImage \n", err);
      throw err;
    }
  },
};
