require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');

const membersRouter = require('./routes/members');
const inviteRouter  = require('./routes/invite');
const adminRouter   = require('./routes/admin');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/members', membersRouter);
app.use('/api/invite',  inviteRouter);
app.use('/api/admin',   adminRouter);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    const port = process.env.PORT || 5002;
    app.listen(port, () => console.log(`Server on port ${port}`));
  })
  .catch(err => { console.error(err); process.exit(1); });
