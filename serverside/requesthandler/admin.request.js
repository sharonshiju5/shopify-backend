import adminSchema from "../models/admin.model.js"
import userSchema from "../models/user.models.js"
import productSchema from "../models/product.model.js"
import bcrypt from "bcrypt"
import pkg from 'jsonwebtoken';
import nodemailer from "nodemailer"
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587 ,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: "contacte169@gmail.com",
        pass: "ajviyfwmigdwdzxq",
    },
});

const {sign} = pkg; 

export async function adduser(req,res) {
    try {
        const { email, password, cpassword } = req.body;
    
        if (!email || !password || !cpassword) {
          return res.status(400).json({ msg: "Fields are empty" });
        }
    
        if (password !== cpassword) {
          return res.status(400).json({ msg: "Passwords do not match" });
        }
    
        const existingUser = await adminSchema.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ msg: "Email already exists" });
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed Password:", hashedPassword);
    
        await adminSchema.create({ email, password: hashedPassword });
    
        return res.status(201).json({ msg: "Successfully created" });
    
      } catch (error) {
        console.error("Registration Error:", error);
        return res.status(500).json({ msg: "Internal Server Error", error: error.message });
      }
}


export async function addminhome(req,res){
    try {
        const { email, password } = req.body;
    
        if (!email || !password) {
          return res.status(400).json({ msg: "Fields are empty" });
        }
    
        const user = await adminSchema.findOne({ email });
        if (!user) {
          return res.status(400).json({ msg: "Email is not valid" });
        }
    
        const success = await bcrypt.compare(password, user.password);
        console.log("Password Match:", success);
    
        if (!success) {
          return res.status(400).json({ msg: "Incorrect password" });
        }
    
        const token= await sign({userID:user._id},process.env.JWT_KEY,
          {expiresIn:"100h"})
    
        return res.status(200).json({ msg: "Successfully logged in", token });
    
      } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ msg: "Internal Server Error", error: error.message });
      }
}

export async function forgetPassword(req,res) {
    console.log(req.body);
    
    try {
           // send mail with defined transport object
           const email=req.body.email
           const info = await transporter.sendMail({
           from: 'contacte169@gmail.com', // sender address
           to: email, // list of receivers
           subject: "verify", // Subject line
           text: "Hello world?", // plain text body
           html: `<div style="padding: 20px; text-align: center;">
               <h2>Reset Your Password</h2>
               <p>Click the button below to reset your password:</p>
               <a href="http://localhost:5173/chaingepass" 
                  style="background-color: #4CAF50; 
                         color: white; 
                         padding: 14px 20px; 
                         text-decoration: none; 
                         border-radius: 4px;
                         display: inline-block;
                         margin: 10px 0;">
                   Reset Password
               </a>
           </div>`, 
          });
          console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.log(error);
        
    }
    
}

export async function chaingePassword(req,res) {
    try {
      
      const {email,password,cpassword,otp}=req.body
      if (!email|| !password|| !cpassword) {
        console.log(otp+"admin");
        return res.status(400).json({ msg: "Fields are empty" });
        }
        if (password !== cpassword) {
            return res.status(400).json({ msg: "Passwords do not match" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
            console.log("Hashed Password:", hashedPassword);
            const updatedUser = await adminSchema.findOneAndUpdate(
            { email },{ password: hashedPassword }
        );
        if (!updatedUser) {
            return res.status(404).json({ msg: "User not found" });
          }
    return res.status(200).json({ msg: "Password changed successfully" });
        
    } catch (error) {
        console.log(error);
        
    }
}


export async function showusers(req,res) {
  try {
   const users=await userSchema.find()
    res.status(200).send({msg:"users are",users})
  } catch (error) {
    console.log(error);
    
  }
}

export async function blockuser(req,res) {
  try {
    const{userId}=req.body
    const _id=userId
    console.log(userId);
    const users=await userSchema.findByIdAndUpdate(_id,[{$set:{block:{$not:"$block"}}}],{new:true});
    const seller=await userSchema.findById(_id)
    const prod = await productSchema.updateMany(
      { sellerId: seller.sellerId }, // Find products by sellerId
      [{ $set: { sellerblock: { $not: ["$sellerblock"] } } }] // Toggle sellerblock
  );
  
      res.status(201).send({msg:"suceesfully updated",users})
    console.log(users);
    
  } catch (error) {
    console.log(error);
    
  }
}


export async function showproduct(req,res) {
    try {
      const Data = await productSchema.find();
      return res.status(200).send({ msg: "Successfully fetched",Data})   
    } catch (error) {
        console.log(error);
        res.status(500).send({ error });
    }
}