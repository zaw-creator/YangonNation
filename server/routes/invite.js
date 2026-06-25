const express = require('express');
const router  = express.Router();
const InviteToken = require('../models/InviteToken');
const auth        = require('../middleware/auth');
const { generateToken }    = require('../utils/token');
const { sendInviteEmail }  = require('../utils/email');

// GET /api/invite/:token — validate (public, called by invite page on load)
router.get('/:token', async (req, res) => {
  const invite = await InviteToken.findOne({ token: req.params.token });
  if (!invite)             return res.status(404).json({ valid: false, message: 'Invalid invite link.' });
  if (invite.used)         return res.status(400).json({ valid: false, message: 'This invite has already been used.' });
  if (invite.expiresAt < new Date()) return res.status(400).json({ valid: false, message: 'This invite has expired.' });
  res.json({ valid: true, memberName: invite.memberName, email: invite.email });
});

// POST /api/invite/generate — single invite (admin only)
router.post('/generate', auth, async (req, res) => {
  try {
    const { memberName, email, expiryDays = 14 } = req.body;
    const token     = generateToken();
    const expiresAt = new Date(Date.now() + expiryDays * 86400000);
    await InviteToken.create({ token, memberName, email, expiresAt });
    sendInviteEmail({ to: email, name: memberName, token }).catch(() => {});
    res.status(201).json({
      success: true,
      token,
      link: `${process.env.CLIENT_URL}/invite/${token}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate invite.' });
  }
});

// POST /api/invite/bulk — bulk generate from array (admin only)
router.post('/bulk', auth, async (req, res) => {
  try {
    const { members, expiryDays = 14 } = req.body;
    const expiresAt = new Date(Date.now() + expiryDays * 86400000);
    const results   = [];
    for (const m of members) {
      const token = generateToken();
      await InviteToken.create({ token, memberName: m.memberName, email: m.email, expiresAt });
      sendInviteEmail({ to: m.email, name: m.memberName, token }).catch(() => {});
      results.push({ email: m.email, token, link: `${process.env.CLIENT_URL}/invite/${token}` });
    }
    res.json({ success: true, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Bulk generation failed.' });
  }
});

// GET /api/invite — list all invites (admin only)
router.get('/', auth, async (req, res) => {
  const invites = await InviteToken.find().sort({ createdAt: -1 });
  res.json({ success: true, invites });
});

module.exports = router;
