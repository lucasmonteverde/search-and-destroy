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

	var SD = function(){
		preloader = {},SoundManager = {};
		
		var frames = 0, tempoInicial = 0, interval, paused = false, fpsCounter, msg,
			mouseX = 800, mouseY = 100, newMouse = [0,0],
			moveX = 0, moveY = 0, spaceX = 0, spaceY = 0,
			mClick = false, keyOn = [],
			canvas ={}, cenario, player, inimigos = [],inimigosL=0,inimigosMortos=0,mapSize = [];
			
		var screenSize = (window.innerHeight - 600) /2;
		d.body.style.marginTop = screenSize > 0? screenSize + "px":0;
					
		
		var init = function(){
			log('Start');
			
			canvas = $("c").getContext("2d");
			fpsCounter = $("fps");
			msg = $('message');
			
			cenario = new Cenario;
			loadJson('json/mapa1.json',cenario.processMap);
			
			cenario.onFinish = function(){
				mapSize = this.mapSize;
				interval = setInterval(updateScreen,33) 
			
				player = new Jogador("Begode", "Ally", this.getPlayerLocation() );
				for(var i = 0; i < cenario.getInimigosCount(); i++)
					inimigos.push( new Inimigo("Inimigo", "Rebels", this.getInimigoLocation(i), this,player) );
					
				inimigosL = inimigos.length;
		
			};
		};
		
		var a = new Audio('');
		var canPlayWav = a.canPlayType('audio/x-wav');
		//var canPlayMp3 = ("no" != myAudio.canPlayType("audio/mpeg")) && ("" != myAudio.canPlayType("audio/mpeg"));
		var songfile = canPlayWav == '' || canPlayWav == 'no' || canPlayWav == 'maybe' ? 'audio/ak47.mp3' : 'audio/ak47.wav';
		var format = navigator.userAgent.indexOf("Chrome") > 0 ? '.mp3': '.wav';

		
		preloader = new Preloader(
			{
				mapa:			'images/mapa1.png',
				soldier1:		'images/soldier01.png',
				soldier1_fire:	'images/soldier01_fire.png',
				soldier2:		'images/soldier02.png',
				soldier2_fire:	'images/soldier02_fire.png',
				dead: 			'images/dead.png',
				greenBullet:	'images/bullets/green-round.png',
				blueBullet:		'images/bullets/blue-round.png',
				purpleBullet:	'images/bullets/purple-round.png'
			},
			{
				ak47:	'audio/ak47'+ format,
				deagle: 'audio/deagle'+ format,
				m4a1:	'audio/m4a1'+ format,
				die:	'audio/die'+ format,
				hit:	'audio/hit'+ format,
				empty: 	'audio/w_empty'+ format,
				walk1:	'audio/pl_dirt1'+ format,
				walk2:	'audio/pl_dirt2'+ format,
				walk3:	'audio/pl_dirt3'+ format,
				walk4:	'audio/pl_dirt4'+ format
			}
		);

		preloader.onFinish = init;
		preloader.load();

		SoundManager = function(s){
			var sound = preloader.getResource(s);
			sound.volume = 0.1;
			sound.currentTime = 0;
			sound.play();
			
			/** /
			for(var a=0;a<5;a++){
				console.log( sound[a].currentTime, sound[a].duration );
				if(sound[a].currentTime == sound[a].duration){
					sound[a].currentTime = 0;
					sound[a].play();
					break;
				}
				sound[a].play();
			}
			/**/
		};
		
		//var gui = $("gui").getContext("2d");
		
		var updateObjects = function(){
			//canvas.clearRect(newMouse[0],newMouse[1],816,616);
			
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
			
		},
		
		updateBullets = function(){
		
			for(var b = 0, bullets = player.bullets; b< bullets.length;b++){
				var bl = player.bullets[b];
				if( cenario.checkTile(bl.x, bl.y) && bl.getAlcance()){
					/**/
					for(var en = 0;en<inimigosL; en++){
						if(inimigos[en].hitTest(bl.x,bl.y)){
							if(inimigos[en].hitTest(bl.x,bl.y) && !inimigos[en].morto){
								inimigos[en].hitBy(bl.forcaImpacto);
								inimigos[en].baleado();
								if(inimigos[en].morto)inimigosMortos++;
								bullets.splice(b,1);
							}
						}
					}
					/**/
					bl.drawSelf(canvas);
				}else bullets.splice(b,1);
			}

			//Handle enemies
			for(var i = 0; i < inimigosL; i++){
				var en = inimigos[i];
				en.drawSelf(canvas);
				for(var b = 0,enBullets = en.bullets; b < enBullets.length; b++){
					var bl = en.bullets[b];
					if( cenario.checkTile(bl.x, bl.y) && bl.getAlcance()){
						/**/
						if(player.hitTest(bl.x,bl.y)){
							player.hitBy(bl.forcaImpacto);
							enBullets.splice(b,1);
							continue;
						}
						/**/
						bl.drawSelf(canvas);
					}else enBullets.splice(b,1);
				}
			}
			
			player.drawSelf(canvas);
		
		}
		
		setMessage = function(message){
			msg.innerHTML = message;
			msg.style.top = (window.innerHeight - 18) / 2 + "px";
			msg.style.left = (window.innerWidth - msg.offsetWidth) / 2 + "px";
			msg.set = true;
		}

		updateScreen = function(){
			if(player.morto)
				var action = "GAME OVER MOTHAFUCKER";
			else if(inimigosL == inimigosMortos)
				var action = "FUCK YEAH YOU WIN";
			
			if(action && !msg.set){
				setMessage(action);
			}
			
			checkKeys();
			updateObjects();
			updateBullets();
			
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
				msg.innerHTML = '';
				interval = setInterval(updateScreen,33);
				paused = false;
			}else {
				setMessage("PAUSED");
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
			if(keyOn[66]) {player.chuvaDeMeteoros();}
			if(keyOn[82]) {player.morto = false; player.vida = 500; player.updatePanel(); $('message').innerHTML = '';}
			
			//if(keyOn[27] || keyOn[80]) pause();
			//if (keyOn[13]) { } // enter
			
			if (keyOn[49]) { player.setArma(0); } // 1
			else if (keyOn[50]) { player.setArma(1); } // 2
			else if (keyOn[51]) { player.setArma(2); } // 3
			else if (keyOn[52]) { player.setArma(3); } // 4
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