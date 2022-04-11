/*
 * 统一登录器js
 * @author hanzh
 * @date 2013-11-18
 */

define(["require", "sq.core"],function ( require,SQ ) {
    
    /**
	 * 外端调用js的接口
	 * @param cmd {int} 调用的命令
	 * @param param_s {object} 传入的数据
	 * @constructor
	 */
	function WebSuperCall( cmd, param_s ) {
		var Box = require("box"),param=null;
		try{
			param = $.parseJSON(param_s);
		}catch(e){
			param = null;
		}
		var func = {
				201: function() {
					//错误页面
					Box.User.toError(param);
				},
	            202: function() {
	            	//登录页和注册页切换的相关处理
	                game.changeForm( (param.logintype == 1) ? "log-form" : "reg-form", "c" );
	            },
	            203: function() {
	                location.href = decodeURIComponent( param.url );
	            },
	            210: function() {
	            	var played = Box.Played;
					if (param && $.isArray(param.gamedata)) {
	                    played.handler(param.gamedata);
	                } else {
	                    played.getUserGame();
	                }
	            },
	            211: function() {
	                Box.User.getScore();
	            },
	            213: function() {
	            	//重新登录
					Box.User.reLogin(param);
	            },
	            214: function() {
		        	var info = param.clientinfo;
		        	delete param.clientinfo;
					Box.Client.setInfo(param);
		        	if ( info === "alternate" && typeof(game) === "object" ) {
		        		game.register.setRegData(param);
		        		return;
		        	}
		            window.tgReg.setRegData(param);
	            },
				215: function() {
                    game.browserType = "ie";
					game.login.initAccount(param);
				},
                216: function(){
                    game.browserType = "chrome";
                    game.login.initAccount(param);
                }
			};
	    func[ cmd ]();
	}

	/**
	 * js调用外端的接口
	 * @param command {int} 调用的命令
	 * @param json {json} 传出的数据
	 * @constructor
	 */
	function DoSuperCall( command, json ) {
		try{
			var func = {
				103: function() {
					return {
						name: "getcookie"
					};
				}
			};
			json = json || func[ command ]();
			//SQ.log(stringify( json ));
			window.external.DoSuperCall( command, stringify( json ));
		}catch ( e ) {}
	}

	/**
	 * 从js传出的数据需要进行处理
	 * @param value
	 * @param whitelist
	 * @returns {*}
	 */
	function stringify( value, whitelist ) {
		var a, i, k, l, r = /["\\\x00-\x1f\x7f-\x9f]/g,v;
		switch ( typeof value ) {
			case 'string':
				return r.test( value ) ? '"' + value.replace( r,
					function( a ) {
						var c = m[a];
						if ( c ) {
							return c;
						}
						c = a.charCodeAt();
						return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
					}) + '"': '"' + value + '"';
			case 'number':
				return isFinite( value ) ? String( value ) : 'null';
			case 'boolean':
			case 'null':
				return String( value );
			case 'object':
				if ( !value ) {
					return 'null';
				}
				if ( typeof value.toJSON === 'function' ) {
					return stringify( value.toJSON() );
				}
				a = [];
				if ( typeof value.length === 'number' && !(value.propertyIsEnumerable('length')) ) {
					l = value.length;
					for ( i = 0; i < l; i += 1 ) {
						a.push( stringify( value[i], whitelist ) || 'null' );
					}
					return '[' + a.join(',') + ']';
				}
				if ( whitelist ) {
					l = whitelist.length;
					for (i = 0; i < l; i += 1) {
						k = whitelist[i];
						if (typeof k === 'string') {
							v = stringify(value[k], whitelist);
							if (v) {
								a.push(stringify(k) + ':' + v);
							}
						}
					}
				} else {
					for (k in value) {
						if (typeof k === 'string') {
							v = stringify(value[k], whitelist);
							if (v) {
								a.push(stringify(k) + ':' + v);
							}
						}
					}
				}
				return '{' + a.join(',') + '}';
		}
	}

	/**
	 * 从外端传进的数据需要进行处理
	 * @param text
	 * @param filter
	 * @returns {*}
	 */
	function parse(text, filter) {
		var j;
		function walk(k, v) {
			var i, n;
			if (v && typeof v === 'object') {
				for (i in v) {
					if (Object.prototype.hasOwnProperty.apply(v, [i])) {
						n = walk(i, v[i]);
						if (n !== undefined) {
							v[i] = n;
						} else {
							delete v[i];
						}
					}
				}
			}
			return filter(k, v);
		}
		if (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
			j = eval('(' + text + ')');
			return typeof filter === 'function' ? walk('', j) : j;
		}
		throw new SyntaxError('parseJSON');
	}

	window.WebSuperCall = WebSuperCall;

    return {
        WebSuperCall: WebSuperCall,
        DoSuperCall: DoSuperCall,
        stringify: stringify,
        parse: parse
    }
});