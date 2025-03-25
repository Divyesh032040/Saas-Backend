const express = require('express');
const productCategoryRouter = express.Router();
const { addProductCategory ,
        deleteCategoryByParentId
} = require("../controller/productCategory.controller");
const validation = require("../middleware/validationMiddleware");
const passport = require("passport");
const productSchema = require("../validation/productSchema");
const upload = require("../middleware/multer");





productCategoryRouter.route('/product/category/add/').post(
    passport.authenticate("jwt", { session: false }),
    addProductCategory
)

productCategoryRouter.route('/product/category/delete/:id').delete(
    passport.authenticate("jwt", {session:false}),
    deleteCategoryByParentId
)









module.exports = productCategoryRouter
