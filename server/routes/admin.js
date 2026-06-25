const express  = require('express');
const router   = express.Router();
const jwt      = require('jsonwebtoken');
const Admin    = require('../models/Admin');
const Member   = require('../models/Member');
const auth     = require('../middleware/auth');

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin || !(await admin.comparePassword(password)))
    return res.status(401).json({ message: 'Invalid credentials.' });
  const token = jwt.sign(
    { id: admin._id, username },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ success: true, token });
});

// GET /api/admin/stats
router.get('/stats', auth, async (req, res) => {
  const [total, pending, approved, rejected, newMembers, returning] = await Promise.all([
    Member.countDocuments(),
    Member.countDocuments({ status: 'pending' }),
    Member.countDocuments({ status: 'approved' }),
    Member.countDocuments({ status: 'rejected' }),
    Member.countDocuments({ memberType: 'new' }),
    Member.countDocuments({ memberType: 'returning' }),
  ]);
  res.json({ success: true, stats: { total, pending, approved, rejected, newMembers, returning } });
});

// GET /api/admin/members
router.get('/members', auth, async (req, res) => {
  const { status, type, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status     = status;
  if (type)   filter.memberType = type;
  if (search) filter.$or = [
    { fullName: { $regex: search, $options: 'i' } },
    { email:    { $regex: search, $options: 'i' } },
    { nickname: { $regex: search, $options: 'i' } },
  ];
  const [members, total] = await Promise.all([
    Member.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit))
      .select('-__v'),
    Member.countDocuments(filter),
  ]);
  res.json({ success: true, members, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// PATCH /api/admin/members/:id — update status and/or role
router.patch('/members/:id', auth, async (req, res) => {
  const { status, role } = req.body;
  const update = {};
  if (status) update.status = status;
  if (role)   update.role   = role;
  const member = await Member.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!member) return res.status(404).json({ message: 'Member not found.' });
  res.json({ success: true, member });
});

module.exports = router;
