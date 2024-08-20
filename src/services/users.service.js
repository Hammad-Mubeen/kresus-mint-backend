const DB = require("../db");
const UserModel = require("../db/models/user.model");

const HTTP = require("../utils/httpCodes");
const Logger = require("../utils/logger");
const Sendgrid = require("../utils/sendgrid");
const mintNFT = require("../smartContractInteraction/mintNFT");

module.exports = {

  mintNFT: async ({ipfsHash}) => {
    try {

      if(!ipfsHash)
      {
        return {
          code: HTTP.NotFound,
          body: {
            message: "IPFS Hash have not been passed."
          }
        };
      }

      // hard coded for now, it will come from kresus provider
      let user = process.env.STATIC_USER;
      let userData = await DB(UserModel.table).where({ id: user});
      console.log("userData: ",userData);

      if(userData.length == 0)
      {
        return {
          code: HTTP.NotFound,
          body: {
            message: "User don't exist against this id."
          }
        };
      }

      let result = await mintNFT.mintNFTHelper(ipfsHash,userData[0].private_key);

      return {
        code: HTTP.Success,
        body: {
          message: "Successfully minted NFT.",
          result: result
        },
      };
    } catch (err) {
      Logger.error("user.service -> mintNFT \n", err);
      throw err;
    }
  },
  shareYourCreation: async ({emails},user) => {
    try {
      // get user nft from kresus provider

      if(!emails)
      {
          return {
            code: HTTP.NotFound,
            body: {
              message: "Email's array have not passed."
            }
          };
      }
      if(emails.length == 0)
      {
        return {
          code: HTTP.NotFound,
          body: {
            message: "Email's array passed have no emails."
          }
        };
      }
      if(emails.length > 3)
      {
        return {
          code: HTTP.BadRequest,
          body: {
            message: "Email's array passed have more than 3 emails."
          }
        };
      }

      let userData = await DB(UserModel.table).where({ id: user});
      console.log("userData: ",userData);

      if(userData.length == 0)
      {
        return {
          code: HTTP.NotFound,
          body: {
            message: "User don't exist against this id."
          }
        };
      }

      let sharedNFTEmails = userData[0].sharedNFTEmails;
      for (i=0;i<emails.length;i++)
      {
        await Sendgrid.shareYourCreation(emails[i], {
          NFT: "NFT",
        });
        if(!sharedNFTEmails.includes(emails[i]))
        {
          sharedNFTEmails.push(emails[i]);
        }
      }

      await DB(UserModel.table)
        .where({ id: user})
        .update({
          sharedNFTEmails : sharedNFTEmails
      });
      
      if(sharedNFTEmails.length == 3)
      {
        await DB(UserModel.table)
          .where({ id: user})
          .update({
            is_white_listed: true
        });
      }

      return {
        code: HTTP.Success,
        body: {
          message: "Successfully shared your NFT with your friends.",
        },
      };
    } catch (err) {
      Logger.error("user.service -> shareYourCreation \n", err);
      throw err;
    }
  },
  getYourSharedCreationInfo: async ( user ) => {
    try {
      let userData = await DB(UserModel.table).where({ id: user });
      console.log("userData: ",userData);
      if(userData.length == 0)
      {
        return {
          code: HTTP.NotFound,
          body: {
            message: "User don't exist against this id."
          }
        };
      }
      let sharedNFTEmails = userData[0].sharedNFTEmails;
      return {
        code: HTTP.Success,
        body: {sharedNFTEmails},
      };
    } catch (err) {
      Logger.error("user.service -> getYourSharedCreationInfo \n", err);
      throw err;
    }
  },
  getUserWhiteListStatus: async ( user ) => {
    try {
      let userData = await DB(UserModel.table).where({ email: user });
      console.log("userData: ",userData);
      if(userData.length == 0)
      {
        return {
          code: HTTP.NotFound,
          body: {
            message: "User don't exist against this email."
          }
        };
      }
      let whiteListedStatus = userData[0].is_white_listed;
      return {
        code: HTTP.Success,
        body: {whiteListedStatus},
      };
    } catch (err) {
      Logger.error("user.service -> getUserWhiteListStatus \n", err);
      throw err;
    }
  },
};
