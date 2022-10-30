require('dotenv').config();

const Server = require('./Server');

const Sv = new Server();
Sv.init();
