const mongoose  = require('mongoose');

const User      = require('./User');

var ProposalSchema = new mongoose.Schema({
  name: String,
  description: String,
  created: String,
  deadline: String,

  author: {
    username: String,
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'share_app_user'
    }
  },
  targetUser: {
    username: String,
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'share_app_user'
    }
  },

  targetItem: {
    name: String,
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'share_app_listing'
    }
  },
  offeredItem: {
    name: String,
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'share_app_listing'
    }
  }

});

module.exports = mongoose.model('share_app_proposal', ProposalSchema);
