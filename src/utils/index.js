const crypto = require("crypto");
const config = process.env;

module.exports = {
  swaggerDynamicHost: function (swaggerDoc) {
    swaggerDoc.host =
      config.APP_ENV === "local"
        ? `${config.SERVER_HOST}:${config.SERVER_PORT}`
        : `${config.SERVER_HOST}`;
    return swaggerDoc;
  },
  isSomethingMissing: function (args) {
    const missing = [];
    for (const i in args) {
      if (args[i] == null || args[i] === undefined) {
        missing.push(i);
      }
    }
    return missing.length === 0 ? null : missing;
  },
  orderPriceCalculcation: function (service_type, document_type, number_of_signature) {
    let price = 0;
    // Service Type : // MOBILE_SERVICE, ONLINE_NOTARY, INTERNAL_NOTARY
    // Document Type: // SELLERS_DOCS, MRP_DOCS, PER_SIGNATURE

    if (service_type == "MOBILE_SERVICE") {
      if (document_type == "SELLERS_DOCS") {
        price = 150;
      } else if (document_type == "MRP_DOCS") {
        price = 200;
      } else if (document_type == "PER_SIGNATURE") {
        if (number_of_signature == 1) {
          price = 66;
        } else if (number_of_signature > 1) {
          price = number_of_signature * 15 + 51;
        }
      }
    } else if (service_type == "ONLINE_NOTARY") {
      if (document_type == "SELLERS_DOCS") {
        price = 120;
      } else if (document_type == "MRP_DOCS") {
        price = 170;
      } else if (document_type == "PER_SIGNATURE") {
        if (number_of_signature == 1) {
          price = 35;
        } else if (number_of_signature > 1) {
          price = number_of_signature * 12 + 23;
        }
      }
    } else if (service_type == "INTERNAL_NOTARY") {
      if (number_of_signature == 1) {
        price = 65;
      } else if (number_of_signature > 1) {
        price = number_of_signature * 12 + 53;
      }
    }

    return price;
  },
  generatePin: function () {
    return Math.floor(100000 + Math.random() * 900000);
  },
  generateToken: function () {
    return crypto.randomBytes(60).toString("base64");
  },
  Slugify: function (text, itemType = null) {
    const RandPrefixWithRandSuffix = (fullword, suffixLength = 2) => {
      if (!fullword) {
        return "";
      }
      const wordLen = fullword.length;
      const prefixLen = Math.floor(Math.random() * (wordLen + 1));

      const validChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let suffix = "";
      for (let i = 0; i < suffixLength; i++) {
        suffix += validChars[Math.floor(Math.random() * validChars.length)];
      }

      return fullword.slice(1, prefixLen) + "-" + suffix;
    };

    if (!text) {
      text = "placeholder";
    }

    text = RandPrefixWithRandSuffix(itemType) + text;
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w-]+/g, "") // Remove all non-word chars
      .replace(/--+/g, "-") // Replace multiple - with single -
      .replace(/^-+/, "") // Trim - from start of text
      .replace(/-+$/, ""); // Trim - from end of text
  },
  SlugifyFileName: function (fn) {
    const dotAt = fn.lastIndexOf(".");
    if (dotAt === -1) {
      return this.Slugify(fn);
    }
    return this.Slugify(fn.slice(0, dotAt)) + fn.slice(dotAt);
  },
  FirstWordCapitalized: (text) => {
    const firstWord = text.split(/(\s+)/)[0];
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
  },
  validateEmail: function (email) {
    /* eslint-disable-next-line no-useless-escape */
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  },
  shuffle: function (slice) {
    for (let i = slice.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slice[i], slice[j]] = [slice[j], slice[i]];
    }
    return slice;
  },
  makeRandomID: function (length) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },
  appRoutes: function () {
    const routes = [];
    require("app")._router.stack.forEach((s) => {
      const outerStacks = s.handle.stack;
      if (!outerStacks || outerStacks.length === 0) {
        return;
      }
      outerStacks.forEach((outerStack) => {
        if (!outerStack.route) {
          return;
        }
        const { path, stack } = outerStack.route;
        stack.forEach(({ name, method }) => {
          if (name !== "<anonymous>") {
            routes.push({ method, path, name });
          }
        });
      });
    });
    return routes;
  },
};
