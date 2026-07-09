require("dotenv").config()
const passport = require("passport")
const GitHubStrategy = require("passport-github2").Strategy

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      const response = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `token ${accessToken}`,
          'User-Agent': 'mcnanosoft'
        }
      })
  
      const emails = await response.json()
      // console.log(emails)
  
      const primaryEmailObj = emails.find(email => email.primary && email.verified)

      if (primaryEmailObj) {
        profile.email = primaryEmailObj.email
      } else {
        profile.email = null
      }
  
      return done(null, profile)
    } catch (error) {
      console.error('Error fetching GitHub emails:', error)
      return done(error, null)
    }
  }
))

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((obj, done) => {
  done(null, obj)
})