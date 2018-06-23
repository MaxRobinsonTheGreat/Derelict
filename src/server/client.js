let client = module.exports = class {
  constructor(connection) {
    this.connection = connection;
    this.player = undefined;//added in game.js addClient()
  }

  on(name, funct) {
    this.connection.on(name, funct);
  }

  sendToAll(sending_object) {
    this.connection.emit('all', sending_object);
  }

  sendCorrection(sending_object) {
    this.connection.emit('correction', sending_object);
  }
};
