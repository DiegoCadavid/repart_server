require('dotenv').config();
require('colors');

const Server = require('./Server');

const Sv = new Server();
Sv.init();
