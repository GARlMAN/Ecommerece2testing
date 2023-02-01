const express = require("express");

//Product Controlers//
const { getAllProducts, createProducts, updateProducts, deleteProducts, productDeatils, createProductReview, getAllReviews, deleteReviews} = require("../controllers/productController");

//authentication of users//
const {isAuthenticatedUser, authorizeRoles} = require("../middlewear/authentication");

const router = express.Router();


router.route("/products").get(getAllProducts);


router.route("/admin/products/new").post(isAuthenticatedUser, authorizeRoles("admin"),  createProducts);



router.route("/admin/products/:id")
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateProducts)
    .delete(isAuthenticatedUser, authorizeRoles("admin"),  deleteProducts)


router.route("/admin/products/:id").get(productDeatils);
router.route("/review").put(isAuthenticatedUser, createProductReview);


router.route("/reviews").get(getAllReviews).delete(isAuthenticatedUser, deleteReviews);

module.exports = router;

