import { boolean } from "zod";

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const error = result.error.format();
      const errorMessage = Object.values(error)
        .flat().filter(boolean).map(err => err._errors).flat().join(", ");
      console.error("Validation error:", errorMessage);
      return res.status(400).json({ message: errorMessage });
    }
    req.body = result.data;
    next();
  };
};