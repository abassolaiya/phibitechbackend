const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const Author = mongoose.model('Author');

// Configure the Google strategy for use by Passport
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  const { id, displayName, emails } = profile;
  try {
    let author = await Author.findOne({ googleId: id });

    if (!author) {
      author = new Author({
        googleId: id,
        name: displayName,
        email: emails[0].value
      });
      await author.save();
    }

    done(null, author);
  } catch (err) {
    done(err, null);
  }
}));

// Serialize user into the sessions
passport.serializeUser((author, done) => {
  done(null, author.id);
});

// Deserialize user from the sessions
passport.deserializeUser((id, done) => {
  Author.findById(id, (err, author) => {
    done(err, author);
  });
});
