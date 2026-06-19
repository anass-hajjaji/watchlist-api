import jwt from "jsonwebtoken";
import {prisma} from "../config/db.js";

//read the token from the request
//check if the token valid

export const authMiddleware = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer"))
  {
    token = req.headers.authorization.split(" ")[1];
  }
  else if (req.cookies?.jwt)
  {
    token = req.cookies.jwt;
  }
  if (!token){
    return res.status(401).json({error : "not authorized, no token provided"}); 
  }
  try{
    let decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user  = await prisma.user.findUnique(
      {
        where : {id : decoded.id}
      });
    if (!user)
    {
      return res.status(401).json({error : "user no longer exists"}); 
    }
    req.user = user;
    next();
  } catch (error){
    return res.status(401).json({error : "not authorized, token failed"}); 
  }
}