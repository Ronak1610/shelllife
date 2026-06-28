const jwt = require("jsonwebtoken")


function authMiddleware(req,res,next)

{
    const token  = req.headers.token
    console.log(token)
 const response = jwt.verify(token,"token123");

 const user_id = response.user_id;
 if(user_id)
 {
    req.user_id = user_id;
    
    next()
 }
 else {
    res.json({message: " no correct token"})
 }


}
module.exports ={
    authMiddleware:authMiddleware
}