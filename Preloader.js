/*!
 * Preloader from Infiltration at Dusk - Zachary Johnson, July 2010
 * http://www.zachstronaut.com/projects/infiltration/game.html
 *
 * Modifield by Lucas Monteverde <monteverde13@yahoo.com.br>
 */
Preloader = function(imageDictionary, audioDictionary,vol){

	var totalToLoad = 0, leftToLoad = 0,resources = {};
	
	//window.addEventListener('load', somethingLoaded, false);
	var self = this;
	
	this.load = function(){
		if (typeof Audio != 'undefined' && audioDictionary){
			for (a in audioDictionary){
				//resources[a] = [];
				//for(var i=0;i<5;i++){
					totalToLoad++;
					resources[a] = new Audio();
					resources[a].addEventListener('loadeddata', somethingLoaded, false);
					//resources[a].addEventListener('ended', function () {this.pause();this.currentTime = 0}, false);
					resources[a].autobuffer = true;
					resources[a].src = audioDictionary[a];
					resources[a].volume = vol;
					resources[a].load();
				//}
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
	
	function somethingLoaded(e){
		leftToLoad++;
		//console.log(e.target.src);
		self.onProgress(leftToLoad / totalToLoad);
		
		if (leftToLoad == totalToLoad){
			self.onFinish();
		}
	};
	
	this.getResource = function (name){
		return resources[name];
	};
	
	this.onProgress = function(p) { document.getElementById('hp').innerHTML = parseInt(p*100) + "%" };
	
	this.onFinish = function() { };
	
	
}