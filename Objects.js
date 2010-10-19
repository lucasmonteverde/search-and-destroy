/*!
 * Search And Destroy - Objetos
 *
 * Copyright (c) 2010 Lucas Monteverde <monteverde13@yahoo.com.br>
 * Code licensed under the GPLv3 License:
 * http://uneduetre.com.br/lucas/license.txt
 */
 
(function(){
	var isFn = function(fn) { return typeof fn == "function"; };
	Class = function(){};
	Class.create = function(proto) {
		var k = function(magic) { // call init only if there's no magic cookie
			if (magic != isFn && isFn(this.init)) this.init.apply(this, arguments);
		};
		k.prototype = new this(isFn); // use our private method as magic cookie
		for (key in proto) (function(fn, sfn){ // create a closure
			k.prototype[key] = !isFn(fn) || !isFn(sfn) ? fn : // add _super method
			function() { this._super = sfn; return fn.apply(this, arguments); };
		})(proto[key], k.prototype[key]);
		k.prototype.constructor = k;
		k.extend = this.extend || this.create;
		return k;
	};
})();
 
//var Personagem = function(){}

var Personagem = Class.create({
	vida:	500,
	morto:	 false,
	arma: 0, //Arma Inicial
	tiroInicial: 0,
	armas: [],
	
	init:function(name,type,pos){
		this.name = name,
		this.x = pos[0],
		this.y = pos[1],
		this.rotate = 0,
		this.type = type;
		this.setPlayer(type),
		
		this.canvasElem = makeCanvas(name,this.w,this.h),
		this.canvas = this.canvasElem.getContext("2d"),
		this.bullets = [];
		
		loadJson('json/armas.json',this.defineArmas,this);
		
	},
	
	setPlayer: function(type){
		this.frame = [];
		if(type == "Ally"){
			this.frame[0] = preloader.getResource('soldier1');
			this.frame[1] = preloader.getResource('soldier1_fire');
			
		}else{
			this.frame[0] = preloader.getResource('soldier2');
			this.frame[1] = preloader.getResource('soldier2_fire');
		}
		this.frame[2] = preloader.getResource('dead');
		this.w = this.frame[0].width;
		this.h = this.frame[0].height;
		this.w2 = this.w/2;
		this.h2 = this.h/2;
	},
	
	drawSelf: function(canvas){
		//this.updateSelf();
		var f;
		if( (this.tiroInicial > (new Date().getTime() - 200))) f = 1;
		else this.tiroInicial = f = 0;
		
		this.canvas.save();
		
		this.canvas.clearRect(0,0,this.w,this.h);
		this.canvas.translate(this.w2,this.h2);
		//this.canvas.rotate((Math.random() * 6) -4 );
		this.canvas.rotate(this.rotate);
		this.canvas.drawImage(this.frame[f], -this.w2, -this.h2,this.w,this.h);
		
		canvas.drawImage(this.canvasElem, this.x - this.w2, this.y - this.h2); 
		this.canvas.restore();

		for(var i = 0; i < this.bullets.length; i++){
			var b = this.bullets[i];
			if(b.getAlcance()) b.drawSelf(canvas);
			else this.bullets.splice(i,1);
		};
		
	},
	atira: function(){
		if(this.tiroInicial == 0 ){
			if( this.updateBalas(true) ){
				this.tiroInicial = new Date().getTime();
				this.bullets.push( this.fire(this.armas[this.arma]) );
				return true;
			}else{
				log("No Bulelts");
				return false;
			}
		}
	},
	fire: function(arm){
		return new Bullet(this.x ,this.y,this.rotate, arm.vel , arm.forca, arm.img);
	},
	updatePanel: function(b){
		if(this.type != "Ally") return;
		var b = b || this.armas[this.arma];
		this.armaElem.innerHTML = "Weapon: "+ b.nome;
		this.balasElem.innerHTML = "Bullets: "+ b.balas;
	},
	updateBalas: function(fire){
		var b = this.armas[this.arma];
		if(b.balas < 1) return false;
		if(fire){
			b.balas--;
			this.updatePanel(b);
		}
		return b.balas + parseInt(fire?1:0);
	},
	recarregar:  function(){
		this.armas[this.arma].balas = this.armas[this.arma].maxBalas;
	},
	defineArmas: function(data,obj){
		for(var o in data){
			data[o].img =  preloader.getResource( data[o].img );
		}
		//obj.__proto__.__proto__.armas = data; //tenso!
		obj.__proto__.armas = data;
		obj.updatePanel();
	},
	setArmas:function(data){
		this.armas = data;
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
}),



Jogador = Personagem.extend({
	//this.init(name,type,pos);
	/**/ 
	init: function(name, type, pos) { 
		this._super(name, type, pos); 
		this.armaElem = $("arma"),
		this.balasElem = $("balas");
	},
	
	recarregar: function(){
		Personagem.prototype.recarregar.call(this);
		this.updatePanel();
	}
	/**/
	
});

var Point = function(x,y){
	return [Math.floor(x/32) || 10, Math.floor(y/32) || 10]
},

StateType = {Patrulhar: 1, Combate: 2, Perseguir: 3, Atirar: 4, Fugir: 5, Morto: 0},

Inimigo = Personagem.extend({
	//this.init(name,type,pos);
	
	init: function(name, type, pos, cenario,player) { 
		this._super(name, type, pos); 
		this.vel 			= 0; //distancia percorrida;
		this.speed			= 2;
		this.state 			= StateType.Patrulhar;
		this.player 		= player;
		this.cenario 		= cenario;
		this.grid 			= cenario.getMapa();
		this.CampoVisao 	= 350;
		this.tempoInit 		= 0;
		this.newRoute		= true;
		this.newPerseguir	= true;
		this.solution		= 0;
		
		this.delay = 0;
	},
	
	ChangeState: function(state){
		this.state = StateType[state];
	},
	
	updateSelf: function(check){
		//if(this.vel < this.distancia)
		var preX = this.x + this.xSpeed,
			preY = this.y + this.ySpeed,
			spaceX = parseInt(this.xSpeed>0?16:-16),
			spaceY = parseInt(this.ySpeed>0?16:-16);
			
		if(check){
			if(this.cenario.checkTile(preX + spaceX, preY + spaceY)){
				this.setLocationTo(preX,preY);
				this.vel += this.speed;
			}
		}else{
			this.setLocationTo(preX,preY);
			this.vel += this.speed;
		}
	},
	
	setDistancia:function(x1,y1){
		this.distancia = Math.sqrt((x1 * x1) + (y1 * y1));
		this.setRotate(x1, y1);
	},
	
	
	novaRota: function(){
		console.log("nova patrulha");
		this.delay = parseInt((Math.random() * 6000) + 1500);
		
		var newX = parseInt((Math.random() * 80) + this.x - 40),
			newY = parseInt((Math.random() * 80) + this.y - 40);
		
		this.setDistancia(newX - this.x, newY - this.y);
	},
	
	
	Patrulhar: function(){
		if(this.tempoInit == 0) this.tempoInit = new Date().getTime();

		if(this.newRoute){
			this.novaRota();
			
			this.xSpeed = this.speed * Math.cos(this.rotate);
			this.ySpeed = this.speed * Math.sin(this.rotate);
			
			this.vel = 0;
			this.newRoute = false;
		}

		if((this.tempoInit > (new Date().getTime() - this.delay))){

			this.updateSelf(true);
		} else{
			this.tempoInit = 0;
			this.newRoute = true;
		}
	},

	novaPerseguicao: function(){
		var result = AStar(this.grid, Point(this.x,this.y), Point(this.player.x,this.player.y), "EuclideanFree");
		this.solution = result.length;
		if(result.length > 1){
			var node = result[1],
			resX = this.x % 32, 
			resY = this.y % 32;
			
			this.setDistancia((node[0] * 32 + resX) - this.x, (node[1] * 32 + resY) - this.y);
		}
	},
	
	Perseguir: function(){
		if(this.newPerseguir){
			//console.log("new perseguir is true");
			this.novaPerseguicao();
			
			this.xSpeed = (this.speed * 2) * Math.cos(this.rotate);
			this.ySpeed = (this.speed * 2) * Math.sin(this.rotate);
			
			this.vel = 0;
			this.newPerseguir = false;
		}
		
		//console.log( this.vel, this.distancia);
		
		if(this.vel < this.distancia){
			this.updateSelf();
		} else{
			this.newPerseguir = true;
		}
	},
	
	localizarJogador: function(campo){
		var xl = this.player.x - this.x,
			yl = this.player.y - this.y,
			dist = Math.sqrt((xl * xl) + (yl * yl)),
			virar = Math.atan2(yl, xl);

		if(this.player.morto){
			this.ChangeState('Patrulhar');
			return false;
		}

		if(dist <= this.CampoVisao){
			if(campo)//localização somente por raio
				if((virar < this.rotate + 0.8 && virar > this.rotate - 0.8) || dist < 100)//localização por angulo
					return this.jogadorNaMira(virar);
				else
					return false;
			else
				return this.jogadorNaMira(atual);
		} else
			return false;

	},

	/*
	 * Verifica se o jogador esta em uma linha reta em relação ao inimigo
	 * Recebe o angulo em que rotaciona o inimigo de frente com o jogador
	 * se a linha for formada sem ser interrompida por algum obstaculo;
	 */
	jogadorNaMira: function(virar){
		var t = 0,lineX = 0,lineY=0;
		while(t < 1){
			lineX = parseInt(this.x + (this.player.x - this.x) * t);
			lineY = parseInt(this.x + (this.player.y - this.x) * t);
			t += 0.1;
			//log(lineX,lineY);
			if(!this.cenario.checkTile(lineX, lineY)) return false;
		}
		/* with(canvas){
			save();
			beginPath();
			moveTo(this.x, this.y);
			lineTo(lineX, lineY);
			fill();
			stroke();
			closePath();
			restore();
		} */
		
		this.rotate = virar;
		return true;
	},
	
	UpdateState: function(){
		//log(this.state);
		switch(this.state){
			/**/
			case StateType.Patrulhar:
				if(this.localizarJogador(true))
					this.ChangeState('Combate');
				else
					this.Patrulhar();

				break;
			/**/
			case StateType.Combate:
				if(this.player.morto){
					this.newRoute = true;
					this.ChangeState('Patrulhar');
					break;
				}

				if(this.vida >= 20){
					this.ChangeState('Atirar');
				}else
					this.ChangeState('Fugir');

				break;
			/**/
			case StateType.Atirar:
				if(this.localizarJogador(true)){
					if(this.updateBalas() < 1) this.recarregar();
					this.atira();
					this.ChangeState('Combate');
				} else{
					this.newPerseguir = true;
					this.ChangeState('Perseguir');
				}
				break;
			/**/
			case StateType.Perseguir:
				this.Perseguir();

				if(this.localizarJogador(true)){
					this.ChangeState('Combate');
					break;
				}

				if(this.solution > 20){
					this.newRoute = true;
					this.ChangeState('Patrulhar');//giveUp
				}
				break;
			/** /
			case Fugir:		
				
				if(this.localizarJogador(false)){
					//fugir();
				}else{
					this.newRoute = true;
					this.ChangeState(StateType.Patrulhar);
				}
				break;
			/**/
			case StateType.Morto: break;

		}//end switch
	}
});

var Bullet = function(x,y,r,speed,damage,image){
	this.forcaImpacto = damage;
	this.bullet = image;
	
	this.xSpeed = speed * Math.cos(r);
	this.ySpeed = speed * Math.sin(r);
	
	//previne que a municao sai de cima do personagem;
	this.x = x + this.xSpeed * 4;
	this.y = y + this.ySpeed * 4;
	this.v = 0;
	this.w = this.bullet.width/2;
	this.h = this.bullet.height/2;

	this.updateSelf = function(){
		this.x += this.xSpeed;
		this.y += this.ySpeed;
		this.v++;
	};
	this.drawSelf = function(canvas){
		this.updateSelf();
		canvas.save();
		canvas.drawImage(this.bullet, this.x - this.w, this.y - this.h);
		canvas.restore();
	};
	
	this.getAlcance = function(){
		if(this.v > 60) return false;
		else return true;
	}
};