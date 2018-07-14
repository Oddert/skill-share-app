var router    = require('express').Router(),
    passport  = require('passport'),

    middleware  = require('../middleware'),

    User      = require('../models/User');

router.get('/', (req, res) => {
  res.render('landing');
});

router.get('/home', (req, res) => {
  res.render('index');
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', (req, res) => {
  const newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      console.error(err);
      res.redirect('/register');
    } else {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/home');
      });
    }
  })
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/listings',
  failureRedirect: '/'
}), (req, res) => {});

router.get('/logout', (req, res) => {
  req.logOut();
  res.redirect('/home');
})

router.get('/secret', middleware.isLoggedIn, (req, res) => {
  res.send('Only auth\'ed users should see this');
});

module.exports = router;
