const Category = require("../models/category.model");
const slugify = require("slugify");

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        const exists = await Category.findOne({ name });

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Category already exists",
            });
        }

        const category = await Category.create({
            name,
            slug: slugify(name, { lower: true }),
        });

        res.status(201).json({
            success: true,
            category,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ name: 1 });

        res.status(200).json({
            success: true,
            categories,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
module.exports = {
    createCategory,
    getCategories,
};