const { Strategy, ExtractJwt } = require("passport-jwt");
const User = require("../Model/user.model"); // Your User model
const dotenv = require("dotenv");
const Client = require("../Model/client.model")

dotenv.config();

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET, 
};

module.exports = (passport) => {
  passport.use(
    new Strategy(opts, async (jwt_payload, done) => {
      try {
        
        // Fetch user and client in parallel
        
          const user = await User.findOne({ email: jwt_payload.email })
          const client = await Client.findOne({ email: jwt_payload.email })
        
        

        // const user = await User.findById(jwt_payload.id);
        // const user = await Client.find({email : jwt_payload.email})
        //console.log(user)
        if (user) return done(null, user); 
        if(client) return done(null, client);
        return done(null, false);
      } catch (err) {
        console.error(err);
        return done(err, false);
      }
    })
  );
};




// const { Strategy, ExtractJwt } = require("passport-jwt");
// const User = require("../Model/user.model");
// const Client = require("../Model/client.model");
// const dotenv = require("dotenv");

// dotenv.config();

// const opts = {
//   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//   secretOrKey: process.env.JWT_SECRET,
// };

// module.exports = (passport) => {
//   passport.use(
//     new Strategy(opts, async (jwt_payload, done) => {
//       try {
        
//         // Fetch user and client in parallel
//         const [user, client] = await Promise.all([
//           User.findOne({ email: jwt_payload.email }),
//           Client.findOne({ email: jwt_payload.email })
//         ]);

//         if (user || client) {
//           return done(null, user || client);
//         }

//         console.log("User Not Found");
//         return done(null, false);
//       } catch (err) {
//         console.error("Error in Passport Strategy:", err);
//         return done(err, false);
//       }
//     })
//   );
// };

