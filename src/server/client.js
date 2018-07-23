let client = module.exports = class {
  constructor(name) {
    this.name = name;
    this.connection = null;
    this.player = undefined;//added in game.js addClient()
    this.game = null; // the name of the game that the client is connected to
  }

  on(name, funct) {
    this.connection.on(name, funct);
  }

  initEntities(sending_object) {
    this.connection.emit('init_entities', sending_object);
  }

  sendToAll(sending_object) {
    this.connection.emit('all', sending_object);
  }

  sendCorrection(sending_object) {
    this.connection.emit('correction', sending_object);
  }

  sendBullet(sending_object) {
    this.connection.emit('bullet', sending_object);
  }

  reduceHealth(sending_object) {
    this.connection.emit('reduce_health', sending_object);
  }

  kick() {
    this.game = '';
    this.connection.emit('died');
    this.connection.disconnect();
  }
};
