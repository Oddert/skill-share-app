const mongoose              = require('mongoose');
const PassportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  listings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'share_app_listing'
    }
  ],
  proposalsOutbound: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'share_app_proposal'
    }
  ],
  proposalsInbound: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'share_app_proposal'
    }
  ],

  pastTrades: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal'
    }
  ],
  rejectedOffers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'share_app_proposal'
    }
  ],
  soldItems: [
    {
      type:mongoose.Schema.Types.ObjectId,
      ref: 'Listing'
    }
  ],
  acceptedItems: [
    {
      type:mongoose.Schema.Types.ObjectId,
      ref: 'Listing'
    }
  ]
});

UserSchema.plugin(PassportLocalMongoose);

module.exports = mongoose.model("share_app_user", UserSchema);
