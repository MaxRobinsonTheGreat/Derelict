const image_list = require('./image_list');

var image_container = module.exports = {

  getImageContainer: function() {
    if(this.instance) {
      return this.instance;
    }
    else {
      this.image_map = new Map();
      this.loaded_image_counter = 0;
      this.outdated_sprites = [];
      this.loadImages();
    }
  },

	loadImages: function(){
		for(let info of image_list){

			let img = new Image();

			img.onload = () => {
				this.imageLoaded();
			}

			img.src = "./img/" + info.src;
			info.img = img;

			this.image_map.set(info.title, info);
		}
		images_info = [];
	},

	imageLoaded: function(){
		// is this the last image to load?
		if(this.loaded_image_counter++ != images_info.length) return;
		// at this point we know that all images have been loaded

		this.updateSprites();
	},

	updateSprites: function(){
		for(let s of this.outdated_sprites){
			s.imageFinished();
		}
	},

	get: function(title){
		return this.image_map.get(title);
	},

  pushOutDated: function(sprite){
    this.outdated_sprites.push(sprite);
  }
}
