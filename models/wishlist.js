import mongoose from "mongoose";

const wishlistSchema=new mongoose.Schema({
    product_id:{type:String,require:true},
    user_id:{type:String,require:true},
    })
export default mongoose.model.wishlist||mongoose.model("wishlist",wishlistSchema)
    