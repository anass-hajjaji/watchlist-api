import jwt from "jsonwebtoken";
import {prisma} from "../config/db.js";
import AppError from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import {promisify} from "util";
//read the token from the request
//check if the token valid

export const authMiddleware = catchAsync( async (req, res, next) => {
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
    return next(new AppError("Not authorized, no token", 401));
  }
  // Verify token (promisify turns it into an awaitable promise so catchAsync can catch any crashes)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //find the user by id
  const user = await prisma.user.findUnique({
    where: {id: decoded.id}
  });
  if (!user)
  {
    return next(new AppError("User not found", 404));
  }
  req.user = user;
  next();
});

// middleware/validateUser.js
// export const validateUser = (req, res, next) => {
//   if (!req.user || !req.user.id) {
//     return res.status(401).json({ err: "Authentication required or invalid user" });
//   }
//   next();
// };