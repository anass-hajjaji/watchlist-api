
import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { generateToken } from "../utils/generateToken.js";
 
const register = async (req, res) => {
  const {username, email, password} = req.body;
  try {
    const userExist = await prisma.user.findUnique(
    {
        where:{email : email}
    });
    if (userExist)
    {
      return res.status(400)
      .json({error: "User already exist with this email."})
    }
    const usernameTaken = await prisma.user.findUnique(
    {
        where:{username : username}
    });
    if (usernameTaken)
    {
      return res.status(400)
      .json({error: "User already exist with this username."})
    }
    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // creat user
    const user = await prisma.user.create({
      data:{
        username,
        email,
        password: hashedPassword
      }
    });
    // Generate JWT 
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
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({ error: "Email or username already exists." });
    }
    console.error("Register error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

const login = async (req, res) => 
{
  const {email, password} = req.body;
  const user = await prisma.user.findUnique({
    where : {email : email},
  }) 
  if (!user)
  {
    return res.status(401).json({
      error: "Invalid email or password ."
    });
  }
  //check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid)
  {
    return res.status(401).json({error: "Invalid email or password."});
  }
  // Generate JWT 
  const token = generateToken(user.id, res);

  res.status(200).json({
    status: "success",
    user : {
      id: user.id, 
      email : email
    },
    token,
  });
}
const logout = async (req, res) =>
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

}

export {register, login, logout}