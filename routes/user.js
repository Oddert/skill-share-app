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
  res.send('Settings page');
})

module.exports = router;
