require("dotenv").config();
const DB = require("../db");
const UserModel = require("../db/models/user.model");
const NFTModel = require("../db/models/nfts.model");

const HTTP = require("../utils/httpCodes");
const Logger = require("../utils/logger");
const Sendgrid = require("../utils/sendgrid");
const mintNFT = require("../smartContractInteraction/mintNFT");

module.exports = {

  mintNFT: async ({ ipfsHash, vaultAddress }) => {
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

      if(!vaultAddress)
      {
          return {
            code: HTTP.NotFound,
            body: {
              message: "vaultAddress have not been passed."
            }
          };
      }

      let result = await mintNFT.mintNFTHelper(ipfsHash,vaultAddress,process.env.PRIVATE_KEY);

      let userData = await DB(UserModel.table).where({vaultAddress: vaultAddress});
      console.log("userData: ",userData);

      if(userData.length == 0)
      {
        console.log("User don't exist against this vaultAddress, creating new user");
        const newUser = await DB(UserModel.table)
        .insert({
          vaultAddress,
        })
        .returning("*");
        console.log("newUser: ",newUser);
      }
      
      return {
        code: HTTP.Success,
        body: {
          message: "Successfully minted NFT on the vaultAddress = ." + vaultAddress,
          NFTHash: result
        },
      };
    } catch (err) {
      Logger.error("user.service -> mintNFT \n", err);
      throw err;
    }
  },
  shareYourCreation: async ({vaultAddress, name, description,nftId, nftURL, emails}) => {
    try {

      console.log("name: ",name);
      if(!vaultAddress)
      {
          return {
            code: HTTP.NotFound,
            body: {
              message: "vaultAddress have not passed."
            }
          };
      }
      if(!nftId)
      {
            return {
              code: HTTP.NotFound,
              body: {
                message: "nftId have not passed."
              }
            };
      }
      if(!name)
        {
              return {
                code: HTTP.NotFound,
                body: {
                  message: "nft name have not passed."
                }
              };
        }
      if(!description)
      {
            return {
              code: HTTP.NotFound,
              body: {
                message: "nft description have not passed."
              }
            };
      }
      if(!nftURL)
      {
            return {
              code: HTTP.NotFound,
              body: {
                message: "nftURL have not passed."
              }
            };
      }
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

      let userData = await DB(UserModel.table).where({ vaultAddress: vaultAddress});
      console.log("userData: ",userData);
      
      if(userData.length == 0)
      {
        return {
          code: HTTP.NotFound,
          body: {
            message: "User don't exist against this vaultAddress. Please mint an nft first to share."
          }
        };
      }

      let nftData = await DB(NFTModel.table).where({ nftId: nftId});
      console.log("nftData: ",nftData);
      
      if(nftData.length == 0)
      {
          console.log("NFT is not created against this nftId, creating nft data");
          nftData = await DB(NFTModel.table)
          .insert({
            nftId,
            nftURL,
            name,
            description,
            vaultAddress,
            sharedNFTEmails: {}
          })
          .returning("*");
          console.log("new nftData: ",nftData);
      }

      let sharedNFTEmails = nftData[0].sharedNFTEmails;
      for (i=0;i<emails.length;i++)
      {
        await Sendgrid.shareYourCreation(
          emails[i],
          vaultAddress,
          nftId,
          name,
          description,
          nftURL
        );
        if(!sharedNFTEmails.includes(emails[i]))
        {
          sharedNFTEmails.push(emails[i]);
        }
      }

      await DB(NFTModel.table)
        .where({ nftId: nftId})
        .update({
          sharedNFTEmails : sharedNFTEmails
      });
      
      if(sharedNFTEmails.length == 1)
      {
        await DB(UserModel.table)
          .where({ vaultAddress: vaultAddress})
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
  getYourSharedCreationInfo: async ( vaultAddress,nftId ) => {
    try {
      console.log("vaultAddress: ",vaultAddress);
      console.log("nftId: ",nftId);
      let nftData = await DB(NFTModel.table).where({ nftId: nftId, vaultAddress:vaultAddress });
      console.log("nftData: ",nftData);
      if(nftData.length == 0)
      {
        return {
          code: HTTP.NotFound,
          body: {
            message: "NFT don't exist against this id."
          }
        };
      }
      let sharedNFTEmails = nftData[0].sharedNFTEmails;
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
      let userData = await DB(UserModel.table).where({ vaultAddress: user });
      console.log("userData: ",userData);
      if(userData.length == 0)
      {
        return {
          code: HTTP.NotFound,
          body: {
            message: "User don't exist against this vaultAddress."
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
