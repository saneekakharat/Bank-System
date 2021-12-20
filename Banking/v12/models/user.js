var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    amount: Number,
    sender: String,
    id: String,
    receiver: String,
    receiver_lastname: String,
    receiver_account_number: String,
    unique: Number,
    createdAt: { type: Date, default: Date.now }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);