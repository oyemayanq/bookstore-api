const Order = require("../models/order");
const User = require("../models/user");
const Book = require("../models/book");
const HttpError = require("../models/http-error");

async function addOrderItems(req, res, next) {
  const { orderItems, totalPrice } = req.body;

  if (!orderItems || orderItems.length === 0 || totalPrice === 0) {
    const error = new HttpError("No order items", 400);

    return next(error);
  }

  let booksFromDB;
  try {
    booksFromDB = await Book.find({
      _id: { $in: orderItems.map((item) => item.id) },
    });
  } catch (err) {
    const error = new HttpError(
      500,
      "Could not place your order. Please try again, later."
    );
    return next(error);
  }

  const newOrderItems = orderItems.map((itemFromClient) => {
    const matchingItemFromDB = booksFromDB.find(
      (dbItem) => dbItem._id.toString() === itemFromClient.id
    );
    return {
      ...itemFromClient,
      price: matchingItemFromDB.price,
      book: matchingItemFromDB._id,
      id: undefined,
    };
  });

  const newTotalPrice = newOrderItems.reduce(
    (initial, item) => initial + item.price * item.quantity,
    0
  );

  const order = new Order({
    user: req.userId,
    orderItems: newOrderItems,
    totalPrice: newTotalPrice,
  });

  try {
    await order.save();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      500,
      "Could not place your order. Please try again, later."
    );
    return next(error);
  }

  res.status(200).json({ order: order });
}

async function getOrdersByUserId(req, res, next) {
  const { userId } = req;

  let orders;
  let user;
  try {
    orders = await Order.find({ user: userId });
    user = await User.findById(userId).select("name");
  } catch (err) {
    console.log(err);
    const error = new HttpError(500, "Could not find your orders.");
    return next(error);
  }

  if (!orders) {
    const error = new HttpError(500, "Could not find your orders.");
    return next(error);
  }

  res.status(200).json({ orders, user });
}

async function getOrderById(req, res, next) {
  const { orderId } = req.params;

  let order;
  try {
    order = await Order.findById(orderId).populate({
      path: "user",
      select: ["name", "email"],
    });
  } catch (err) {
    console.log(err);
    const error = new HttpError(500, "Could not find your orders.");
    return next(error);
  }

  if (!order) {
    const error = new HttpError(500, "Could not find your order.");
    return next(error);
  }

  res.status(200).json({ order });
}

exports.addOrderItems = addOrderItems;
exports.getOrdersByUserId = getOrdersByUserId;
exports.getOrderById = getOrderById;
