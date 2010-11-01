/*!
 * Search And Destroy - Cenario Object
 *
 * Copyright (c) 2010 Lucas Monteverde <monteverde13@yahoo.com.br>
 * Code licensed under the GPLv3 License:
 * http://uneduetre.com.br/lucas/license.txt
 */
 
var Cenario = function(){

	var	self = this, tS, mapa, mapAI = [], mapPng, limitRight, limitDown,jogador,inimigos,mapSize;
	
	this.processMap = function(data){
		
		/* mapa = data.matrix.split('\n\t\t');
		for(var i=0,l = mapa.length; i< l;i++){
			mapa[i] = mapa[i].split(' ');
			for(var j=0, m = mapa[0].length; j<m; j++){
				mapa[i][j] = mapa[i][j].toInt();
			}
			if(i < l - 1) mapa[i].pop();
		}; */
		mapa = data.matrix.split(',');
		
		for(var i=0;i<30;i++){
			mapAI[i] = [];
			for(var j=0;j<50;j++)
				mapAI[i][j] = mapa[ 50* i  + j];
		}
		//console.log(mapAI);
		
		
		tS = data.tamanho.tile;
		mapPng = preloader.getResource('mapa');
		mapSize = [tS *  50, tS * 30];
		limitRight = (tS * 50) - 800;
		limitDown = (tS * 30) - 600;
		inimigos = data.inimigos;
		jogador = data.jogador;

		
		
		//mapa.Show();
		/** Map Generator **/
		/*
		tileset = preloader.getResource('tileset');
		tS = data.tamanho.tile;
		tilesetWidth = tileset.width / tS;
		tilesetHeight = tileset.height / tS;
		var map = d.getElementById("m");
		map.setAttribute('width', tS *  50);
		map.setAttribute('height',  tS * 30);
		
		canvasMap = map.getContext("2d");
		
		for(var i = 0; i < mapa.length; i++)
			for(var j = 0; j < mapa[0].length; j++)
				drawTile(mapa[i][j], j * tS, i * tS);
				
		canvasElem.style.background = "url("+ map.toDataURL() +")";
		map.parentNode.removeChild( map );
		*/
		self.onFinish();
	};
	
	this.onFinish = function() {},
	
	this.drawSelf = function(canvas,newX,newY){
		canvas.translate(-newX,-newY);
		canvas.drawImage(mapPng,0,0, mapSize[0],mapSize[1]);
	},
	
	this.drawTile = function(m, x, y){
		var mx = parseInt(m % tilesetWidth);
		var my = parseInt(m / tilesetHeight);
		canvasMap.drawImage(tileset, mx * tS, my * tS, tS, tS,x,y,tS,tS);
	},
	
	this.checkTile = function(x, y){
		try{
			var local = self.getPosTile2(x, y);
			if(local == 0) return true;
			/** /
			if(local == 2){
				new Explosion(x,y);
			}
			/**/
			else return false;
		}catch (e){
			log("Check Tile Fail",e);
		}
		return false;
	},

	/** Retorna o tile correspondete da posição x e y; **/
	this.getPosTile = function(x, y){
		return mapa[ parseInt(y / tS,10)][parseInt(x / tS,10)];
	},
	
	this.getPosTile2 = function(x, y){
		return mapa[ parseInt( 50* parseInt(y/32)  + parseInt(x/32) ) ];
	},
	
	/** Verifica se a posição do jogador X está dentro do limite horizontal interno do mapa **/
	this.checkPosX = function(px){
		return (px > -5 && px < limitRight)?true:false;
	},

	/** Verifica se a posição do jogador Y está dentro do limite vertical interno do mapa  **/
	this.checkPosY = function(py){
		return (py > -5 && py < limitDown)?true:false;
	},
	
	this.getMapa = function(){
		return mapa;
	},
	
	this.getInimigosCount = function(){
		return inimigos.length;
	},
	
	this.getInimigoLocation = function(i){
		return new Array( inimigos[i].x, inimigos[i].y );
	},
	
	this.getPlayerLocation = function(i){
		return new Array( jogador.x, jogador.y );
	};
};

var log = function() {
	if (window.console && window.console.log) window.console.log( Array.prototype.slice.call(arguments)) ;
},

loadJson = function(json,callback,obj){
	try{
		var xhr = new XMLHttpRequest;
		xhr.open('GET', json);
		xhr.onload = function() { 
			callback(JSON.parse(xhr.responseText),obj);
		};
		xhr.onerror = function() { log('request error', xhr);};
		xhr.send();
	}catch(e){
		log('request error', e.message);
	}
},

$ = function(id){
	return document.getElementById(id);
};

/*
makeCanvas = function(id, width, height, append) {
	log("new Canvas");
	var canvas = document.createElement("canvas");
	canvas.id = id;
	canvas.width = Number(width) || 0;
	canvas.height = Number(height) || 0;
	if (append) {
		document.body.appendChild(canvas);
	}
	return canvas;
};


String.prototype.toInt = function(){
	return parseInt(this);
}

Array.prototype.avg = function() {
	var av = 0, cnt = 0, len = this.length;
	for (var i = 0; i < len; i++) {
		var e = +this[i];
		if(!e && this[i] !== 0 && this[i] !== '0') e--;
		if (this[i] == e) {av += e; cnt++;}
	}
	return av/cnt;
}; 
	
Array.prototype.Show = function(){
	var result = "";
	for(var i=0,l = this.length; i<l;i++){
		for(var j=0,m =this[0].length; j<m;j++){
			result += this[i][j] + " ";
		}
		result += "\n";
	}
	console.log(result);
} */