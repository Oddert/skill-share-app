var Listing   = require('../models/tasks/Listing'),
    Proposal  = require('../models/Proposal'),
    User      = require('../models/User');

const middleware = {};

middleware.checkListingOwnership = (req, res, next) => {
  if (req.isAuthenticated()) {
    Listing.findById(req.params.id, (err, foundListing) => {
      if (err) {
        console.error(err);
        res.redirect('back');
      } else {
        if (foundListing.author.id.equals(req.user._id)) {
          next();
        } else {
          res.redirect('back');
        }
      }
    })
  } else {
    res.redirect('back');
  }
}

middleware.checkProposalOwnership = (req, res, next) => {
  if (req.isAuthenticated()) {
    Proposal.findById(req.params.id, (err, foundProposal) => {
      if (err) {
        console.error(err);
        res.redirect('back');
      } else {
        if (foundProposal.author.id.equals(req.user._id)) {
          next();
        } else {
          res.redirect('back');
        }
      }
    })
  } else {
    res.redirect('back');
  }
}

middleware.checkProposalTargetUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    Proposal.findById(req.params.id, (err, foundProposal) => {
      if (err) {
        console.error(err);
        res.redirect('back');
      } else {
        if (foundProposal.targetUser.id.equals(req.user._id)) {
          next();
        } else {
          res.redirect('back');
        }
      }
    })
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.send({
      message: 'You should not have been able to see a method to access this route',
      middleware: 'checkProposalTargetUser'
    });
  }
}

middleware.checkSettings = (req, res, next) => {
  if (req.isAuthenticated()) {
    User.findById(req.params.id, (err, foundUser) => {
      if (err) {
        console.log(err);
        res.status(500).json({
          error: true,
          message: 'Internal server error at user lookup'
        });
      } else {
        if (foundUser._id.equals(req.user._id)) {
          return next();
        } else {
          res.status(401).json({
            error: true,
            message: 'Current user\'s id does not match requested page'
          });
        }
      }
    })
  } else {
    res.redirect('/login');
  }
}

middleware.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

module.exports = middleware;
