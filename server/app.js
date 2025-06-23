require("dotenv").config();

const MONGO_URL = process.env.MONGO_URL;
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Dodaj da eksplicitno služiš slike iz "uploads" foldera
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB konekcija
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Povezano sa MongoDB"))
  .catch((err) => console.error("❌ Greška u konekciji:", err));

// Rute
const categoriesRoutes = require("./routes/categories");
app.use("/api/categories", categoriesRoutes);

const productRoutes = require("./routes/products");
app.use("/api/products", productRoutes);

// Pokreni server
app.listen(5000, "0.0.0.0", () => {
  console.log("🚀 Backend server radi na http://localhost:5000");
});
