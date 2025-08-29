import mongoose from "mongoose";

const adminSchema=new mongoose.Schema({
    // fname:{type:String,require:true},
    // lname:{type:String,require:true},
    // phone:{type:Number,require:true},
    email:{type:String,require:true},
    // account:{type:String,require:true},
    password:{type:String,require:true},
})
export default mongoose.model.admin||mongoose.model("admin",adminSchema)
    