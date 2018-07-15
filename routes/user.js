const router      = require('express').Router();

const User        = require('../models/User'),
      Listing     = require('../models/tasks/Listing');

const middleware  = require('../middleware');


router.get('/:username', (req, res) => {
  User.findOne({username: req.params.username})
  .populate('listings')
  .populate('proposalsOutbound')
  .populate('proposalsInbound')
  .exec((err, foundUser) => {
    console.log("/:username db call returned: ");
    if (err || foundUser === null) {
      console.error(err);
      res.redirect('/');
    } else {
      console.log("Found user: ", foundUser);
      console.log("req.user is: ", req.user);
      res.render('user/index', {user: foundUser});
    }
  });
});

router.get('/:id/settings', middleware.checkSettings, (req, res) => {
  console.log('User attempting to access settings');
  console.log(req.params.id);
  User.findById(req.params.id, (err, foundUser) => {
    console.log('user lookup');
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      console.log(foundUser);
      res.render('user/edit', {user: foundUser});
    }
  })
});

router.put('/:id', (req, res) => {
  console.log(req.body);
  //middleNames
  const update = req.body.updatedUser;
  User.findByIdAndUpdate(req.params.id, update, (err) => {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      res.redirect('/listings');
    }
  })
  // res.send('Going to change user\'s settings...');
})

module.exports = router;
