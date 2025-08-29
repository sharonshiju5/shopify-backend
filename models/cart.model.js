import mongoose from "mongoose";

const cartSchema=new mongoose.Schema({
    product_id:{type:String,require:true},
    user_id:{type:String,require:true},
    quantity:{type:Number},
    size:{type:String}
    })
export default mongoose.model.cart||mongoose.model("cart",cartSchema)
    