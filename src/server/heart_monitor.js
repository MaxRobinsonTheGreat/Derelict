'use strict'
const Logger = require("./logger");
module.exports = {

	setClients: function(clients){
    this.clients = clients;
    this.survival_time = 5; // after 5 minutes of no interaction, the client will be kicked
		clients.forEach(function getLocations(cur_client, cur_name, map){
      cur_client.last_beat = Date.now();
    });
	},

  beginMonitor: function() {
    this.monitor_time = 30; // 30 seconds between each check
    this.interval = setInterval(function(){this.monitor();}.bind(this), this.monitor_time * 1000);
		Logger.log("HEARTMONITOR: monitoring...");
  },

	pauseMonitor: function() {
		clearInterval(this.interval);
		this.interval = null;
		Logger.log("HEARTMONITOR: Paused.");
	},

	isRunning: function() {
		return this.interval != null;
	},

  // called every 30 seconds
	monitor: function(title){
    this.clients.forEach(function (cur_client, cur_name, map){
      this.checkPulse(cur_client);
    }.bind(this));
	},

  // if the client is in game it resets his last_beat
  // then it checks if enough time has passed since the last beat and kicks
  checkPulse: function(client){
    if(client.isInGame()){
      this.beat(client);
      return;
    }
    if (Date.now() - client.last_beat > this.survival_time * 60 * 1000) {
      this.destroyClient(client);
    }
		if(this.clients.size == 0) {
			this.pauseMonitor();
		}
  },

  // resets the clients last heart beat to now
  beat: function(client){
    client.last_beat = Date.now();
  },

	destroyClient: function(client){
	  if(!client.isInGame()){
			this.clients.delete(client.name);
			Logger.log("HEARTMONITOR: Client " + client.name + " removed due to inactivity");
	  }
		else {
			Logger.log("HEARTMONITOR: Tried to remove " + client.name + " when they were in game.");
		}
	}

}
