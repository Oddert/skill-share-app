var router      = require('express').Router(),
    passport    = require('passport'),

    middleware  = require('../middleware'),

    User        = require('../models/User'),
    Proposal    = require('../models/Proposal'),
    Listing     = require('../models/tasks/Listing');


router.get('/', (req, res) => {
  Listing.find({}, (err, foundListings) => {
    if (err) {
      console.error(err);
      res.redirect('/');
    } else {
      if (req.user) {console.log(`USER ${req.user.username} ACCESSED /LISTINGS: `)} else {console.log(`USER ACCESSED /LISTINGS: `)}
      console.log(foundListings);
      res.render('listings', {listings: foundListings});
    }
  })
})

// NEW route
router.get('/new', middleware.isLoggedIn, (req, res) => {
  res.render('listings/new');
});

//CREATE route
router.post('/', middleware.isLoggedIn, (req, res) => {
  console.log("============================================");
  console.log(req.body);
  console.log("============================================");
  let newListing = Object.assign({
    listingStatus: 'active',
    deadline: null,
    location: {coords: {lat: '528', long: '491'}, name: 'Limbo'}
  },
  req.body.newlisting);

  console.log(newListing);
  User.findById(req.user._id, (err, foundUser) => {
    if (err) {
      console.error(err);
      res.redirect('/');
    } else {
      switch (newListing.listingType) {
        case 'resources':
          Listing.create(newListing, (err, createdlisting) => {
            if (err) {
              console.log(err);
              res.redirect('/');
            } else {
              createdlisting.author.id = req.user._id;
              createdlisting.author.username = req.user.username;
              createdlisting.save();
              foundUser.listings.push(createdlisting._id);
              foundUser.save();
              console.log("Success! Created: ", createdlisting);
              res.redirect('/listings');
            }
          })
          break;
        default:
        console.log("POST '/' switch statement defaulting");
        res.redirect('/');
          break;
      }
    }
  });
});

//SHOW route
router.get('/:id', (req, res) => {
  Listing.findById(req.params.id)
          .populate('proposalsInbound')
          .populate('proposalsOutbound')
          .populate('pastTrades')
          .populate('rejectedOffers')
          .exec((err, foundListing) => {
            if (err) {
              console.error(err);
              res.redirect('/');
            } else {
              res.render('listings/show', {listing: foundListing});
            }
          });
});

//EDIT route
router.get('/:id/edit', middleware.checkListingOwnership, (req, res) => {
  Listing.findById(req.params.id, (err, foundListing) => {
    if (err) {
      console.error(err);
      res.redirect('/');
    } else {
      res.render('listings/edit', {listing: foundListing});
    }
  });
});

//UPDATE route
router.put('/:id', middleware.checkListingOwnership, (req, res) => {
  Listing.findByIdAndUpdate(
    req.params.id,
    req.body.updatedlisting,
    (err) => {
      if (err) {
        console.error(err);
        res.redirect('/');
      } else {
        res.redirect('/listings/' + req.params.id);
      }
    });
});

//DESTROY route
router.delete('/:id', middleware.checkListingOwnership, (req, res) => {
  User.findById(req.user._id, (err, foundUser) => {
    if (err) {
      console.error(err);
      res.redirect('/');
    } else {
      foundUser.listings.remove(req.params.id);
      foundUser.save();

      Listing.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
          console.log(err);
          res.redirect('/');
        } else {
          res.redirect('/listings');
        }
      });

    }
  });

});

module.exports = router;
