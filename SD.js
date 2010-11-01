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
	Audio.prototype.isRunning = function(){
		if(this.currentTime == this.duration || this.currentTime == 0)
			return false;
		else return true;
	};

	var SD = function(){
		preloader = {},SoundManager = {}, bullets = [];
		
		var frames = 0, tempoInicial = 0, interval, paused = false, fpsCounter, msg,
			mouseX = 800, mouseY = 100, newMouse = [0,0],
			moveX = 0, moveY = 0, spaceX = 0, spaceY = 0,
			mClick = false, keyOn = [],
			canvas ={}, gui , cenario, player, inimigos = [],inimigosL=0,inimigosMortos=0,mapSize = [];
			
			
		var screenSize = (window.innerHeight - 600) /2;
		d.body.style.marginTop = screenSize > 0? screenSize + "px":0;
		
		var audio = [4];
		var lastA = 0;
		var format = navigator.userAgent.indexOf("Chrome") > 0 ? '.mp3': '.wav';
		
		var init = function(){
			log('Start');
			
			canvas = $("c").getContext("2d");
			gui = $("gui").getContext("2d");
			fpsCounter = $("fps");
			msg = $('message');
			
			cenario = new Cenario;
			loadJson('json/mapa1.json',cenario.processMap);
			
			cenario.onFinish = function(){
				mapSize = this.mapSize;
				interval = setInterval(updateScreen,33);
			
				player = new Jogador("Begode", "Ally", this.getPlayerLocation() );
				for(var i = 0; i < cenario.getInimigosCount(); i++)
					inimigos.push( new Inimigo("Inimigo", "Rebels", this.getInimigoLocation(i), this,player) );
					
				inimigosL = inimigos.length;
				
				audio[0] = preloader.getResource('walk1');
				audio[1] = preloader.getResource('walk2');
				audio[2] = preloader.getResource('walk3');
				audio[3] = preloader.getResource('walk4');
				
			};
		};
		
		

		
		preloader = new Preloader(
			{
				mapa:			'images/mapa1.png',
				player1:		'images/player1.png',
				player2:		'images/player2.png',
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
			},
			0.2
		);

		preloader.onFinish = init;
		preloader.load();

		SoundManager = function(s){
			var sound = typeof s == "string" ? preloader.getResource(s) : s;
			
			
			sound.currentTime = 0;
			sound.play();
		};
		
		//var gui = $("gui").getContext("2d");
		
		var updateObjects = function(){
			//canvas.clearRect(newMouse[0],newMouse[1],816,616);
			
			/* gui.save();
			gui.clearRect(0,540,800,60);
			gui.fillStyle = "rgba(0,0,0,0.2)";
			gui.fillRect(0,540,800,60);
			gui.fillStyle = "rgb(0,0,0)";
			
			gui.font = "18pt Arial";
			gui.fillText(player.vida, 80, 580);
			var b = player.armas[player.arma];
			gui.fillText(b.nome, 400, 580);
			gui.fillText(b.balas, 500, 580);
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
				
				if(!audio[lastA].isRunning()){
					var a = parseInt((Math.random() * 4));
					audio[a].currentTime = 0;
					audio[a].play();
					lastA = a;
				}
			}
			
			
			cenario.drawSelf(canvas,newX,newY);
			
			for(var i = 0; i < inimigosL; i++){
				inimigos[i].drawSelf(canvas);
			}
			
			player.drawSelf(canvas);
			
			if(!msg.set) player.setRotate(newMouse[0] + mouseX - pX, newMouse[1] + mouseY - pY);
			
		},
		
		updateBullets = function(){
		
			/* for(var b = 0, bullets = player.bullets; b< bullets.length;b++){
				var bl = player.bullets[b];
				if( cenario.checkTile(bl.x, bl.y) && bl.getAlcance()){
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
					bl.drawSelf(canvas);
				}else bullets.splice(b,1);
			} */

			//Handle enemies
			/* for(var i = 0; i < inimigosL; i++){
				var en = inimigos[i];
				en.drawSelf(canvas);
				for(var b = 0,enBullets = en.bullets; b < enBullets.length; b++){
					var bl = en.bullets[b];
					if( cenario.checkTile(bl.x, bl.y) && bl.getAlcance()){
						if(player.hitTest(bl.x,bl.y)){
							player.hitBy(bl.forcaImpacto);
							enBullets.splice(b,1);
							continue;
						}
						bl.drawSelf(canvas);
					}else enBullets.splice(b,1);
				}
			} */
			

			for(var b = 0; b< bullets.length;b++){
				var bl = bullets[b];
				if( cenario.checkTile(bl.x, bl.y) && bl.getAlcance()){
					if(player.hitTest(bl.x,bl.y)){
						player.hitBy(bl.forcaImpacto);
						bullets.splice(b,1);
						continue;
					}
					for(var en = 0;en<inimigosL; en++){
						if(inimigos[en].hitTest(bl.x,bl.y)){
							if(inimigos[en].hitTest(bl.x,bl.y) && !inimigos[en].morto){
								inimigos[en].hitBy(bl.forcaImpacto);
								inimigos[en].baleado();
								if(inimigos[en].morto)inimigosMortos++;
								bullets.splice(b,1);
								continue;
							}
						}
					}
					bl.drawSelf(canvas);
				}else bullets.splice(b,1);
			}
		}
		
		setMessage = function(message, set){
			msg.innerHTML = message;
			msg.style.top = (window.innerHeight - 18) / 2 + "px";
			msg.style.left = (window.innerWidth - msg.offsetWidth) / 2 + "px";
			msg.set = set;
		}

		updateScreen = function(){
			if(player.morto)
				var action = "GAME OVER MOTHAFUCKER";
			else if(inimigosL == inimigosMortos)
				var action = "FUCK YEAH YOU WIN";
			
			if(action && !msg.set){
				setMessage(action,true);
			}
			
			if(!action)checkKeys();
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
				if(msg.innerHTML != "") {
					reset();
					return;
				}
				setMessage("PAUSED",false);
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