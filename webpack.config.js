const path = require('path');

const config = {
  entry: './src/client/client_game.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js'
  }
};

module.exports = config;
