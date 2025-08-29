import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: String, },
    name: { type: String, },
    email: { type: String,  },
    phone: { type: Number,  },
    address: { type: Object, required: true },
    products: [{ type: Object, required: true }],  
    orderDate: { type: Date, default: Date.now },
    estimateDate: { type: Date, }   
});

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
