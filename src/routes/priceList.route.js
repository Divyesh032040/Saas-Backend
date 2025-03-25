const express = require("express");
const priceListRouter = express.Router();
const { createPriceList } = require("../controller/priceList.controller");
const passport = require("passport");
const upload = require("../middleware/multer");
const validation = require("../middleware/validationMiddleware");



priceListRouter.route("/pricelist/create").post(
    passport.authenticate("jwt", { session: false }),
    createPriceList
);

module.exports = priceListRouter;





