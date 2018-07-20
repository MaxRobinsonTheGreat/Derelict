'use strict'

const audio_list = require('./audio_list');

module.exports = {

	loadAudioFiles: function(){
    this.audio_map = new Map();
		for(let info of audio_list){

			let sound = new Audio("audio/"+info.src);

			this.audio_map.set(info.title, sound);
		}
    return this;
	},

	play: function(title){
    let audio = this.audio_map.get(title);

		if (!audio.paused){
			var temp_audio = audio.cloneNode();
			temp_audio.play();
		}
		else{
			audio.play();
		}
	}
}
