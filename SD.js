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
	};
	
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
		return d.getElementById(id);
	};

	var SD = function(){
		preloader = {}, canvas ={};
		
		var frames = 0, tempoInicial = 0, interval, paused = false, fpsCounter, msg,
			mouseX = 800, mouseY = 100, newMouse = [0,0],
			moveX = 0, moveY = 0, spaceX = 0, spaceY = 0,
			mClick = false, keyOn = [],
			cenario, player, inimigos = [],inimigosL=0,inimigosMortos=0,mapSize = [];
			
		var screenSize = (window.innerHeight - 600) /2;
		d.body.style.marginTop = screenSize > 0? screenSize + "px":0;
					
		
		var init = function(){
			log('Start');
			
			canvas = $("c").getContext("2d");
			fpsCounter = $("fps");
			msg = $('message');
			
			cenario = new Cenario;
			loadJson('json/mapa.json',cenario.processMap);
			
			cenario.onFinish = function(){
				mapSize = this.getMapSize();
				interval = setInterval(updateScreen,33) 
			
				player = new Jogador("Begode", "Ally", [50,50] );
			
				for(var i = 0; i < cenario.getInimigosCount(); i++)
					inimigos.push( new Inimigo("Inimigo", "Rebels", this.getInimigoLocation(i), this,player) );
					
				inimigosL = inimigos.length;
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

		preloader.onFinish = init;
		preloader.load();
		
		//var gui = $("gui").getContext("2d");
		
		var updateObjects = function(){
			canvas.clearRect(0,0,mapSize[0],mapSize[1]);
			
			/* gui.save();
			gui.clearRect(0,500,800,100);
			gui.fillStyle = "black";
			gui.fillRect(0,500,800,100);
			gui.fillStyle = "red";
			gui.font = "18pt Arial";
			//gui.fillText("OLA", 300, 580);
			gui.restore(); */
					
			var newX = 0, newY = 0,
				pX = player.x,
				pY = player.y;

				
			if(moveX != 0 || moveY != 0){
			
				if( cenario.checkTile(pX + spaceX,  pY )){
					if((pX > 400 && pX < 1210) && cenario.checkPosX(newMouse[0] + moveX) ) 
						newX = moveX;
					player.x += moveX
				}
				if( cenario.checkTile(pX,  pY + spaceY) ){
					if((pY > 290 && pY < 695) && cenario.checkPosY(newMouse[1] + moveY) ) 
						newY = moveY;
					player.y += moveY;
				}
				newMouse[0] += newX;
				newMouse[1] += newY;
			}
			
			
			cenario.drawSelf(canvas,newX,newY);
			
			player.setRotate(newMouse[0] + mouseX - pX, newMouse[1] + mouseY - pY);
			player.drawSelf(canvas);
			
			for(var b = 0; b< player.bullets.length;b++){
				var bl = player.bullets[b];
				if( cenario.checkTile(bl.x, bl.y) && bl.getAlcance()){
					for(var en = 0;en<inimigosL; en++){
						if(inimigos[en].hitTest(bl.x,bl.y) && !inimigos[en].morto){
							inimigos[en].hitBy(bl.forcaImpacto);
							if(inimigos[en].morto)inimigosMortos++;
							player.bullets.splice(b,1);
						}
					}
					bl.drawSelf(canvas);
				}else player.bullets.splice(b,1);
			}

			//Handle enemies
			for(var i = 0; i < inimigosL; i++){
				inimigos[i].drawSelf(canvas);
				inimigos[i].UpdateState();
				for(var b = 0; b< inimigos[i].bullets.length;b++){
					var bl = inimigos[i].bullets[b];
					if( cenario.checkTile(bl.x, bl.y) && bl.getAlcance()){
						if(player.hitTest(bl.x,bl.y)){
							player.hitBy(bl.forcaImpacto);
							inimigos[i].bullets.splice(b,1);
							continue;
						}
						bl.drawSelf(canvas);
					}else inimigos[i].bullets.splice(b,1);
				}
			}
			
			
		},

		updateScreen = function(){
			if(player.morto)
				var action = "GAME OVER MOTHAFUCKER";
			else if(inimigosL == inimigosMortos)
				var action = "FUCK YEAH YOU WIN";
			
			if(action && !msg.set){
				msg.innerHTML = action;
				msg.style.top = (window.innerHeight - 18) / 2 + "px";
				msg.style.left = (window.innerWidth - msg.offsetWidth) / 2 + "px";
				msg.set = true;
			}
			
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
		
		pause = function(){
			if(paused){
				interval = setInterval(updateScreen,33);
				paused = false;
			}else {
				clearInterval(interval);
				paused = true;
			}
		
		},
		
		reset = function(){
			console.log("reset");
			inimigosMortos=0
			inimigos = [],
			$('c').width = 800;
			newMouse = [0,0],
			$('message').innerHTML = '';
			clearInterval(interval);
			init();
		}
		
		checkKeys = function() {
			var velocity = (keyOn[16]) ? 8 + 20 : 8; // shift
			var space = 8 + velocity;
			moveX = 0, moveY = 0, spaceX = 0, spaceY = 0;
			
			if (keyOn[39] || keyOn[68]) { moveX = velocity; spaceX = space} //right arrow, d key
			if (keyOn[37] || keyOn[65]) { moveX = -velocity; spaceX = -space} //left arrow, a key
			if (keyOn[38] || keyOn[87]) { moveY = -velocity; spaceY = -space} //up arrow, w key
			if (keyOn[40] || keyOn[83]) { moveY = velocity; spaceY = space} //down arrow, s key
			
			if(keyOn[32] ) {player.recarregar();}
			if(mClick) {player.atira();}
			if(keyOn[66]) {player.ChuvaDeMeteoros();}
			if(keyOn[82]) {player.morto = false; player.vida = 500; $('message').innerHTML = '';}
			
			//if(keyOn[27] || keyOn[80]) pause();
			//if (keyOn[13]) { } // enter
			
			if (keyOn[49]) { player.setArma(0); } // 1
			else if (keyOn[50]) { player.setArma(1); } // 2
			else if (keyOn[51]) { player.setArma(2); } // 3
			else if (keyOn[52]) { player.setArma(3); } // 4
		};
		
		makeCanvas = function(id, width, height, append) {
			var canvas = document.createElement("canvas");
			canvas.id = id;
			canvas.width = Number(width) || 0;
			canvas.height = Number(height) || 0;
			if (append) {
				document.body.appendChild(canvas);
			}
			return canvas;
		};
		/*
		canvas.addEventListener('touchstart', function(e){mouseX = e.touches[0].pageX, mouseY = e.touches[0].pageY; mClick = true;}, false);
		canvas.addEventListener('touchmove', function(e){mouseX = e.touches[0].pageX, mouseY = e.touches[0].pageY;}, false);
		canvas.addEventListener('touchend', function(){mClick = false;}, false);*/
		d.onmousemove = function(e){mouseX = e.offsetX||e.layerX;mouseY = e.offsetY||e.layerY;};
 
		d.onmousedown = function() { mClick = true;};
		d.onmouseup = function() { mClick = false;};
		d.onselectstart = function() { return false; };
		d.onkeydown = function(e){keyOn[ (e||window.event).keyCode ] = true; if (keyOn[27]) pause(); if(keyOn[32]) { e.preventDefault?e.preventDefault():e.returnValue = false;}};
		d.onkeyup = function(e){ keyOn[ (e||window.event).keyCode ] = false;};
		
		$("reset").onmousedown = function(){ reset()};
		
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