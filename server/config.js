const DEFAULT_PORT = 5000;

function getConfig(env = process.env) {
  const missing = ["MONGO_URI", "JWT_SECRET"].filter((name) => !env[name]);
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return {
    mongoUri: env.MONGO_URI,
    jwtSecret: env.JWT_SECRET,
    port: Number(env.PORT) || DEFAULT_PORT,
    allowedOrigins: (env.CLIENT_ORIGINS || "http://localhost:3000")
      .split(",").map((origin) => origin.trim()).filter(Boolean),
  };
}

module.exports = { getConfig };
