var router      = require('express').Router(),
    passport    = require('passport');

var middleware  = require('../middleware');

var User        = require('../models/User'),
    Proposal    = require('../models/Proposal'),
    Listing     = require('../models/tasks/Listing');


//Create, new, edit, update, destroy


router.get('/', (req, res) => {
  res.send('Welcome to the proposals zone, get ready for some trading');
});

// CREATE route ====================
router.post('/', (req, res) => {
  console.log("===========================================");
  console.log(req.body);
  console.log("===========================================");
  Listing.findById(req.body.newprop.targetItem, (err, targetListing) => {
    if (err) {
      console.error(err);
      res.redirect('/');
    } else {
      console.log(targetListing);
      console.log("Step 1, found listing: ", targetListing.name);
      User.findById(req.body.newprop.targetUser, (err, targetUser) => {
        if (err) {
          console.error(err);
          res.redirect('/');
        } else {
          console.log("Step 2, found target user: ", targetUser.username);
          User.findById(req.body.newprop.authorId, (err, author) => {
            if (err) {
              console.error(err);
              res.redirect('/');
            } else {
              console.log("Step 3, found the author: ", author.username);
              if (req.body.newprop.counterOffer == 'create') {
                console.log("Step 4: User wants to create a new item to offer")
                console.log("WORKIN on the other method first cause .... ahya basic");
                res.redirect('/listings/' + req.body.newprop.targetItem);
              } else {
                Listing.findById(req.body.newprop.counterOffer, (err, counterListing) => {
                  if (err) {
                    console.error(err);
                    res.redirect('back');
                  } else {
                    console.log("Step 4, User wants to offer in return: ", counterListing.name);
                    var sampleBody = {
                          newprop: {
                            name: 'why did i include a title?',
                            description: 'hello oddert, wantae geez ye printer?',
                            counterOffer: '5b1a594e458cf331a4997206',
                            authorId: '5b185274bf93ed3970a0529c',
                            targetUser: '5b183cff422e135828a15a9b',
                            targetItem: '5b184da28457a14c28880992'
                          }
                        }
                    const newprop = req.body.newprop;
                    var createProposal = Object.assign({
                      created: new Date().toString(),

                      author: {
                        username: author.username,
                        id: author._id
                      },
                      targetUser: {
                        username: targetUser.username,
                        id: targetUser._id
                      },
                      targetItem: {
                        name: targetListing.name,
                        id: targetListing._id
                      },
                      offeredItem: {
                        name: counterListing.name,
                        id: counterListing._id
                      }

                    },
                    newprop);

                    Proposal.create(createProposal, (err, createdProp) => {
                      if (err) {
                        console.error(err);
                        res.redirect('/');
                      } else {

                        author          .proposalsOutbound.push(createdProp._id);
                        counterListing  .proposalsOutbound.push(createdProp._id);
                        targetUser      .proposalsInbound.push(createdProp._id);
                        targetListing   .proposalsInbound.push(createdProp._id);

                        author          .save();
                        counterListing  .save();
                        targetUser      .save();
                        targetListing   .save();

                        // res.setHeader('Content-Type', 'application/json');
                        // res.send(createProposal);
                        res.redirect('/listings/' + targetListing._id);
                      }
                    })

                  }
                })

              }
            }
          });
        }
      });
    }
  });
});

// NEW route ====================
router.get('/new/:temp_listing_id', middleware.isLoggedIn, (req, res) => {
  console.log("Authed user is attempting to create new offer for: ", req.params.temp_listing_id);
  Listing.findById(req.params.temp_listing_id, (err, foundListing) => {
    if (err) {
      console.error(err);
      res.redirect('/');
    } else {
      console.log("Found the target listing: ", foundListing);
      User.findById(req.user._id).populate('listings').exec((err, foundUser) => {
        if (err) {
          console.error(err);
          res.redirect('back');
        } else {
          console.log("Found the user making the listing: ", foundUser);
          res.render('proposals/new', {
            listing: foundListing,
            currentUser: foundUser
          });
        }
      });
    }
  });
});

// EDIT route ====================
router.get('/:id/edit', middleware.checkProposalOwnership, (req, res) => {
  console.log("### PROPOSAL EDIT route...");
  Proposal.findById(req.params.id, (err, listing) => {
    if (err) {
      console.error(err);
      res.redirect('/');
    } else {
      // console.log("Found listing: ", listing);
      User.findById(req.user._id).populate('listings').exec((err, currentUser) => {
        if (err) {
          console.error(err);
          res.redirect('/');
        } else {
          res.render('proposals/edit', {
            listing, currentUser
          });
        }
      })
    }
  })
});

router.put('/:id/update', middleware.checkProposalOwnership, (req, res) => {
  console.log("### PUT req proposals/:id/update");
  console.log(`Updating ${req.params.id}...`);

  const update = req.body.updatedprop;
  const updatedItem = {
    name: update.name,
    description: update.description,
    created: new Date().toString()
  }

  if (update.counterOffer == update.previousOffer) {
    console.log("========================= Prev == New =========================");
    Proposal.findByIdAndUpdate(req.params.id, updatedItem, (err, updatedProposal) => {
      if (err) {
        console.error(err);
        res.redirect('/');
      } else {
        console.log("Proposal Updated Successfuly.");
        res.redirect('/listings');
      }
    })
  } else {
    console.log("========================= New Counter Offer =========================");
    Listing.findById(update.previousOffer, (err, prevOffer) => {
      if (err) {
        console.error(err);
        res.redirect('/');
      } else {
        prevOffer.offersOutbound.remove(req.params.id);
        prevOffer.save();
        console.log(`Updated: ${prevOffer.name} to remove the item...`);
        Listing.findById(update.counterOffer, (err, newOffer) => {
          if (err) {
            console.error(err);
            res.redirect('/');
          } else {
            newOffer.offersOutbound.push(req.params.id);
            newOffer.save();
            console.log(`Updated: ${newOffer.name} to ADD the item...`);
            Proposal.findByIdAndUpdate(req.params.id, updatedItem, (err, updatedProposal) => {
              if (err) {
                console.error(err);
                res.redirect('/');
              } else {
                console.log("UPDATE yo: ", updatedProposal);
                res.redirect('/listings');
              }
            })
          }
        })
      }
    })
  }
})

// UPDATE route ====================
router.put('/:id/:action', middleware.checkProposalTargetUser, (req, res) => {
  //acceptable actions are 'accept' and 'decline';
  console.log("Proposal PUT route ================");
  console.log(`ACTION is: ${req.params.action}`);

  console.log(req.body);
  console.log(req.params);

  if (req.params.action == 'update') {
      console.log("### ERROR PUT proposals/:id/:action update route accessed, why?");
  } else if (req.params.action == 'accept' || req.params.action == 'decline') {

    Proposal.findById(req.params.id, (err, proposal) => {
      if (err) {
        console.error(err);
        res.redirect('/');
      } else {
        console.log("Proposal lookup ok...");
        Listing.findById(proposal.targetItem.id, (err, targetItem) => {
          if (err) {
            console.error(err);
            res.redirect('/');
          } else {
            console.log("Target Item lookup ok...");
            User.findById(proposal.targetUser.id, (err, targetUser) => {
              if (err) {
                console.error(err);
                res.redirect('/');
              } else {
                console.log("Target User lookup ok...");
                Listing.findById(proposal.offeredItem.id, (err, offeredItem) => {
                  if (err) {
                    console.error(err);
                    res.redirect('/');
                  } else {
                    console.log("Offered Item lookup ok...");
                    User.findById(proposal.author.id, (err, author) => {
                      if (err) {
                        console.error(err);
                        res.redirect('/');
                      } else {
                        console.log("Author lookup ok...");

                        if (req.params.action == 'accept') {
                          console.log("Begining the 'accept' process...");

                          author.pastTrades.push(proposal._id);
                          author.listings.push(targetItem._id);
                          author.soldItems.push(offeredItem._id);
                          author.listings.remove(offeredItem._id);

                          targetUser.pastTrades.push(proposal._id);
                          targetUser.listings.push(offeredItem._id);
                          targetUser.acceptedItems.push(offeredItem._id);
                          targetUser.listings.remove(targetItem._id);

                          offeredItem.proposalsOutbound.remove(proposal._id);
                          offeredItem.pastTrades.push(proposal._id);

                          offeredItem.author = {
                            username: targetUser.username,
                            id: targetUser._id
                          }
                          offeredItem.hidden = true;

                          targetItem.pastTrades.push(proposal._id);
                          targetItem.author = {
                            username: author.username,
                            id: author._id
                          }
                          targetItem.hidden = true;

                        } else {
                          console.log("Begining the 'decline' process...");

                          author      .rejectedOffers.push(proposal._id);
                          targetUser  .rejectedOffers.push(proposal._id);
                          offeredItem .rejectedOffers.push(proposal._id);
                          targetItem  .rejectedOffers.push(proposal._id);

                        }

                        author      .proposalsOutbound.remove(proposal._id);
                        offeredItem .proposalsOutbound.remove(proposal._id);
                        targetUser  .proposalsInbound.remove(proposal._id);
                        targetItem  .proposalsInbound.remove(proposal._id);

                        author.save();
                        targetUser.save();
                        offeredItem.save();
                        targetItem.save();
                        console.log("The item has been sucessfully traded!");

                        console.log("The asked for (target) item bellongs to: ", targetItem.author.username);
                        console.log("The counter offered (proposed) item bellongs to: ", offeredItem.author.username);

                        res.redirect('/listings');
                      }
                    }) // Author lookup
                  }
                }) // Offered Item lookup
              }
            }) // Target User lookup
          }
        }) // Target Item lookup
      }
    }) // Proposal lookup




  } else {
    res.setHeader('Content-Type', 'application/json');
    res.send({message: 'Many things have broken inside PUT proposals/:id/:action'});
  }
});

// DESTORY route ====================
router.delete('/:id', (req, res) => {
  //remove listing from target, counter, targetUser, author,
  console.log("Going to remove this PROPOSAL: ");
  console.log("===========================================");
  console.log(req.body);
  console.log("===========================================");
  Proposal.findById(req.params.id, (err, foundProp) => {
    if (err) {
      console.error(err);
      res.redirect('/');
    } else {
      console.log("Proposal lookup ok...");
      Listing.findById(foundProp.targetItem.id, (err, targetItem) => {
        if (err) {
          console.error(err);
          res.redirect('/');
        } else {
          targetItem.proposalsInbound.remove(req.params.id);
          targetItem.save();
          console.log(`1/4) Removed proposal from the TARGET ITEM (${targetItem.name})...`);
          Listing.findById(foundProp.offeredItem.id, (err, foundOffer) => {
            if (err) {
              console.error(err);
              res.redirect('/');
            } else {
              foundOffer.proposalsOutbound.remove(req.params.id);
              foundOffer.save();
              console.log(`2/4) Removed proposal from the OFFER ITEM (${foundOffer.name})...`);
              User.findById(foundProp.targetUser.id, (err, targetUser) => {
                if (err) {
                  console.error(err);
                  res.redirect('/');
                } else {
                  targetUser.proposalsInbound.remove(req.params.id);
                  targetUser.save();
                  console.log(`3/4) Removed proposal from the TARGET USER (${targetUser.username})...`);
                  User.findById(foundProp.author.id, (err, author) => {
                    if (err) {
                      console.error(err);
                      res.redirect('/');
                    } else {
                      author.proposalsOutbound.remove(req.params.id);
                      author.save();
                      console.log(`4/4) Removed proposal for the OFFERING USER (${author.username})...`);
                      Proposal.findByIdAndRemove(req.params.id, (err) => {
                        if (err) {
                          console.error(err);
                          res.redirect('/');
                        } else {
                          console.log(`SUCCESS! the evil is defeted! res redir`);
                          res.redirect('/' + req.body.redir);
                        }
                      }); // REMOVE
                    }
                  });// remove from author

                }
              }); // remove from target user

            }
          });// remove from target offer

        }
      }); //Remove from target item

    }
  })
  // res.redirect('/listings');
});


// ACCEPT / DECLINE route ====================









module.exports = router;
