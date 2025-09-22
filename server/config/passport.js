// server/config/passport.js
import passport from "passport";

// COMMENT OUT Google OAuth for now
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// If you have other strategies (e.g., JWT), keep them
// Example JWT setup:
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    try {
      // Replace with your user lookup logic
      const user = { id: jwt_payload.id, email: jwt_payload.email };
      if (user) return done(null, user);
      else return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  })
);

// Optional: Serialize / deserialize user if using sessions
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

export default passport;
