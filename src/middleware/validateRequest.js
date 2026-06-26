export const validateRequest = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errorMessage = result.error.issues
        .map((issue) => {
          const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
          return `${path}${issue.message}`;
        })
        .join(", ");
      console.error("Validation error:", errorMessage);
      return res.status(400).json({ message: errorMessage });
    }
    req.body = result.data;
    next();
  };
};