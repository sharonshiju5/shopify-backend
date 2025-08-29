import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fname: { type: String, require: true },
    lname: { type: String, require: true },
    phone: { type: Number, require: true },
    email: { type: String, require: true },
    account: { type: String, require: true },
    password: { type: String, require: true },
    licence: { type: String },
    company: { type: String },
    sellerId: { type: String, sparse: true },
    joiningDate: { type: Date, default: Date.now },
    block:{type:Boolean} 
});

export default mongoose.model.user || mongoose.model("user", userSchema);
