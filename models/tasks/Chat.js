const mongoose = require('mongoose');

var ChatSchema = new mongoose.Schema({
  name: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
    username: String
  },
  description: String,
  type: 'CHAT',
  area: {
    lat: Number,
    long: Number
  }
})
