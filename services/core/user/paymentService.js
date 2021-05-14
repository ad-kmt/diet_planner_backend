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

    //PHASE 1
    let phaseStartDate = DateTime.now().plus({ days: 1 });
    let phaseEndDate = phaseStartDate.plus({ days: 20 });
    let weekEndDate = phaseStartDate.plus({ days: 6 });

    user.currentPhase = {
      phase: 1,
      week: 1,
      startDate: phaseStartDate,
      endDate: weekEndDate,
    };

    user.phases = {
      phase1: {
        startDate: phaseStartDate,
        endDate: phaseEndDate,
        status: phaseStatus.IN_PROGRESS,
        week1: {
          startDate: phaseStartDate,
          endDate: weekEndDate,
          status: phaseStatus.IN_PROGRESS,
        },
      },
    };
    let { meals } = await getMealPlan({
      userId: user.id,
      mealMaxLimit: mealLimit.DEFAULT,
      days: 7,
      gutHealing: true,
    });
    
    user.mealPlan = {
      startDate: phaseStartDate,
      endDate: weekEndDate,
      meals,
    };
    
    // console.log(user);
    await User.findByIdAndUpdate(user.id, user);

    return payment;
  } catch (error) {
    throw error;
  }
};
