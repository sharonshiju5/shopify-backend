import express from "express"
import cors from "cors"
import connection from "./connection.js";
import env from "dotenv"
import router from "./router.js";
import path from "path";


env.config()

const app=express();
// app.use(express.static("../clientside"))


app.use(cors())
app.use(express.json({limit:"100mb"}))
app.use("/api",router)
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
connection().then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`server started on http://localhost:${process.env.PORT}`);
        
    })
})
