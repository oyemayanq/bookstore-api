const express = require("express");

const checkAuth = require("../middlewares/check-auth");
const orderControllers = require("../controllers/orders-controllers");

const router = express.Router();

router.use(checkAuth);

router.post("/", orderControllers.addOrderItems);

router.get("/", orderControllers.getOrdersByUserId);

router.get("/:orderId", orderControllers.getOrderById);

module.exports = router;
