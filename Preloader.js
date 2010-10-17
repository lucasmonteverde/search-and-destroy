/*!
 * Preloader from Infiltration at Dusk - Zachary Johnson, July 2010
 * http://www.zachstronaut.com/projects/infiltration/game.html
 *
 * Modifield by Lucas Monteverde <monteverde13@yahoo.com.br>
 */
Preloader = function(imageDictionary, audioDictionary){

	var totalToLoad = 0, leftToLoad = 0,resources = {};
	
	//window.addEventListener('load', somethingLoaded, false);
	var self = this;
	
	this.load = function(){
		if (typeof Audio != 'undefined' && audioDictionary){
			for (a in audioDictionary){
				totalToLoad++;
				resources[a] = new Audio();
				resources[a].addEventListener('canplaythrough', somethingLoaded, false);
				resources[a].autobuffer = true;
				resources[a].src = audioDictionary[a];
				resources[a].load();
			}
		}
		
		if (imageDictionary){
			for (i in imageDictionary){
				totalToLoad++;
				resources[i] = new Image();
				resources[i].addEventListener('load', somethingLoaded, false);
				resources[i].src = imageDictionary[i];
			}
		}
	};
	
	function somethingLoaded(){
		leftToLoad++;
		self.onProgress(leftToLoad / totalToLoad);
		
		if (leftToLoad == totalToLoad){
			self.onFinish();
		}
	};
	
	this.getResource = function (name){
		return resources[name];
	};
	
	this.onProgress = function(p) {  };
	
	this.onFinish = function() {};
	
	
}