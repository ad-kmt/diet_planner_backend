const User = require("../../../models/User");
const Plan = require("../../../models/Plan");
const Payment = require("../../../models/Payment");
const phaseStatus = require("../../../services/constants/status");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { DateTime } = require("luxon");
const {
  getMealPlan,
} = require("../meal/mealPlanner");
const mealLimit = require("../../constants/mealLimit");
const { startPhasePlan } = require("./phaseService");
const ApiError = require("../../../utils/ApiError");
const { http } = require("winston");
const httpStatus = require("http-status");
const { INTERNAL_SERVER_ERROR } = require("http-status");

exports.paymentViaStripe = async (userId, plan, token) => {
  let user = await User.findById(userId).select("id email");

  if(!user){
    throw new ApiError(httpStatus.BAD_REQUEST, "user doesn't exist");
  }
  const customer = await stripe.customers.create({
    email: token.email,
    source: token.id,
  });

  const charge = await stripe.charges.create({
    amount: plan.onsalePrice * 100, //by default price comes in cents
    currency: "inr",
    receipt_email: user.email,
    customer: customer.id,
    description: `Purchase of ${plan.name}`,
  });

  if (!charge) throw new ApiError(INTERNAL_SERVER_ERROR, "Payment failed from Stripe");
  if (charge) {
    let payment = await this.postPaymentUpdate(user.id, plan);
    if(!payment){
      throw new ApiError(INTERNAL_SERVER_ERROR, "Payment could not be updated in database");
    } 
    return payment;
  }
};

exports.postPaymentUpdate = async (userId, plan) => {
  try {
  
    if(!plan){
      throw new ApiError(httpStatus.BAD_REQUEST, "Plan cannont be null");
    }

    let user = {
      id: userId,
    };

    //Need to add Plan Id
    const payment = await Payment.create({
      userId: user.id,
      amount: plan.sellingPrice,
      currency: "inr",
      date: DateTime.now(),
      planId: plan.id,
    });

    user.currentPlan = {
      planId: plan.id,
      name: plan.name,
      price: plan.sellingPrice,
      paymentId: payment.id,
      duration: plan.duration,
    };

    await User.findByIdAndUpdate(user.id, user);

    return payment;
  } catch (error) {
    throw error;
  }
};
