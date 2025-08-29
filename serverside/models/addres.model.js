import mongoose from "mongoose";

const addressSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"users",required:true},
    name:{type:String,require:true},
    phone:{type:Number,require:true},
    pincode:{type:Number,require:true},
    locality:{type:String,require:true},
    address: { type: String, required: true },
    city:{type:String,require:true},
    state:{type:String,require:true},
    land:{type:String,},
    altrenativ:{type:String,},
})
export default mongoose.model.addres||mongoose.model("addres",addressSchema)
    