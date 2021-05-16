const User = require("../../../models/User");
const Plan = require("../../../models/Plan");
const Payment = require("../../../models/Payment");
const phaseStatus = require("../../../services/constants/status");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { DateTime } = require("luxon");
const {
  getWeeklyMealPlan,
  getMealPlan,
} = require("../meal/mealPlanner");
const mealLimit = require("../../constants/mealLimit");
const { startPhasePlan } = require("./phaseService");

exports.paymentViaStripe = async (userId, plan, token) => {
  let user = await User.findById(userId).select("id email");

  const customer = await stripe.customers.create({
    email: token.email,
    source: token.id,
  });

  const charge = await stripe.charges.create({
    amount: plan.sellingPrice * 100, //by default price comes in cents
    currency: "inr",
    receipt_email: user.email,
    customer: customer.id,
    description: `Purchase of ${plan.name}`,
  });

  if (!charge) throw Error("Payment failed");
  if (charge) {
    let payment = await this.postPaymentUpdate(user.id, plan);
    return payment;
  }
};

exports.postPaymentUpdate = async (userId, plan) => {
  try {
    const startDate = DateTime.now();
    const expiryDate = DateTime.now().plus({ days: plan.duration });

    let user = {
      id: userId,
    };

    const payment = await Payment.create({
      userId: user.id,
      amount: plan.sellingPrice,
      currency: "inr",
      date: DateTime.now(),
      plan: plan.name,
    });

    user.currentPlan = {
      name: plan.name,
      price: plan.sellingPrice,
      paymentId: payment.id,
      startDate,
      expiryDate,
    };

    await User.findByIdAndUpdate(user.id, user);
    
    await startPhasePlan(user);

    return payment;
  } catch (error) {
    throw error;
  }
};
