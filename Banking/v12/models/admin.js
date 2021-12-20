var mongoose                = require("mongoose"),
    passportLocalMongoose   = require("passport-local-mongoose");
    
var adminSchema = new mongoose.Schema({
    username: String,
    password: String,
    first_name: String,
    last_name: String,
    date: String,
    address: String,
    phone: Number,
    email: String,
    createdAt: { type: Date, default: Date.now },
    city: String,
    state: String,
    pin_code: String,
    aadhar: Number,
    pan: String,
    unique: Number,
    account_number:{ type: String, default: 0},
    account_balance: { type: Number, min: 0, default: 0},
    status: { type: Boolean, default: false},
    blocked: { type: Boolean, default: false},
    pin: { type: Number, default: 0},
    admin_status: { type: Boolean, default: false}
});

adminSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("admin", adminSchema);
