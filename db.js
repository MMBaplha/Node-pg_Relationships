/** Database setup for BizTime. */
const { Client } = require('pg');

const client = new Client({
  user: 'mb34',
  host: 'localhost',
  database: 'biztime', 
  password: '3473Heats@',
  port: 5432, 
});

client.connect()
  .then(() => console.log("Connected to the database successfully"))
  .catch(err => console.error("Connection error", err.stack));

module.exports = client;