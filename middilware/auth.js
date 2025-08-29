import pkg from "jsonwebtoken"
const {verify}=pkg
export default async function Auth(req,res,next) {

    try {
        const key=req.headers.authorization
        // console.log(key);
        if(!key)
            return res.status(403).send({msg:"unautharized access"})
        const token=key.split(" ")[1]
        // console.log(token);
        const auth=await verify(token,process.env.JWT_key)
        // console.log(auth);
        req.user=auth
        next()
    } catch (error) {
        res.status(403).send({msg:"login time expired please login again"})
    } 


}