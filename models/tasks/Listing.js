const mongoose = require('mongoose');

const ResourcesSchema = new mongoose.Schema({
  name: String,
  description: String,
  imgs: [
    {
      name: String,
      src: String
    }
  ],
  author: {
    username: String,
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'share_app_user'
    }
  },
  proposalsInbound: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'share_app_proposal'
    }
  ],
  proposalsOutbound: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'share_app_proposal'
    }
  ],

  listingType: String,
  // 'resources'   <-- will be used to diffirentiate resources, chats, tutorial etc
  listingStatus: String,
  //active vs `inactive` <? vs edit
  listingMode: String,
  //offering vs `lookingfor` <?
  hidden: {
    type: Boolean,
    default: false
  },
  // what functionality does hidden actually achieve?

  // user/index.ejs has functionality to filter out Proposals on hidden


  //===============
  // offer: {
  //   offerType: String,
  //   amount: String
  // },
  //==============

  deadline: String,
  location: {
    coords: {
      lat: String,
      long: String
    },
    name: String
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'share_app_conversations'
  },

  //for the Proposal receipts
  pastTrades: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'share_app_proposal'
    }
  ],
  rejectedOffers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'share_app_proposal'
    }
  ]

});

module.exports = mongoose.model('share_app_listing', ResourcesSchema);
