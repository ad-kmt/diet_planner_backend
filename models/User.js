const mongoose = require('mongoose');
const gutTags = require('../services/constants/gutTags')
const phaseStatus = require('../services/constants/status')

const UserSchema = new mongoose.Schema({
    
    firstName: {
        type: String,
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    account: {
        local:{
            password: {
                type: String,
            },
            resetPasswordLink: {
                data: String,
                default: ''
            }
        },
        google:{
            id: {
                type: String,
            },
            token: {
                type: String
            },
        },
        facebook:{
            id: String,
            token: String,
        },
    },
    contact: {type: Number},
    dateOfBirth: {type: Date},
    gender: {type: String},
    age: {type: Number},
    address: {
        street: {type: String},
        city: {type: String},
        state: {type: String},
        country: {type: String},
        pincode: {type: Number},
    },
    quizResponse: [{
        sectionNumber: {type: Number},
        sectionName: {type: String},
        questions: [{
            question: {type: String},
            type: {type: String},
            options: [
                {
                    option:{type: String},
                    selected: {type: Boolean}
                }
            ]
        }]
    }],
    currentPlan: {
        planId: {type: mongoose.Schema.Types.ObjectId},
        name: {type: String},
        price: {type: String},
        paymentId: {type: mongoose.Schema.Types.ObjectId},
        startDate: {type: Date},
        expiryDate: {type: Date}
    },
    healthRecords: {
        height: {type: Number},
        weight: {type: Number},
        desiredWeight: {type: Number},
        desiredCalories: {type: Number},
        desiredNutrients: {
            proteins: {type: Number},
            fats: {type: Number},
            carbs: {type: Number}
        },
        quizConclusion: [String],
        foodRestrictions: [String],
        activity: {type: String}
    }
});

module.exports = mongoose.model('user', UserSchema);


const mealPlanSchema = new mongoose.Schema({
    startDate: Date,
    endDate: Date,
    phase: String,
    meals: [{
        breakfast: mongoose.Schema.Types.ObjectId,
        lunch: mongoose.Schema.Types.ObjectId,
        snack: mongoose.Schema.Types.ObjectId,
        dinner: mongoose.Schema.Types.ObjectId, 
    }]
});

const UserSchemaNew = new mongoose.Schema({
    
    firstName: {
        type: String,
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    account: {
        local:{
            password: {
                type: String,
            },
            resetPasswordLink: {
                data: String,
                default: ''
            }
        },
        google:{
            id: {
                type: String,
            },
            token: {
                type: String
            },
        },
        facebook:{
            id: String,
            token: String,
        },
    },
    contact: {type: Number},
    dateOfBirth: {type: Date},
    gender: {type: String},
    age: {type: Number},
    address: {
        street: {type: String},
        city: {type: String},
        state: {type: String},
        country: {type: String},
        pincode: {type: Number},
    },
    quizResponse: {
        sectionNumber: {type: Number},
        sectionName: {type: String},
        questions: [{
            question: {type: String},
            type: {type: String},
            options: [
                {
                    option:{type: String},
                    selected: {type: Boolean}
                }
            ]
        }]
    },
    currentPlan: {
        name: {type: String},
        price: {type: String},
        paymentId: {type: mongoose.Schema.Types.ObjectId},
        expiry: {type: Date}
    },
    healthRecords: {
        height: {type: Number},
        weight: {type: Number},
        desiredWeight: {type: Number},
        desiredCalories: {type: Number},
        desiredNutrients: {
            proteins: {type: Number},
            fats: {type: Number},
            carbs: {type: Number}
        },
        quizConclusion: [String],
        foodRestrictions: [String],
        activity: {type: String}
    },
    currentPhase: {
        name: String,
        startDate: Date,
        endDate: Date,
        week: Number,
        foodTest: String,
    },
    mealPlan: {
        current: mealPlanSchema,
        next: mealPlanSchema,
    },
    phases: {
        phase1:{
            startDate: Date,
            endDate: Date,
            status: {
                type: String,
                default: phaseStatus.PENDING
            },
            week1: {
                mealPlan: mealPlanSchema,
                status: {
                    type: String,
                    default: phaseStatus.PENDING
                },
            },
            week2: {
                mealPlan: mealPlanSchema,
                status: {
                    type: String,
                    default: phaseStatus.PENDING
                },
            },
            week3: {
                mealPlan: mealPlanSchema,
                status: {
                    type: String,
                    default: phaseStatus.PENDING
                },
            }
        },
        phase2: {
            startDate: Date,
            endDate: Date,
            status: {
                type: String,
                default: phaseStatus.PENDING
            },
            week1: {
                mealPlan: mealPlanSchema,
                status: {
                    type: String,
                    default: phaseStatus.PENDING
                },
                foodTest: {
                    type: String,
                    default: gutTags.GLUTEN,
                },
            },
            week2: {
                mealPlan: mealPlanSchema,
                status: {
                    type: String,
                    default: phaseStatus.PENDING
                },
                foodTest: {
                    type: String,
                    default: gutTags.GLUTEN,
                },
            },
        },
        phase3: {
            startDate: Date,
            endDate: Date,
            status: {
                type: String,
                default: phaseStatus.PENDING
            },
            foodTest: {
                type: Array,
                default: [
                    {
                        name: gutTags.EGG,
                        mealPlan: mealPlanSchema,
                        status: {
                            type: String,
                            default: phaseStatus.PENDING
                        },
                    },
                    {
                        name: gutTags.SOY,
                        mealPlan: mealPlanSchema,
                        status: {
                            type: String,
                            default: phaseStatus.PENDING
                        },
                    },
                    {
                        name: gutTags.CORN,
                        mealPlan: mealPlanSchema,
                        status: {
                            type: String,
                            default: phaseStatus.PENDING
                        },
                    },
                    {
                        name: gutTags.RED_MEAT,
                        mealPlan: mealPlanSchema,
                        status: {
                            type: String,
                            default: phaseStatus.PENDING
                        },
                    },
                    {
                        name: gutTags.GRAIN,
                        mealPlan: mealPlanSchema,
                        status: {
                            type: String,
                            default: phaseStatus.PENDING
                        },
                    },
                    {
                        name: gutTags.FISH,
                        mealPlan: mealPlanSchema,
                        status: {
                            type: String,
                            default: phaseStatus.PENDING
                        },
                    },
                    {
                        name: gutTags.CRUSTACEAN,
                        mealPlan: mealPlanSchema,
                        status: {
                            type: String,
                            default: phaseStatus.PENDING
                        },
                    },
                ]
            }
        },
        phase4: {
            startDate: Date,
            status: {
                type: String,
                default: phaseStatus.PENDING
            },
        }
    }
});

