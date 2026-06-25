const express = require('express');
const router  = express.Router();
const Member       = require('../models/Member');
const InviteToken  = require('../models/InviteToken');
const { upload }   = require('../utils/cloudinary');
const { sendConfirmationEmail } = require('../utils/email');

// POST /api/members/register — new member
router.post('/register', upload.single('photo'), async (req, res) => {
  try {
    const { tcAgreed, ...fields } = req.body;
    if (!tcAgreed || tcAgreed === 'false')
      return res.status(400).json({ message: 'You must agree to the Terms & Conditions.' });

    const member = await Member.create({
      ...fields,
      memberType: 'new',
      photo:      req.file?.path,
      tcAgreed:   true,
      tcAgreedAt: new Date(),
    });

    sendConfirmationEmail({ to: member.email, name: member.fullName }).catch(() => {});
    res.status(201).json({ success: true, message: 'Registration submitted successfully.' });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: 'This email is already registered.' });
    console.error(err);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// POST /api/members/returning — returning member via invite link
router.post('/returning', upload.single('photo'), async (req, res) => {
  try {
    const { token, tcAgreed, ...fields } = req.body;
    if (!tcAgreed || tcAgreed === 'false')
      return res.status(400).json({ message: 'You must agree to the Terms & Conditions.' });

    const invite = await InviteToken.findOne({ token });
    if (!invite)             return res.status(404).json({ message: 'Invalid invite link.' });
    if (invite.used)         return res.status(400).json({ message: 'This invite has already been used.' });
    if (invite.expiresAt < new Date()) return res.status(400).json({ message: 'This invite link has expired.' });

    const member = await Member.create({
      ...fields,
      memberType:  'returning',
      role:        'active_member',
      photo:       req.file?.path,
      tcAgreed:    true,
      tcAgreedAt:  new Date(),
      inviteToken: token,
    });

    invite.used   = true;
    invite.usedAt = new Date();
    await invite.save();

    sendConfirmationEmail({ to: member.email, name: member.fullName }).catch(() => {});
    res.status(201).json({ success: true, message: 'Re-registration submitted successfully.' });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: 'This email is already registered.' });
    console.error(err);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

module.exports = router;
