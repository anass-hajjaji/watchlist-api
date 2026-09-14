
import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const register = catchAsync(async (req, res, next) => {
  const {username, email, password} = req.body;
  const userExist = await prisma.user.findUnique({
    where:{email : email}
  });
  if (userExist)
  {
    return next(new AppError("User already exist with this email.", 400));
  }
  const usernameTaken = await prisma.user.findUnique({
    where:{username : username}
  });
  if (usernameTaken)
  {
    return next(new AppError("User already exist with this username.", 400));
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data:{
      username,
      email,
      password: hashedPassword
    }
  });
  const token = generateToken(user.id, res);

  res.status(201).json({
    status: "success",
    user : {
      id: user.id,
      username: user.username,
      email : email
    },
    token
  });
});

const login = catchAsync(async (req, res, next) =>
{
  const {email, password} = req.body;
  const user = await prisma.user.findUnique({
    where : {email : email},
  }) 
  if (!user)
  {
    return next(new AppError("Invalid email or password.", 401));
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid)
  {
    return next(new AppError("Invalid email or password.", 401));
  }
  const token = generateToken(user.id, res);

  res.status(200).json({
    status: "success",
    user : {
      id: user.id, 
      email : email
    },
    token,
  });
});

const logout = catchAsync(async (req, res) =>
{
  console.log(`User ${req.user.id} (${req.user.email}) is logging out`);
  res.cookie("jwt", "", {
    httpOnly: true,
    expires : new Date(0)
  });
  res.status(200).json({
    status : "success", 
    message: "logged out successfully"
  });

});

export {register, login, logout}