const express = require("express");
const router = express.Router({ caseSensitive: true });

const authRoutes = require("./auth.routes");
const packageRoutes = require("./package.routes");
const userRoutes = require("./user.routes");
const snifferRoutes = require("./sniffer.routes");
const stripeRoutes = require("./stripe.routes");

router.use("/package", packageRoutes);
router.use("/sniffer", snifferRoutes);
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/payments", stripeRoutes);

module.exports = router;
