/*!
 *
 * Search And Destroy - HTML5 Demo Game
 *
 * Version: 0.5 (17-OUT-2010)
 * Copyright (c) 2010 Lucas Monteverde <monteverde13@yahoo.com.br>
 * Code licensed under the GPLv3 License:
 * http://uneduetre.com.br/lucas/license.txt
 */
 
(function(d,w,undefined){

	log = function() {
		if (window.console && window.console.log) window.console.log( Array.prototype.slice.call(arguments)) ;
	},
	
	loadJson = function(json,callback){
		try{
			var xhr = new XMLHttpRequest;
			xhr.open('GET', json);
			xhr.onload = function() { 
				callback(JSON.parse(xhr.responseText));
			};
			xhr.onerror = function() { log('request error', xhr);};
			xhr.send();
		}catch(e){
			log('request error', e.message);
		}
	},
	
	$ = function(id){
		return d.getElementById(id);
	},

	SD = function(){
		/** Globals **/
		preloader = {},canvas= {},mapSize = [800,600];
		
		var frames = 0, tempoInicial = 0,
			mouseX = 0, mouseY = 0, newMouse = [0,0],
			moveX = 0, moveY = 0, spaceX = 0, spaceY = 0,
			mClick = false, keyOn = [],
			cenario, player, inimigos =[];
			
		var screenSize = (window.innerHeight - 600) /2;
		d.body.style.marginTop = screenSize > 0? screenSize + "px":0;
					
		
		var start = function(){
			log('Start');
			
			canvas = $("c").getContext("2d");
			fpsCounter = $("fps");
			
			cenario = new Cenario();
			loadJson('json/mapa.json',cenario.processMap,true);
			cenario.onFinish = function(){ 
				setInterval(updateScreen,33) 
			
				player = new Player("Begode", "Ally", 50,50 );
			
				for(var i = 0; i < cenario.getInimigosCount(); i++)
					inimigos.push( new Inimigo("Inimigo", "Rebels", cenario.getInimigoLocation(i)) );
			
			};
		};
		
		preloader = new Preloader(
			{
				mapa:			'images/mapa.png',
				soldier1:		'images/soldier01.png',
				soldier1_fire:	'images/soldier01_fire.png',
				soldier2:		'images/soldier02.png',
				soldier2_fire:	'images/soldier02_fire.png',
				dead: 			'images/dead.png',
				greenBullet:	'images/bullets/green-round.png',
				blueBullet:		'images/bullets/blue-round.png',
				purpleBullet:	'images/bullets/purple-round.png'
			}
		);

		preloader.onFinish = start;
		preloader.load();
		
		//var gui = $("gui").getContext("2d");
		
		var updateObjects = function(){
			canvas.clearRect(0,0,mapSize[0],mapSize[1]);
			//canvasElem.style.backgroundPosition = -newX+"px "+ (-newY)+"px";
			
			/* gui.save();
			gui.clearRect(0,500,800,100);
			gui.fillStyle = "black";
			gui.fillRect(0,500,800,100);
			gui.fillStyle = "red";
			gui.font = "18pt Arial";
			//gui.fillText("OLA", 300, 580);
			gui.restore(); */
					
			var newX = 0, newY = 0,
				pX = player.getX(),
				pY = player.getY();
			 
			if(moveX != 0 || moveY != 0){
			
				if( cenario.checkTile(pX + spaceX,  pY )){
					if((pX > 400 && pX < 1210) && cenario.checkPosX(newMouse[0] + moveX) ) newX = moveX;
					player.x += moveX
				}
				if( cenario.checkTile(pX,  pY + spaceY) ){
					if((pY > 290 && pY < 695) && cenario.checkPosY(newMouse[1] + moveY) ) newY = moveY;
					player.y += moveY;
				}
			}
			
			newMouse[0] += newX;
			newMouse[1] += newY;
			
			cenario.drawSelf(newX,newY);
			
			player.setRotate(newMouse[0] + mouseX - pX, newMouse[1] + mouseY - pY);

			player.drawSelf();
			if(mClick) player.atira(); 
			
			//Handle enemies
			for(var i = 0; i < inimigos.length; i++){
				inimigos[i].drawSelf();
				//enemies.splice(i,1); i--;//Don't fear the reaper. }
			}
		},

		updateScreen = function(){
			checkKeys();
			updateObjects();
			
			if(tempoInicial == 0) tempoInicial = new Date().getTime();
			
			if(tempoInicial > (new Date().getTime() - 1000))
				frames++;
			else{
				fpsCounter.innerHTML = frames;
				tempoInicial = frames = 0;
			}
			
			/* rate.push(parseInt(+new Date - tempoInicial));
			if(rate.length > 30) {
				console.log(1000/rate.avg());rate.shift();
			}
			tempoInicial = +new Date; */
			
			//setTimeout(updateScreen,30);
		},
		
		checkKeys = function() {
			var velocity = (keyOn[16]) ? 8 + 20 : 8; // shift
			var space = 8 + velocity;
			moveX = 0, moveY = 0, spaceX = 0, spaceY = 0;
			
			if (keyOn[39] || keyOn[68]) { moveX = velocity; spaceX = space} //right arrow, d key
			if (keyOn[37] || keyOn[65]) { moveX = -velocity; spaceX = -space} //left arrow, a key
			if (keyOn[38] || keyOn[87]) { moveY = -velocity; spaceY = -space} //up arrow, w key
			if (keyOn[40] || keyOn[83]) { moveY = velocity; spaceY = space} //down arrow, s key
			//if (keyOn[13]) { } // enter
			
			;
			if (keyOn[49]) { player.setArma(0); } // 1
			else if (keyOn[50]) { player.setArma(1); } // 2
			else if (keyOn[51]) { player.setArma(2); } // 3
			else if (keyOn[52]) { player.setArma(3); } // 4
		},
		
		CharCode = function (code){
			return String.fromCharCode(code).toLowerCase();
		};
		var ze = 0;
		
		makeCanvas = function(id, width, height, append) {
			var canvas = document.createElement("canvas");
			canvas.id = id;
			canvas.width = Number(width) || 0;
			canvas.height = Number(height) || 0;
			if (append) {
				//canvas.style.display = "none";
				document.body.appendChild(canvas);
			}
			return canvas;
		};
		
		d.onmousemove = function(e){mouseX = e.offsetX||e.layerX;mouseY = e.offsetY||e.layerY;};
		d.onmousedown = function() { mClick = true;};
		d.onmouseup = function() { mClick = false;};
		d.onselectstart = function() { return false; };
		d.onkeydown = function(e){ keyOn[ (e||window.event).keyCode ] = true; if(keyOn[32] == true) { e.preventDefault(); player.recarregar() }};
		d.onkeyup = function(e){ keyOn[ (e||window.event).keyCode ] = false;};
		
		$("reset").onmousedown = function(){ player.setLocationTo(50,50);};
		
	};
	
	window.addEventListener('load', SD, false);
	
})(document,window);

Array.prototype.avg = function() {
	var av = 0, cnt = 0, len = this.length;
	for (var i = 0; i < len; i++) {
		var e = +this[i];
		if(!e && this[i] !== 0 && this[i] !== '0') e--;
		if (this[i] == e) {av += e; cnt++;}
	}
	return av/cnt;
};