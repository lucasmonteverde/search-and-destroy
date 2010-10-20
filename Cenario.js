/*!
 * Search And Destroy - Cenario Object
 *
 * Copyright (c) 2010 Lucas Monteverde <monteverde13@yahoo.com.br>
 * Code licensed under the GPLv3 License:
 * http://uneduetre.com.br/lucas/license.txt
 */
 
var Cenario = function(){

	var	self = this, tS, mapa, mapPng, limitRight, limitDown,inimigos,mapSize;
	
	String.prototype.toInt = function(){
		return parseInt(this);
	}
	
	Array.prototype.Show = function(){
		var result = "";
		for(var i=0,l = this.length; i<l;i++){
			for(var j=0,m =this[0].length; j<m;j++){
				result += this[i][j] + " ";
			}
			result += "\n";
		}
		console.log(result);
	}
	
	this.processMap = function(data){
		mapa = data.matrix.split('\n\t\t');
		for(var i=0,l = mapa.length; i< l;i++){
			mapa[i] = mapa[i].split(' ');
			for(var j=0, m = mapa[0].length; j<m; j++){
				mapa[i][j] = mapa[i][j].toInt();
			}
			if(i < l - 1) mapa[i].pop();
		};
		tS = data.tamanho.tile;
		mapPng = preloader.getResource('mapa');
		mapSize = [tS *  50, tS * 30];
		limitRight = (tS * mapa[1].length) - 800;
		limitDown = (tS * mapa.length) - 600;
		inimigos = data.inimigos;
		
		
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
			var local = self.getPosTile(x, y);
			if(local == 0) return true;
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
	
	/** Verifica se a posição do jogador X está dentro do limite horizontal interno do mapa **/
	this.checkPosX = function(px){
		return (px > -5 && px < limitRight)?true:false;
	},

	/** Verifica se a posição do jogador Y está dentro do limite vertical interno do mapa  **/
	this.checkPosY = function(py){
		return (py > -5 && py < limitDown)?true:false;
	},
	
	this.getInimigosCount = function(){
		return inimigos.length;
	},
	
	this.getInimigoLocation = function(i){
		return new Array( inimigos[i].x, inimigos[i].y );
	},
	
	this.getMapa = function(){
		return mapa;
	},
	this.getMapSize = function(){
		return mapSize;
	}
	this.GridGenerator = function(width, height){
		var	floor = Math.floor,
			random = Math.random,
			result = new Array(height);
		for(var	j, i = 0; i < height; i++) {
			result[i] = new Array(width);
			for(j = 0; j < width; j++)
				result[i][j] = (j * i) % 7 ? floor(random() * 200) % 2 : 0;
		};
		return result;
	};
};