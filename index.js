require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const merchandAuthRoutes = require("./api/routes/merchand/authRoutes");
const usersRoutes = require("./api/routes/merchand/usersRoutes")
const productsRoutes = require("./api/routes/merchand/productsRoutes");
const shopRoutes = require("./api/routes/shopRoutes")
const app = express();

// Import route files
app.use(express.json());
app.use("/",get,(req,res)=>{
  return res.json("welcome to sandip-api point end!");
});
// Merchand Authroutes
app.use("/auth", merchandAuthRoutes);
app.use("/users",usersRoutes);
app.use("/products",productsRoutes)
app.use("/shop",shopRoutes)
// Start the server
const PORT = 4000 || process.env.PORT;

mongoose.connect(process.env.MONGODB_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
