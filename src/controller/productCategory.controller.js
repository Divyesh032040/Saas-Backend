const Product = require("../Model/product.model");
const ProductCategory = require("../Model/productCategory");
const logger = require("../logger")

const addProductCategory = async (req, res) => {
    try {
        const adminData = req.user;
        if (!adminData) {
            return res.status(400).json({
                status: false,
                message: "Admin token not found"
            });
        }

        //since we have a adminData so its req comes from admin but still its add security
        if(adminData.roll === "client"){
            return res.status(400).json({
                status:true,
                message:"only admin can add product category"
            })
        }

        const { categoryName, parentCategory } = req.body;

        // Validate input
        if (!categoryName || !parentCategory) {
            return res.status(400).json({
                status: false,
                message: "all fields are required"
            });
        }
        // Check if category already exists
        const Category = await ProductCategory.findOne({ categoryName , parentCategory });

        if(Category){
            return res.status(400).json({
                status: false,
                message: "Category already exists"
            });
        }

        
        const existingParentCategory = await ProductCategory.findOne({ parentCategory });

        //if we found users parent category in db , than new category will be its child category
let newCategory;
        if (existingParentCategory) {
            //create a product category where parent cat will be existingCategory.
            newCategory = await ProductCategory.create({
                categoryName,
                parentCategory:existingParentCategory._id, 
                createdBy: adminData._id 
            });
        }else{
            newCategory = await ProductCategory.create({
                categoryName,
                parentCategory:parentCategory, // If no parent, it's a root category
                createdBy: adminData._id 
            });
        }
    

        return res.status(201).json({
            status: true,
            message: "Category added successfully",
            data: newCategory
        });

    } catch (error) {
        logger.error("Error adding category:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

//delete all child if a given parent category id , if there is no child than delete that parent category
const deleteCategoryByParentId = async (req, res) => {
    try {
        const { id } = req.params;
        const userData = req.user;

        if (!userData) {
            return res.status(400).json({
                status: false,
                message: "Admin token not found"
            });
        }

        if (!id) {
            return res.status(400).json({
                status: false,
                message: "Product category ID is missing"
            });
        }

        // Find the category by ID
        const category = await ProductCategory.findById(id);
        if (!category) {
            return res.status(404).json({
                status: false,
                message: "Product category not found. Please provide a valid category ID."
            });
        }

        // Check if the category has child categories
        const childCategories = await ProductCategory.find({ parentCategory: id });

        if (childCategories.length > 0) {
            // Delete all child categories
            await ProductCategory.deleteMany({ parentCategory: id });
        }

        // Delete the parent category itself
        await ProductCategory.findByIdAndDelete(id);

        return res.status(200).json({
            status: true,
            message: "Category and its associated subcategories have been deleted successfully."
        });
    } catch (error) {
        logger.error("error delete product category", error)
        return res.status(500).json({
            status: false,
            message: "An error occurred while deleting the category.",
            error: error.message
        });
    }
};


const updateById = async(req , res) => {
    const userData = req.user;
    const {id} = req.params;

    if(!id){
        return res.status(400).json({
            status:false,
            message:"product category id not provided"
        })
    }

    if(!userData){
        return res.status(400).json({
            status:false,
            message:"admin token not found"
        })
    }

}


module.exports = { addProductCategory , deleteCategoryByParentId , updateById}
