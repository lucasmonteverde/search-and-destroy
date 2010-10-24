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
 
var Point = function(x,y){
	return [Math.floor(x/32) || 10, Math.floor(y/32) || 10]
},
StateType = {Patrulhar: 1, Combate: 2, Perseguir: 3, Atirar: 4, Fugir: 5, Morto: 0},
Bullet = function(){this.init.apply(this,arguments)},

Personagem = Class.create({
	vida:		100,
	morto:	 	false,
	arma: 		0, //Arma Inicial
	tiroInicial:0,
	rotate: 0,
	
	
	init:function(name,type,pos){
		this.name = name,
		this.x = pos[0],
		this.y = pos[1],
		this.type = type;
		this.setPlayer(type),
		
		this.bullets = [];
		this.armas = [],
		
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
		
		if(this.morto){
			f = 2;
		}
		
		canvas.save();
		canvas.translate(this.x,this.y);
		canvas.rotate(this.rotate);
		canvas.drawImage(this.frame[f], -this.w2, -this.h2, this.w,this.h);
		canvas.restore();

		/** /
		for(var i = 0; i < this.bullets.length; i++){
			var b = this.bullets[i];
			if(b.getAlcance()) b.drawSelf(canvas);
			else this.bullets.splice(i,1);
		};
		/**/
		
	},
	hitTest:function(x, y){
		var pX = this.x - 16,
			pY = this.y - 16;
		if(x > pX && x < pX + 32 && y > pY && y < pY + 32)
			return true;
		else
			return false;
	},

	/*
	 * Método é executado quando o personagem for atingido, recebe a força da bala,
	 * descontando da sua vida;
	 * 
	 * Inicia o audio de dano tomado ou se personagem for morte, o audio de morte;
	 */
	hitBy:function(bala){
		this.vida -= bala;
		if(this.vida < 0) this.vida = 0;
		
		this.updatePanel();
		if(this.vida > 1){
			SoundManager('hit');
			//audioHit.start();
		}else if(!this.morto){
			SoundManager('die');
			//audioMorte.start();
			this.morto = true;
		}
	},
	atira: function(){
		if(this.tiroInicial == 0 ){
			if( this.updateBalas(true) ){
				this.tiroInicial = new Date().getTime();
				this.bullets.push( this.fire(this.armas[this.arma]) );
				return true;
			}else{
				SoundManager('empty');
				log("No Bulelts");
				return false;
			}
		}
	},
	chuvaDeMeteoros: function(){
		if(this.tiroInicial == 0 ){
			this.tiroInicial = new Date().getTime();
			var b = this.armas[this.arma];
			for(var i = 0; i<18;i++){
				this.rotate += 0.35;
				this.bullets.push( this.fire(b) );
			}
		}
	},
	fire: function(arm){
		SoundManager(arm.audio);
		//preloader.getResource(arm.audio).play();
		return new Bullet(this.x ,this.y,this.rotate, arm.vel , arm.forca, arm.img);
	},
	updatePanel: function(b){
		if(this.type != "Ally") return;
		var b = b || this.armas[this.arma];
		//Make a HTML String;
		this.painel.innerHTML = '<span id="hp">HP: '+ this.vida + '</span>' +
								'<span id="arma">Weapon: '+ b.nome + '</span>' +
								'<span id="balas">Bullets: '+ b.balas + '</span>';
	},
	updateBalas: function(fire){
		var b = this.armas[this.arma];
		if(b.balas < 1) return false;
		if(fire){
			b.balas--;
			this.updatePanel(b);
			return b.balas + 1;
		}
		return b.balas;
	},
	recarregar:  function(){
		this.armas[this.arma].balas = this.armas[this.arma].maxBalas;
	},
	defineArmas: function(data,obj){
		for(var i=0;i<data.length;i++){
			data[i].img =  preloader.getResource( data[i].img );
		}
		obj.armas = data;
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
		this._super(name, type, pos),
		this.vida = 500,
		this.painel = $('painel');
		//this.vidaElem = $("hp"),
		//this.armaElem = $("arma"),
		//this.balasElem = $("balas");
	},
	
	recarregar: function(){
		Personagem.prototype.recarregar.call(this);
		this.updatePanel();
	}
	/**/
	
});

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
		this.campoVisao 	= 350;
		this.tempoInit 		= 0;
		this.newRoute		= true;
		this.newPerseguir	= true;
		this.solution		= 0;
		
		this.delay = 0;
	},
	
	drawSelf: function(){
		Personagem.prototype.drawSelf.apply(this,arguments);
		this.UpdateState();
	},
	
	ChangeState: function(state){
		this.state = StateType[state];
	},
	
	updateSelf: function(check){
		if(this.vel < this.distancia){
			var pX = this.x, pY = this.y,
				spaceX = this.xSpeed>0?16:-16,
				spaceY = this.ySpeed>0?16:-16;
				
			//console.log("px",pX + spaceX,"py",pY);
			if(check){
				if(this.cenario.checkTile(pX + spaceX, pY)){
					this.x += this.xSpeed;
					this.vel++;
				}else this.vel = this.distancia;
				
				if(this.cenario.checkTile(pX, pY + spaceY)){
					this.y += this.ySpeed;
					this.vel++;
				}else this.vel = this.distancia;
				
			}else{
				this.setLocation(this.xSpeed,this.ySpeed);
				this.vel += this.speed;
			}
		}
	},
	
	setDistancia:function(x1,y1){
		this.distancia = Math.sqrt((x1 * x1) + (y1 * y1));
		this.setRotate(x1, y1);
	},
	
	
	novaRota: function(){
		//console.log("nova patrulha");
		this.delay = parseInt((Math.random() * 6000) + 1500);
		
		var newX = parseInt((Math.random() * 80) + this.x - 40),
			newY = parseInt((Math.random() * 80) + this.y - 40);
		
		this.setDistancia(newX - this.x, newY - this.y);
		
		this.xSpeed = this.speed * Math.cos(this.rotate);
		this.ySpeed = this.speed * Math.sin(this.rotate);
		this.vel = 0;
	},
	
	
	Patrulhar: function(){
		if(this.tempoInit == 0) this.tempoInit = new Date().getTime();

		if(this.newRoute){
			this.novaRota();
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
			this.xSpeed = (this.speed * 2) * Math.cos(this.rotate);
			this.ySpeed = (this.speed * 2) * Math.sin(this.rotate);
			this.vel = 0;
		}
	},
	
	Perseguir: function(){
		if(this.newPerseguir){
			this.novaPerseguicao();
			this.newPerseguir = false;
		}
		
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

		if(dist <= this.campoVisao){
			if(campo)//localização somente por raio
				if((virar < this.rotate + 0.8 && virar > this.rotate - 0.8) || dist < 100)//localização por angulo
					return this.jogadorNaMira(virar,dist);
				else
					return false;
			else
				return this.jogadorNaMira(this.rotate);
		} else
			return false;

	},

	/*
	 * Verifica se o jogador esta em uma linha reta em relação ao inimigo
	 * Recebe o angulo em que rotaciona o inimigo de frente com o jogador
	 * se a linha for formada sem ser interrompida por algum obstaculo;
	 */
	jogadorNaMira: function(virar,dist){
		var t = 0,lineX = this.x,lineY=this.y;
		
		var xSpeed = 28 * Math.cos(virar),
			ySpeed = 28 * Math.sin(virar);
		
		for(var v =0; v<dist;v+=32){
			lineX += xSpeed;
			lineY += ySpeed;
			if(!this.cenario.checkTile(lineX, lineY)) return false;
		}
		/* with(canvas){
			beginPath();
			moveTo(this.x, this.y);
			lineTo(lineX, lineY);
			stroke();
			closePath();
		} */
		
		//var startAngle = this.rotate - 0.7, endAngle = this.rotate + 0.7;
		//var inside = false;
	
		/* with(canvas){
			save();
			fillStyle = "rgba(200,0,0,.5)";
			beginPath();
			moveTo(this.x, this.y);
			lineTo(this.campoVisao * Math.cos(startAngle) + this.x, this.campoVisao * Math.sin(startAngle) + this.y);
			arc(this.x, this.y, this.campoVisao, startAngle, endAngle, false);
			inside = isPointInPath(this.player.x,this.player.y);
			fill();
			closePath();
			restore();
		} */
		this.rotate = virar;
		return true;
	},
	
	baleado: function(){
		this.ChangeState('Combate');
		this.setDistancia(this.player.x - this.x, this.player.y - this.y);
	},
	
	UpdateState: function(){
		//log(this.state);
		if(this.morto) this.ChangeState('Morto');
			
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

Bullet.prototype = {
	dist: 0,
	
	init: function(x,y,r,speed,damage,image){
		this.forcaImpacto = damage;
		this.bullet = image;
		this.w = this.bullet.width/2;
		this.h = this.bullet.height/2;
		
		this.xSpeed = speed * Math.cos(r);
		this.ySpeed = speed * Math.sin(r);
		
		//previne que a municao sai de cima do personagem;
		this.x = x + this.xSpeed * 4;
		this.y = y + this.ySpeed * 4;
	},

	updateSelf: function(){
		this.x += this.xSpeed;
		this.y += this.ySpeed;
		this.dist++;
	},
	
	drawSelf: function(canvas){
		this.updateSelf();
		canvas.save();
		canvas.drawImage(this.bullet, this.x - this.w, this.y - this.h);
		canvas.restore();
	},
	
	getAlcance: function(){
		if(this.dist > 60) return false;
		else return true;
	}
};