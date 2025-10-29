export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err?.status || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? err?.message || "Internal Server Error"
      : err?.stack || err?.message || "Internal Server Error";
  res.status(status).json({ success: false, error: message });
}

export default errorHandler;
