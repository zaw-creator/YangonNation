const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  fullName:       { type: String, required: true, trim: true },
  nickname:       { type: String, required: true, trim: true },
  dob:            { type: Date,   required: true },
  email:          { type: String, required: true, unique: true, lowercase: true },
  gender:         { type: String, enum: ['Male','Female','Other'], required: true },
  address:        { type: String, required: true },
  phone:          { type: String, required: true },
  nrcNumber:      { type: String, required: true },
  bloodType:      { type: String, enum: ['A+','A-','B+','B-','O+','O-','AB+','AB-'], required: true },
  emergencyPhone: { type: String, required: true },
  photo:          { type: String },
  whyJoin:        { type: String },
  department:     { type: String, enum: ['Admin','Drifters'] },
  memberType:     { type: String, enum: ['new','returning'], required: true },
  status:         { type: String, enum: ['pending','approved','rejected','suspended','expelled'], default: 'pending' },
  role:           { type: String, enum: ['new_member','active_member','officer','mod','suspended','expelled'], default: 'new_member' },
  tcAgreed:       { type: Boolean, required: true },
  tcAgreedAt:     { type: Date },
  inviteToken:    { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);
