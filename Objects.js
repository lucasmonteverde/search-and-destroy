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
	rotate: 0,
	morto:	 false,
	arma: 0, //Arma Inicial
	max: 0,
	tiroInicial: 0,
	armas: new Array(),
	frame: new Array(),
	
	init:function(name,type,pos){
		this.name = name,
		this.x = pos[0],
		this.y = pos[1],
		this.setPlayer(type),
		
		this.canvasElem = makeCanvas(name,this.w,this.h),
		this.canvas = this.canvasElem.getContext("2d");
		this.bullets = [];
	},
	
	setPlayer: function(type){
		this.frame[0] = preloader.getResource('soldier1');
		this.frame[1] = preloader.getResource('soldier1_fire');
		this.frame[2] = preloader.getResource('dead');
		this.w = this.frame[0].width;
		this.h = this.frame[0].height;
		this.w2 = this.w/2;
		this.h2 = this.h/2;
	},
	
	drawSelf: function(){
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
			if(b.getAlcance()) b.drawSelf();
			else this.bullets.splice(i,1);
		};
		
	},
	atira: function(){
		if(this.tiroInicial == 0 ){
			if( this.updateBalas(true) ){
				this.tiroInicial = new Date().getTime();
				this.bullets.push( this.fire(this.armas[this.arma]) );
			}else{
				log("No Bulelts");
			}
		}
	},
	fire: function(arm){
		return new Bullet(this.x ,this.y,this.rotate, arm.vel , arm.forca, arm.img);
	},
	updatePanel: function(b){
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

Inimigo = Personagem.extend({
	//this.init(name,type,pos);
	//self=this;
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
	//loadJson('json/armas.json',this.defineArmas);
	
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
		//console.log("X = "+this.xPos+" : Y = "+this.yPos);
	};
	this.drawSelf = function(){
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