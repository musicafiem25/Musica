// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// const auth = async (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.status(401).json({ error: "Unauthorized" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id);
//     if (!req.user) return res.status(404).json({ error: "User not found" });
//     next();
//   } catch (err) {
//     res.status(401).json({ error: "Invalid token" });
//   }
// };



// module.exports = auth;


const jwt = require("jsonwebtoken");
const { ManualUser, GoogleUser } = require("../models/User");

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    const manualUser = await ManualUser.findById(decoded.id);
    const googleUser = !manualUser ? await GoogleUser.findById(decoded.id) : null;

    req.user = manualUser || googleUser;
    if (!req.user) return res.status(404).json({ error: "User not found" });

    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = auth;

