Server (/server)

File	What it does
index.js	Express app, CORS, MongoDB connection
models/Member.js	Full member schema — all fields, status, role
models/InviteToken.js	Token schema — single-use, expiry tracked
models/Admin.js	Admin account with bcrypt hashed password
middleware/auth.js	JWT verification for protected routes
routes/members.js	POST /register (new) and POST /returning (invite)
routes/invite.js	Token validation (public) + generate/bulk (admin)
routes/admin.js	Login, stats, member list/filter, approve/reject/role
utils/cloudinary.js	Multer + Cloudinary storage for photo uploads
utils/email.js	Branded invite email + registration confirmation email
Client (/client)

Page	Route
Landing	/ — choose New or Returning member
New member form	/register — full form with T&C modal
Returning member form	/invite/[token] — validates token on load, pre-fills name/email
Admin login	/admin/login
Admin dashboard	/admin — stats, member table (filter/search/approve/reject/role), invite management