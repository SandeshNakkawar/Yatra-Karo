const dotenv = require('dotenv');
dotenv.config();

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const mongoose = require('mongoose');
const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(
  //process.env.DATABASE_LOCAL, {
  DB, {
   //useNewUrlParser: true,
    //useCreateIndex: true
  // useUnifiedTopology: true
}).then( (con) => {
  // console.log(con.connections);
  console.log("Database is successfully connected... !!!")
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});


const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
