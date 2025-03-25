const express = require('express');
const productRouter = express.Router();
const {addProduct , deleteProduct , getAllProducts , getProductById , updateProductById } = require("../controller/product.controller");
const validation = require("../middleware/validationMiddleware");
const passport = require("passport");
const productSchema = require("../validation/productSchema");
const upload = require("../middleware/multer");



productRouter.route('/product/add/').post(
    passport.authenticate("jwt", { session: false }),
    upload.fields([                                    //multer middleware
        { name: 'productImage', maxCount: 1 },
    ]),
    // validation(productSchema),
    addProduct
)

productRouter.route('/product/remove/:id/').delete(
    passport.authenticate("jwt", { session: false }),
    deleteProduct
)

productRouter.route('/product/get/all/').get(
    passport.authenticate("jwt", { session: false }),
    getAllProducts
)

productRouter.route('/product/get/:id/').get(
    passport.authenticate("jwt", { session: false }),
    getProductById
)

productRouter.route('/product/update/:id').patch(
    passport.authenticate("jwt" , {session: false}),
    updateProductById
)

module.exports = productRouter
