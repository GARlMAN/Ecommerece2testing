const Orders = require("../schema/orderSchema");0
const Products = require("../schema/productSchema");
const ErrorHandler = require("../utils/errorhandler");
const CatchAsyncError = require("../middlewear/catchAsyncErrors");
const apiFeatures = require("../utils/apifeatures");
const catchAsyncErrors = require("../middlewear/catchAsyncErrors");

//create new order
exports.newOrder = CatchAsyncError(async(req, res, next) => { 
    const {orderItems, shippingInfo, paymentInfo, itemPrice, taxPrice, shippingPrice, totalPrice} = req.body;
    const order = await Orders.create({
        orderItems, shippingInfo, paymentInfo, itemPrice, taxPrice, shippingPrice, totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
    });
    res.status(201).json({
        success: true,
        order,
    });
}) 


// get Single Order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Orders.findById(req.params.id).populate(
      "user",
      "name email"
    );
  
    if (!order) {
      return next(new ErrorHander("Order not found with this Id", 404));
    }
  
    res.status(200).json({
      success: true,
      order,
    });
  });


// get logged in user  Orders
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Orders.find({ user: req.user._id });
  
    res.status(200).json({
      success: true,
      orders,
    });
  });
  

// get all Orders -- Admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Orders.find();
  
    let totalAmount = 0;
  
    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });
  
    res.status(200).json({
      success: true,
      totalAmount,
      orders,
    });
  });



// update Order Status -- Admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Orders.findById(req.params.id);
  
    if (!order) {
      return next(new ErrorHander("Order not found with this Id", 404));
    }
  
    if (order.orderStatus === "Delivered") {
      return next(new ErrorHander("You have already delivered this order", 400));
    }
  
    if (req.body.status === "Shipped") {
      order.orderItems.forEach(async (o) => {
        await updateStock(o.product, o.quantity);
      });
    }
    order.orderStatus = req.body.status;
  
    if (req.body.status === "Delivered") {
      order.deliveredAt = Date.now();
    }
  
    await order.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
    });
  });
  
  async function updateStock(id, quantity) {
    const product = await Product.findById(id);
  
    product.Stock -= quantity;
  
    await product.save({ validateBeforeSave: false });
  }



  // delete Order -- Admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Orders.findById(req.params.id);

  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }

  await order.remove();

  res.status(200).json({
    success: true,
  });
});