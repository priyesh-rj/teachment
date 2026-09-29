const path = require('path');

// Allow resolving packages from server/node_modules
if (module.paths.indexOf(path.join(__dirname, '..', 'server', 'node_modules')) === -1) {
  module.paths.push(path.join(__dirname, '..', 'server', 'node_modules'));
}

const app = require('../server/index');
const db = require('../server/config/db');

let isInitialized = false;

module.exports = async (req, res) => {
  if (!isInitialized) {
    try {
      await db.initDatabase();
      isInitialized = true;
    } catch (err) {
      console.error('Vercel API DB Init Error:', err);
    }
  }
  return app(req, res);
};
