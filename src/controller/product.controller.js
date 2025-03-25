const Product = require("../Model/product.model");
const ProductCategory = require("../Model/productCategory");
const logger = require("../logger")
const fs = require("fs");



//admin and superAdmin have access
const addProduct = async (req, res) => {
  
    try {
        const { productName, productActive, ProductCategoryName, salesPrice, HSN_SACCode } = req.body;

        const productImage = req.files.productImage[0].path;


        // Ensure req.user exists
        if (!req.user) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized"
            });
        }

        const adminData = req.user;

        // Ensure the user has the correct role
        if (adminData.roll !== "admin" && adminData.roll !== "superAdmin") {
            return res.status(403).json({
                status: false,
                message: "Only admins can add products"
            });
        }

        //get product category id by name
        const productCat = await ProductCategory.findOne({ProductCategoryName});

        if(!productCat){
            return res.status(400).json({
                status:false,
                message:"fail to find a productCategory"
            })
        }

        // Create a new product
        const product = await Product.create({
            adminId: adminData._id, // Assign admin's ID as clientId
            productName,
            productActive,
            productCategory:productCat._id,
            salesPrice,
            HSN_SACCode,
            productImage
        });

        // Successful response
        return res.status(201).json({
            status: true,
            message: "Product added successfully",
            data: product
        });

    } catch (error) {
        logger.error("Error adding product:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

//admin and superAdmin have access
const deleteProduct = async (req, res) => {
    try {

        const { id } = req.params;

        // Ensure req.user exists
        if (!req.user) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized"
            });
        }

        const adminData = req.user;

        // Ensure the user has the correct role
        if (adminData.roll !== "admin" && adminData.roll !== "superAdmin") {
            return res.status(403).json({
                status: false,
                message: "Only admins can remove products"
            });
        }


        // Check if the product exists
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                status: false,
                message: "Product not found"
            });
        }

        const productImagePath = product?.productImage;

        if(productImagePath){
            fs.unlink(productImagePath, (err) => {
                if (err && err.code !== "ENOENT") {
                    logger.error(`Error deleting file: ${filePath}`, err);
                    reject(err);
                }
            })
        }

        // Delete the product
        const response = await Product.findByIdAndDelete(id);

        return res.status(200).json({
            status: true,
            message: "Product and productMedia deleted successfully",
            response
        });

    } catch (error) {
        logger.error("Error removing product:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

//everyone have access
const getAllProducts = async (req, res) => {
    try {
        const adminData = req.user;
        const clientData = req.client;

        let filter = {}; // Initialize filter object

        if (adminData?._id) {
            filter.adminId = adminData._id; // Fetch products for the admin
        } else if (clientData?._id) {
            filter.adminId = clientData.adminId; // Fetch products for the client's associated admin
        }

        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Fetch paginated products and count total products
        const [products, totalProducts] = await Promise.all([
            Product.find(filter).skip(skip).limit(limit),
            Product.countDocuments(filter)
        ]);

        return res.status(200).json({
            status: true,
            message: "Products retrieved successfully",
            data: {
                products,
                totalProducts,
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                hasNextPage: page * limit < totalProducts,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        logger.error("Error fetching products:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

const getProductById = async (req, res) => {
    try {                                                                                                       
        const { id } = req.params;

        if(!id){
            return res.status(400).json({
                status:false,
                message:"product id missing"
            })
        }

        // Fetch the product by ID
        const product = await Product.findById(id);

        // Check if product exists
        if (!product) {
            return res.status(404).json({
                status: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            status: true,
            message: "Product retrieved successfully",
            data: product
        });

    } catch (error) {
        logger.error("Error fetching product:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

const updateProductById = async (req, res) => {
    try {
        const { id } = req.params; // Get product ID from URL params
        const updateData = req.body; // Get update payload
        const userData = req.user; // Get user data from request

        // Check if the user has admin or superAdmin role

        if (userData.roll !== "admin" && userData.roll !== "superAdmin") {
            return res.status(403).json({
                status: false,
                message: "Only admins can add products"
            });
        }

        // Find product by ID
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Handle image update if provided
        if (req.file) {
            updateData.productImage = req.file.path; // Assuming Multer is used for file uploads
        }

        // Update only the provided fields using $set operator
        const updatedProduct = await Product.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });

        res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};



module.exports = { 
    addProduct, 
    deleteProduct, 
    getAllProducts, 
    getProductById , 
    updateProductById 
};


    









