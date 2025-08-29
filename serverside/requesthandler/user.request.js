import userSchema from "../models/user.models.js"
import addresSchema from "../models/addres.model.js"
import productSchema from "../models/product.model.js"
import cartSchema from "../models/cart.model.js"

import bcrypt from "bcrypt"
import pkg from 'jsonwebtoken';
import nodemailer from "nodemailer"
import mongoose from "mongoose";




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


export async function adduser(req, res) {
    try {
        const { fname, lname, email, account, phone, password, cpassword, licence,company ,block=false} = req.body;
        console.log(licence);
        
        if (!(fname && lname && email && account && phone && password && cpassword)) {
            return res.status(400).send({ msg: "Fields are empty" });
        }
    
        if (password !== cpassword) {
            return res.status(400).send({ msg: "Passwords do not match" });
        }
    
        const existingUser = await userSchema.findOne({ email });
        if (existingUser) {
            return res.status(409).send({ msg: "Email already exists" }); // 409 for conflict
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);

        let sellerId = null;
        
        if (account === "seller") {
            let isUnique = false;
            while (!isUnique) {
                sellerId = "SELLER-" + Math.floor(100000 + Math.random() * 900000);
                const existingSeller = await userSchema.findOne({ sellerId });
                if (!existingSeller) isUnique = true;
            }
            await userSchema.create({ 
                fname, 
                lname, 
                email, 
                account, 
                phone, 
                password: hashedPassword, 
                sellerId, 
                licence, 
                company, 
                joiningDate: new Date(),
                block,
            });
        return res.status(201).send({ msg: "Successfully created", sellerId });

        }
        else{

            await userSchema.create({ 
                fname, 
                lname, 
                email, 
                account, 
                phone, 
                password: hashedPassword, 
                joiningDate: new Date(),
                block,
            });
        }


        return res.status(201).send({ msg: "Successfully created", });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ msg: "Internal Server Error", error: error.message });
    }
}


export async function logine(req,res){
    try {
        const { email, password } = req.body;
    
        if (!email || !password) {
          return res.status(400).json({ msg: "Fields are empty" });
        }
    
        const user = await userSchema.findOne({ email });
        if (!user) {
          return res.status(400).json({ msg: "Email is not valid" });
        }
    
        const success = await bcrypt.compare(password, user.password);
        console.log("Password Match:", success);
    
        if (!success) {
          return res.status(400).json({ msg: "Incorrect password" });
        }
    
        const token= await sign({userID:user._id},process.env.JWT_KEY,
          {expiresIn:"24h"})
        //   const userId = await userSchema.findOne({ email },{_id});
        if (user.block===true){

            return res.status(200).json({ msg: "you hav been blocked by the user"});
        }else{
            return res.status(200).json({ msg: "Successfully logged in", token,email,userId: user._id  });
        }
    
      } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ msg: "Internal Server Error", error: error.message });
      }
}

export async function forgetPassword(req,res) {

    console.log(req.body);
    
    try {
            const email=req.body.email
            const info = await transporter.sendMail({
            from: 'contacte169@gmail.com', // sender address
            to: email, // list of receivers
            subject: "verify", // Subject line
            text: "Hello world?", // plain text body
            html: `<div style="padding: 20px; text-align: center;">
                <h2>Reset Your Password</h2>
                <p>Click the button below to reset your password:</p>
                <a href="http://localhost:5173/userchaingepass" 
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

        const {email,password,cpassword}=req.body

        if (!email|| !password|| !cpassword) {

            return res.status(400).json({ msg: "Fields are empty" });

        }
        if (password !== cpassword) {

            return res.status(400).json({ msg: "Passwords do not match" });

        }
        const hashedPassword = await bcrypt.hash(password, 10);

            console.log("Hashed Password:", hashedPassword);

            const updatedUser = await userSchema.findOneAndUpdate(
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


// profile section
// profile section
// profile section
// profile section


export async function profile(req,res) {
    try {
        // console.log(res);

        const {email}=req.body

        console.log(email);

        const user = await userSchema.find({email});

        console.log(user);

        return res.status(200).json({ msg: "Successfully logged in",user });
        
            
    } catch (error) {
        console.log(error);

    }
}



export async function saveprofile(req,res) {
    try {
        // console.log(res);
        const {email,fname,lname,phone,}=req.body

        console.log(email);

        const user = await userSchema.findOneAndUpdate({email},{email,fname,lname,phone});

        console.log(user);

        return res.status(200).json({ msg: "Successfully updated in",user });
        
            
    } catch (error) {
        console.log(error);

    }
}


// address 
// address 
// address 

export async function addaddress(req, res) {
    try {
        const { userId, name, pincode, phone, locality, address, city, state, land, alternative } = req.body;

        if (!(userId && name && phone && pincode && locality && address && city && state)) {
            return res.status(400).send({ msg: "Fields are empty" });
        }

        const user = await userSchema.findById(userId);
        if (!user) {
            return res.status(404).send({ msg: "User not found" });
        }

        await addresSchema.create({userId: user._id,userEmail: user.email, name,phone,pincode,locality,address,city,state,land,alternative});

        return res.status(201).send({ msg: "Successfully created" });

    } catch (error) {
        console.error(error);  
        res.status(500).send({ error });
    }
}


export async function showaddress(req,res) {
    try {
        const { userId} = req.body;
        console.log(userId);
        
        const address = await addresSchema.find({userId});
        console.log(address);
        if (address.length === 0) {
            return res.status(404).json({ message: "No addresses found for this user" });
        }
        return res.status(200).send({address});
        
    } catch (error) {
        console.log(error);
        res.status(500).send({ error });
    }
}

export async function deleteaddress(req,res) {
    try {
        const { _id} = req.body;
        console.log(_id);
        
        const addresses = await addresSchema.findOneAndDelete({_id}); 
           
             console.log(addresses);
        return res.status(201).send({ msg: "Successfully deleted",addresses });
        
    } catch (error) {
        console.log(error);
        res.status(500).send({ error });
    }
}


//product section
//product section
//product section


export async function addProduct(req, res) {
    try {

        const { userId, name, brand, category, price, stock, sizes, images, material, description,block=false ,sellerblock=false} = req.body;

        if (!userId) {
            return res.status(400).send({ msg: "User ID is required" });
        }

        const user = await userSchema.findById(userId);
        if (!user || !user.sellerId) {
            return res.status(404).send({ msg: "Seller ID not found for this user" });
        }
        const sellerId = user.sellerId; 


        if (!Array.isArray(images) || images.length === 0 || images.some(img => typeof img !== "string" || !img.trim())) {
            return res.status(400).send({ msg: "Invalid images field. Must be an array of image URLs." });
        }

        const newProduct = await productSchema.create({
            name,
            brand,
            category,
            price,
            stock,
            sizes,
            images,
            material,
            description,
            sellerId,
            block,
            sellerblock,
        });

        console.log("New Product Created:", newProduct); 

        return res.status(201).send({ msg: "Product successfully added", productId: newProduct._id });
    
    } catch (error) {
        console.error("Error in addProduct:", error);
        res.status(500).send({ msg: "Internal Server Error", error: error.message });
    }
}


export async function fetchProduct(req,res) {
    try {
        const{userId}=req.body
        const user = await userSchema.findById(userId);
        const sellerId = user.sellerId; 
        const products = await productSchema.find({ sellerId });
        return res.status(200).send({ msg: "Products fetched successfully", products });
    } catch (error) {
        console.log(error);
        res.status(500).send({ msg: "Internal Server Error", error: error.message });
    }
}

export async function deleteproduct(req,res) {
    try {
        const{productId}=req.body
        console.log("prodid is"+productId);
        
        const product = await productSchema.findByIdAndDelete(productId);
        // console.log(product);
        return res.status(201).send({ msg: "Successfully deleted", });
        
    } catch (error) {
        console.log(error);
        res.status(500).send({ error });
    }
}

export async function showproduct(req,res) {
    try {
        const {user_id}=req.body
        const _id=user_id
        console.log(user_id+"id is");
        
        const sellerId=await userSchema.findById(_id)
        const block=await userSchema.find({block:false})

        if (sellerId) {
            console.log(sellerId+"seller");
            
            const Data = await productSchema.find({ sellerId: { $ne: sellerId.sellerId },block:false,sellerblock:false });
            return res.status(200).send({ msg: "Successfully fetched",Data})
        }
        else{
            const Data = await productSchema.find();
            return res.status(200).send({ msg: "Successfully fetched",Data})

        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ error });
    }
}


export async function updateproduct(req, res) {
    try {
        const { productid, name, brand, category, price, stock, sizes, images, material, description } = req.body;

        console.log("Received product ID:", productid);

        if (!productid || typeof productid !== "string") {
            return res.status(400).json({ error: "Invalid Product ID: ID is missing or not a string" });
        }

        if (!mongoose.Types.ObjectId.isValid(productid)) {
            return res.status(400).json({ error: "Invalid Product ID format" });
        }

        const updatedProduct = await productSchema.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(productid) },{ name, brand, category, price, stock, sizes, images, material, description },

        );

        if (!updatedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        return res.status(200).json({ msg: "Product updated successfully", updatedProduct });
        
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function addoffer(req, res) {
    try {
        const { _id, offer } = req.body;

        if (!_id || offer === undefined) {
            return res.status(400).json({ error: "Product ID and offer are required" });
        }

        const updatedProduct = await productSchema.findOneAndUpdate({ _id },{$set:{offer:offer}},{new:true,runValidators:true});

        if (!updatedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        console.log("Updated Product:", updatedProduct);
        res.status(200).json({ msg: "Offer updated successfully", updatedProduct });
    } catch (error) {
        console.error("Error updating offer:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export async function blockProduct(req,res) {
    try {
        const{_id}=req.body
        const updatedProduct = await productSchema.findOneAndUpdate(
            { _id },
            [{ $set: { block: { $not: "$block" } } }],
            { new: true } 
          );
          res.status(201).send({msg:"set product to block"})
    } catch (error) {
        console.log(error);
    }
}

export async function showsingleproduct(req,res) {
    try {
        const{_id}=req.body
        console.log(_id);
        const singleprod = await productSchema.findById(_id);
        console.log(singleprod);
         res.status(200).send({msg:"succesfully fetched single product",singleprod})
    } catch (error) {  
        console.log(error);
    
    }
}

export async function addtocart(req,res) {
    try {
        const{_id,user_id,sizes,quantity}=req.body
        console.log(_id,user_id);
     const cart=await cartSchema.create({
            product_id:_id,
            user_id:user_id,
            size:sizes,
            quantity
        })
        res.status(201).send({ msg: "succesfully added th item to cart" })
    } catch (error) {
        console.log(error);
        
    }
}

export async function checkcart(req,res) {
    try {
        const{_id,user_id}=req.body
        const product_id=_id
        console.log(product_id);
        const cart = await cartSchema.findOne({ product_id, user_id });
        console.log("Cart Item:", cart);       
         console.log(cart);
        if (cart) {
            return res.status(201).send({ msg: true }); 
        }
        else{
            return res.status(200).send({msg:false})
        }
    } catch (error) {
        console.log(error+"error in checkcart");
        return res.status(400).send(error)
        
    }
}


export async function showcart(req,res) {
    try {
        const { user_id } = req.body;
        console.log("User ID:", user_id);

        // Find all cart items for the user
        const cartItems = await cartSchema.find({ user_id });
        console.log("Cart Items:", cartItems);

        if (!cartItems.length) {
            return res.status(404).json({ message: "No products in cart" });
        }

        // Extract product IDs and convert them to ObjectId
        const productIds = cartItems.map(item => new mongoose.Types.ObjectId(item.product_id));
        
        // Fetch product details for all products in the cart
        const products = await productSchema.find({ _id: { $in: productIds } });

        console.log("Products in Cart:", products);
        return res.status(200).send({msg:"cart item afetched",products,cartItems});

    } catch (error) {
        console.error("Error in showcart:", error);
        return res.status(500).json({ error: "Server error" });
    }
}

export async function removecart(req,res) {
    try {
        const{id}=req.body
        console.log(id);
        const product_id=id
        const product = await cartSchema.findOneAndDelete({product_id}); 
        return res.status(201).send({ msg: "Successfully deleted", });
        
    } catch (error) {
        console.log(error);
    }
}

// filter
// filter
// filter

export async function filter(req,res) {
    try {
        const{category}=req.body
        console.log(category);
        
        const product = await productSchema.find({category}); 
        console.log(product);
        
        return res.status(200).send({ msg: "Successfully fetched",product });
        
    } catch (error) {
        console.log(error);
    }
}


// order product
// order product
// order product


export async function contactadmin(req,res) {
    try {
        const { formState } = req.body;
        console.log(formState);
        const email = formState.email;

// Send confirmation to user
const userConfirmation = await transporter.sendMail({
    from: 'contacte169@gmail.com',
    to: email, // Send to the user's email
    subject: "We've Received Your Message",
    text: "Thank you for contacting us. We'll get back to you shortly.",
    html: `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;">
              <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e0e0e0;">
                  <h2 style="color: #333;">Thank You for Contacting Us</h2>
              </div>
              <div style="padding: 20px 0;">
                  <p>Dear ${formState.name},</p>
                  <p>We have received your message and appreciate you taking the time to contact us.</p>
                  <p>Here's a summary of the information you provided:</p>
                  <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 15px 0;">
                      <p><strong>Subject:</strong> ${formState.subject}</p>
                      <p><strong>Message:</strong> ${formState.message}</p>
                  </div>
                  <p>Our team will review your message and get back to you as soon as possible.</p>
                  <p>If you need immediate assistance, you can reply directly to this email to reach our support team.</p>
              </div>
              <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; font-size: 14px; color: #666; text-align: center;">
                  <p>If you have any urgent questions, please call us at +1 (555) 123-4567.</p>
              </div>
          </div>`,
});

// Send notification to admin with reply functionality
const adminNotification = await transporter.sendMail({
    from: 'contacte169@gmail.com',
    to: "sharonshiju261@gmail.com", // Admin email
    subject: `New Contact Form Submission: ${formState.subject}`,
    replyTo: email, // Set reply-to as the user's email for direct response
    text: `New message from ${formState.name} (${email}): ${formState.message}`,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;">
              <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e0e0e0;">
                  <h2 style="color: #333;">New Contact Form Submission</h2>
              </div>
              <div style="padding: 20px 0;">
                  <p><strong>From:</strong> ${formState.name} (${email})</p>
                  <p><strong>Subject:</strong> ${formState.subject}</p>
                  <p><strong>Message:</strong></p>
                  <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 15px 0;">
                      ${formState.message}
                  </div>
                  <p>You can reply directly to this email to respond to the user.</p>
              </div>
          </div>`,
});

return res.status(200).send({ msg: "Messages sent successfully" });
    } catch (error) {
        console.log(error);
    }
}

export async function getCategories(req, res) {
    try {
        const categories = await productSchema.distinct("category"); 
        res.status(200).json({ msg: "Categories found", categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
}


export async function filterProducts(req, res) {
    try {
        const { selectedCategories, minPrice, maxPrice } = req.body;
        
        // Ensure categories is always an array
       if (req.body) {
        const categories = Array.isArray(selectedCategories) ? selectedCategories : [selectedCategories];
        console.log(categories);
        
        // Convert price filters to numbers (Ensure valid numbers)
        const min = minPrice ? parseInt(minPrice, 10) : 0;
        const max = maxPrice ? parseInt(maxPrice, 10) : Number.MAX_SAFE_INTEGER;
        
        console.log("Categories:", categories, "Min Price:", min, "Max Price:", max);
        
        // Build the query object
        const query = { block: false }; // Exclude blocked products
        
        // Add category filter - only if categories has items and not empty/null
        if (categories && categories.length > 0 && categories[0]) {
            query.category = { $in: categories };
        }
        
        // Add price range filter
        query.price = { $gte: min, $lte: max };
        
        console.log("Query Object:", query);
        
        // Execute the query
        const products = await productSchema.find(query);
        
        console.log("Filtered Products:", products);
        
        // Check if there are any products after filtering
        if (products.length === 0) {
            // Try a broader query to determine if the issue is with the filters
            const allProducts = await productSchema.find({ block: false });
            console.log("All unblocked products count:", allProducts.length);
            
            // If there are products without filters but none with filters
            if (allProducts.length > 0) {
                console.log("No products match the specific filters, but there are unblocked products available");
            }
        }
        
         return res.status(200).json({
            success: true,
            count: products.length,
            msg: products.length > 0 ? "Filtered products retrieved successfully" : "No products match the selected filters",
            products,
        });
       }
       else{
        const products = await productSchema.find();

        return res.status(200).json({
            success: true,
            count: products.length,
            msg: products.length > 0 ? "Filtered products retrieved successfully" : "No products match the selected filters",
            products,
        });
       }
    } catch (error) {
        console.error("Error filtering products:", error);
        res.status(500).json({
            success: false,
            msg: "Error filtering products",
            error: error.message,
        });
    }
}