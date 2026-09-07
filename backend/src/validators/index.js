export const validate = (schema) => (req, res, next) => {
  try {
    // Parse req.body using Zod schema
    schema.parse(req.body);
    next();
  } catch (error) {
    // Map Zod errors to a clean client-friendly format
    const errors = error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    res.status(400).json({
      message: "Validation failed.",
      errors,
    });
  }
};
