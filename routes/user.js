var router    = require('express').Router(),

    User      = require('../models/User'),
    Listing   = require('../models/tasks/Listing');


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

module.exports = router;
