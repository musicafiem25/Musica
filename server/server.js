const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const passport = require("passport");
require("./config/passport");

dotenv.config();



dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo error:", err));
app.use("/api/auth", require('./routes/main'));
app.use("/api/spotify", require('./routes/spotifyRoutes'));
app.get("/",(req,res)=>{
      res.send("<h1>Welcome to Musica</h1>");
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
