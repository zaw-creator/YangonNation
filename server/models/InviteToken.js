const mongoose = require('mongoose');

const inviteTokenSchema = new mongoose.Schema({
  token:      { type: String, required: true, unique: true },
  memberName: { type: String, required: true },
  email:      { type: String, required: true },
  used:       { type: Boolean, default: false },
  usedAt:     { type: Date },
  expiresAt:  { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('InviteToken', inviteTokenSchema);
