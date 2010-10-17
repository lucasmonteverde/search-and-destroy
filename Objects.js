/*!
 * Search And Destroy - Objetos
 *
 * Copyright (c) 2010 Lucas Monteverde <monteverde13@yahoo.com.br>
 * Code licensed under the GPLv3 License:
 * http://uneduetre.com.br/lucas/license.txt
 */
 
Personagem = function(){}

Personagem.prototype = {
	vida:	500,
	morto:	 false,
	bullets: [],
	armas: {},
	tiroInicial: 0,
	arma: 0, //Arma Inicial
	
	init:function(name,type,x,y,r){
		this.name = name,
		this.x = x,
		this.y = y,
		this.rotate = r,
		this.setPlayer(type),
		
		this.canvasElem = makeCanvas(name,this.w,this.h),
		this.canvas = this.canvasElem.getContext("2d")
		
		/** /
			this.armaElem = $("arma"),
			this.balasElem = $("balas");
			loadJson('json/armas.json',this.setArmas);
		/**/
		
		
	},
	
	setPlayer: function(type){
		this.frame[0] = preloader.getResource('soldier1');
		this.frame[1] = preloader.getResource('soldier1_fire');
		this.frame[2] = preloader.getResource('dead');
		this.w = frame[0].width;
		this.h = frame[0].height;
		this.w2 = this.w/2;
		this.h2 = this.h/2;
	},
	
	drawSelf: function(){
		//this.canvas.clearRect(0,0,mapSize[0],mapSize[1]);
		//this.updateSelf();
		var f;
		if( (this.tiroInicial > (new Date().getTime() - 200))) f = 1;
		else this.tiroInicial = f = 0;
		
		/**/ 
		this.canvas.save();
		
		this.canvas.clearRect(0,0,this.w,this.h);
		this.canvas.translate(this.w2,this.h2);
		this.canvas.rotate(this.rotate);
		this.canvas.drawImage(this.frame[f], -this.w2, -this.h2/2,this.w,this.h);
		
		canvas.drawImage(this.canvasElem, this.x - this.w2, this.y - this.h2); 
		/**/
		
		for(var i = 0; i < this.bullets.length; i++){
			var b = this.bullets[i];
			if(b.getAlcance()) b.drawSelf();
			else this.bullets.splice(i,1);
		};
		
		this.canvas.restore();
	},
	atira: function(){
		if(this.tiroInicial == 0 ){
			this.tiroInicial = new Date().getTime();

			if( this.updateBalas(true) ){
				this.bullets.push( this.fire(this.armas[this.arma]) );
			}else{
				log("No Bulelts");
			}
		}
	},
	fire: function(arm){
		return new Bullet(this.x ,this.y,this.rotate, arm.vel , arm.forca, arm.img);
	},
	updateBalas: function(fire){
		var b = this.armas[this.arma]; 
		if(b.balas < 1) return false;
		if(fire){
			b.balas--;
		}
		return b.balas// + parseInt(fire?1:0);
	},
	updatePanel: function(){
		var b = this.armas[this.arma];
		this.armaElem.innerHTML = "Weapon: "+ b.nome;
		this.balasElem.innerHTML = "Bullets: "+ b.balas;
	},
	recarregar:  function(){
		this.armas[this.arma].balas = this.armas[this.arma].maxBalas;
		/** /
			TODO: Jogador fara overhide desse metodo adicionando update Panel;
			 Personagem.prototype.recarregar.call(this);
		/**/
	},
	setArma: function(value){
		if(value < this.armas.length){
			this.arma = value;
			this.updatePanel();
		}
	},
	getPosition: function(){
		return new Array(this.x,this.y);
	},
	setRotate: function(x, y){
		this.rotate = Math.atan2(y, x);
	},
	setLocation: function(x,y){
		this.x += x;
		this.y += y;
	},
	setLocationTo: function(x,y){
		this.x = x;
		this.y = y;
	},
	getX: function(){
		return this.x;
	},
	getY: function(){
		return this.y;
	}

}

var Player = function(name, type, x, y ){
	
	//this.audioHit = Resources.getAudio("audio/hit1.wav"); 
	//this.audioMorte = Resources.getAudio("audio/die1.wav");
	var self = this;
	this.name 		= name;
	this.vida 		= 500;
	this.rotate		= 0;
	this.morto		= false;
	
	this.x = x;
	this.y = y;
	
	this.bullets = [];
	this.armas = [];
	var frame = [];
	
	this.arma = 0;
	var tiroInicial = 0;
	var armaElem = $("arma"),
		balasElem = $("balas"),
		w,h;
	
	this.setPlayer = function(type){
		frame[0] = preloader.getResource('soldier1');
		frame[1] = preloader.getResource('soldier1_fire');
		frame[2] = preloader.getResource('dead');
		w = frame[0].width;
		h = frame[0].height;
	};
	
	this.setArmas = function(data){
		for(var o in data){
			data[o].img =  preloader.getResource( data[o].img );
		}
		self.armas = data;
		self.checkBalas();
	}
	
	this.setPlayer(type);
	
	//this.canvas = $("p").getContext("2d");
	var canvasElem = makeCanvas(name,w,h);
	this.canvas = canvasElem.getContext("2d");
	
	loadJson('json/armas.json',this.setArmas);
	
	this.drawSelf = function(){
		//this.canvas.clearRect(0,0,mapSize[0],mapSize[1]);
		//this.updateSelf();
		
		if( (tiroInicial > (new Date().getTime() - 200))) f = 1;
		else tiroInicial = f = 0;
		
		/** /
		this.canvas.translate(-newX, -newY);
		this.canvas.save();
		
		this.canvas.translate(this.x, this.y);
		this.canvas.rotate(this.rotate);
		this.canvas.drawImage(frame[f], -frame[f].width/2, -frame[f].height/2); 
		/**/
		
		/**/ 
		this.canvas.save();
		
		this.canvas.clearRect(0,0,w,h);
		this.canvas.translate(w/2,h/2);
		this.canvas.rotate(this.rotate);
		this.canvas.drawImage(frame[f], -w/2, -h/2,w,h);
		
		canvas.drawImage(canvasElem, this.x - w/2, this.y - h/2); 
		/**/
		
		/** HP Bar (Bugged) **/
		/* this.canvas.fillStyle = "white";
		this.canvas.strokeRect(this.x - frame[f].width/2 - 1, (this.y - frame[f].height) + 9, frame[f].width + 2, 4);
		this.canvas.fillStyle = "red";
		this.canvas.fillRect(this.x -frame[f].width/2, this.y - frame[f].height + 10, (frame[f].width * 100) / 100 + 1, 3); 
		*/
		
						
		//Handle weapons (Ordinance, ordnance)
		for(var i = 0; i < this.bullets.length; i++){
			var b = this.bullets[i];
			if(b.getAlcance())
				b.drawSelf();
			else {
				this.bullets.splice(i,1);
				b = null;
			}
		};
		
		this.canvas.restore();
	},
	this.setRotate = function(x, y){
		this.rotate = Math.atan2(y, x);
	};
	this.setLocation = function(x,y){
		this.x += x;
		this.y += y;
	}
	this.setLocationTo = function(x,y){
		this.x = x;
		this.y = y;
	}
	this.atira = function(){
		if(tiroInicial == 0 && this.checkBalas() ){
			tiroInicial = new Date().getTime();

			if( this.checkBalas(true) ){
				this.bullets.push( this.fire(this.armas[this.arma]) );
			}
		}
	}
	this.getPosition = function(){
		return new Array(this.x,this.y);
	}
	this.setArma = function(value){
		if(value < this.armas.length){
			this.arma = value;
			this.checkBalas();
		}
	}
	this.fire = function(arm){
		return new Bullet(this.x ,this.y,this.rotate, arm.vel , arm.forca, arm.img);
	}
	
	this.checkBalas = function(fire){
		var b = this.armas[this.arma]; 
		if(fire){
			if(b.balas < 1) return false;
			b.balas--;
		}
		armaElem.innerHTML = "Weapon: "+ b.nome;
		balasElem.innerHTML = "Bullets: "+ b.balas;
		return b.balas + parseInt(fire?1:0);
	}
	this.recarregar =  function(){
		this.armas[this.arma].balas = this.armas[this.arma].maxBalas;
		this.checkBalas();
	}
	this.getX = function(){
		return this.x;
	}
	this.getY = function(){
		return this.y;
	}
};

var Inimigo = function(name, type, pos){
	
	var x = pos[0],y = pos[1],frame = [],w, h;
	
	
	this.setPlayer = function(type){
		frame[0] = preloader.getResource('soldier2');
		frame[1] = preloader.getResource('soldier2_fire');
		frame[2] = preloader.getResource('dead');
		w = frame[0].width;
		h = frame[0].height;
	};
	
	this.setPlayer(type);
	
	//Cada um em um frame é insano!;
	//Descobrir a porra da formula de rotacionar um canvas pintar o objeto, e des-rotacionar;
	var canvasElem = makeCanvas(name,w,h);
	this.canvas = canvasElem.getContext("2d");

	this.drawSelf = function(){
		//var f = 0;
		this.canvas.save();
		
		this.canvas.clearRect(0,0,w,h);
		
		this.canvas.translate(w/2,h/2);
		
		//this.canvas.rotate((Math.random() * 6) -4 );
		//var r = 90 * (Math.PI / 180);
		//this.canvas.rotate(r);
		
		this.canvas.drawImage(frame[0], -w/2, -h/2,w,h);
		
		canvas.drawImage(canvasElem, x - w/2, y - h/2);

		this.canvas.restore();
	};
	//this.z = 0;
	//console.log(this);

};

var Bullet = function(x,y,r,speed,damage,image){
	this.forcaImpacto = damage;
	this.bullet = image;
	
	this.xSpeed = speed * Math.cos(r);
	this.ySpeed = speed * Math.sin(r);
	
	//previne que a municao sai de cima do personagem;
	this.xPos = x + this.xSpeed * 4;
	this.yPos = y + this.ySpeed * 4;
	this.v = 0;
	this.w = this.bullet.width/2;
	this.h = this.bullet.height/2;

	this.updateSelf = function(){
		this.xPos = parseInt( this.xPos + this.xSpeed ,10);
		this.yPos = parseInt( this.yPos + this.ySpeed ,10);
		this.v++;
		//console.log("X = "+this.xPos+" : Y = "+this.yPos);
	};
	this.drawSelf = function(){
		this.updateSelf();

		canvas.save();
		canvas.drawImage(this.bullet, this.xPos - this.w, this.yPos - this.h);
		canvas.restore();
	};
	
	this.getAlcance = function(){
		if(this.v > 60) return false;
		else return true;
	
	}
};