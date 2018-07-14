const express         = require('express'),
      app             = express(),
      bodyParser      = require('body-parser'),
      ejs             = require('ejs'),
      methodOverride  = require('method-override'),

      mongoose        = require('mongoose'),
      passport        = require('passport'),
      LocalStrategy   = require('passport-local');

const User            = require('./models/User'),
      Proposal        = require('./models/Proposal'),
      Listing         = require('./models/tasks/Listing');

const indexRoutes     = require('./routes'),
      listingRoutes   = require('./routes/listings'),
      userRoutes      = require('./routes/user'),
      propRoutes      = require('./routes/proposals');

const keys            = require('./locals/keys');

require('dotenv').config();

mongoose.connect(process.env.MONGODB);

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));

app.use(methodOverride('_method'));

app.use(require('express-session')({
  secret: 'There are enormous garlic plants on my windowsill and I havn\'t a clue what to do with them',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use('/', indexRoutes);
app.use('/listings', listingRoutes);
app.use('/user', userRoutes);
app.use('/proposals', propRoutes);

const PORT = process.env.PORT || 3000;
var date = new Date().toLocaleTimeString();

app.listen(PORT, () => console.log(`${date} Server initialised on port ${PORT}... ${process.env.TESTER}`));
