const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load(`./docs/swagger.yaml`);

module.exports.routes = (router) => {
  router.use("/", swaggerUi.serve);
  router.route("/").get(swaggerUi.setup(swaggerDocument));
  return router;
};
