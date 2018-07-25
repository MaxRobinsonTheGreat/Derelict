'use strict'

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
      this.declareDeath(client);
    }
  },

  // resets the clients last heart beat to now
  beat: function(client){
    client.last_beat = Date.now();
  },

  // this function is redefined in the server.js so it has access the the game
  declareDeath: function(client){
    console.log("ERROR: The declareDeath function has not been implemented");
  }

}
