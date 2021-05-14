const mongoose = require('mongoose');
const gutTags = require('../services/constants/gutTags')
const phaseStatus = require('../services/constants/status')

const UserSchemaOld = new mongoose.Schema({
    
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
        planId: {type: mongoose.Schema.Types.ObjectId, ref: 'plan'},
        name: {type: String},
        price: {type: String},
        paymentId: {type: mongoose.Schema.Types.ObjectId, ref: 'payment'},
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




const mealPlanSchema = new mongoose.Schema({
    startDate: Date,
    endDate: Date,
    meals: [{
        breakfast: [mongoose.Schema.Types.ObjectId],
        lunch: [mongoose.Schema.Types.ObjectId],
        snacks: [mongoose.Schema.Types.ObjectId],
        dinner: [mongoose.Schema.Types.ObjectId], 
    }]
});

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
        startDate: {type: Date},
        expiryDate: {type: Date},
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
        phase: Number,
        week: Number,
        startDate: Date,
        endDate: Date,
        foodTest: String,
    },
    mealPlan: mealPlanSchema,
    phases: {
        phase1:{
            startDate: Date,
            endDate: Date,
            status: {
                type: String,
                default: phaseStatus.PENDING
            },
            week1: {
                // mealPlan: mealPlanSchema,
                status: {
                    type: String,
                    default: phaseStatus.PENDING
                },
                startDate: Date,
                endDate: Date,
            },
            week2: {
                // mealPlan: mealPlanSchema,
                status: {
                    type: String,
                    default: phaseStatus.PENDING
                },
                startDate: Date,
                endDate: Date,
            },
            week3: {
                // mealPlan: mealPlanSchema,
                status: {
                    type: String,
                    default: phaseStatus.PENDING
                },
                startDate: Date,
                endDate: Date,
            }
        },
        phase2: {
            startDate: Date,
            endDate: Date,
            status: {
                type: String,
                default: phaseStatus.PENDING
            },
            gluten: {
                // mealPlan: mealPlanSchema,
                status: {
                    type: String,
                    default: phaseStatus.PENDING
                },
                startDate: Date,
                endDate: Date,
            },
            dairy: {
                // mealPlan: mealPlanSchema,
                status: {
                    type: String,
                    default: phaseStatus.PENDING
                },
                startDate: Date,
                endDate: Date,
            },
        },
        phase3: {
            startDate: Date,
            endDate: Date,
            status: {
                type: String,
                default: phaseStatus.PENDING
            },
            egg:{
                status: {
                    type: String,
                    default: phaseStatus.PENDING
                },
                startDate: Date,
                endDate: Date,
            },
            soy:{
                status: {
                    type: String,
                    default: phaseStatus.PENDING
                },
                startDate: Date,
                endDate: Date,
            },
            corn:{
                status: {
                    type: String,
                    default: phaseStatus.PENDING
                },
                startDate: Date,
                endDate: Date,
            },
            redMeat:{
                status: {
                    type: String,
                    default: phaseStatus.PENDING
                },
                startDate: Date,
                endDate: Date,
            },
            grain:{
                status: {
                    type: String,
                    default: phaseStatus.PENDING
                },
                startDate: Date,
                endDate: Date,
            },
            fish:{
                status: {
                    type: String,
                    default: phaseStatus.PENDING
                },
                startDate: Date,
                endDate: Date,
            },
            crustacean:{
                status: {
                    type: String,
                    default: phaseStatus.PENDING
                },
                startDate: Date,
                endDate: Date,
            },
            seaFood:{
                status: {
                    type: String,
                    default: phaseStatus.PENDING
                },
                startDate: Date,
                endDate: Date,
            },
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

module.exports = mongoose.model('user', UserSchema);