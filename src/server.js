require('dotenv').config();
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
const app = require('./app');
const port = Number(process.env.PORT || 3000);
app.listen(port, ()=>console.log(`FreshCart Sprint 2 API running on http://localhost:${port}`));
