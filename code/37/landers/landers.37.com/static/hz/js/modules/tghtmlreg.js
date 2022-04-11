/**
 * 游戏盒子推广浮框注册模块
 */
require.config( {
    baseUrl: "/static/hz/js",
    urlArgs: "t=20160509103000VER&c=c",
    paths: {
        "jQuery": "lib/landers.core",
        "sq.core": "lib/sq.core",
        "sq.tab": "http://ptres.37.com/js/sq/widget/sq.tab",
        "sq.statis": "http://ptres.37.com/js/sq/widget/sq.statis",
        "sq.tooltip": "http://ptres.37.com/js/sq/widget/sq.tooltip",
        "sq.login": "http://ptres.37.com/js/sq/widget/sq.login",
        "box": "modules/box",
        "client": "client",
        "swfobject": "http://ptres.37.com/js/sq/plugin/swfobject"
    },
    shim: {
        "sq.core": {
            deps: [ "jQuery" ],
            exports: "SQ"
        },
        'sq.statis': {
            deps: [ 'sq.core' ]
        },
        "sq.tab": {
            deps: [ "sq.core" ],
            exports: "SQ.Tab"
        },
        'sq.tooltip': {
            deps: [ 'sq.core' ]
        },
        "sq.login": {
            deps: [ 'sq.core' ]
        }
    }
} );
require( [ "sq.core", "box", "client", "sq.login" ], function( SQ, Box, client ) {
    var DefaultDataMeta = {
        game_id: "",
        installtime: "",
        refer: "",
        uid: "",
        version: "",
        showlogintype: ""
    };

    var tgReg = window.tgReg = {
        param: {},
        /**
         * 进入游戏的链接
         */
        gameUrl: "http://gameapp.37.com/controller/enter_game.php?game_id={gameid}&sid={sid}&showlogintype=4&wd_entergame=1&wd_NAME={gamename}&wd_GAME_KEY={gamekey}&wd_SID={sid}&wd_GAME_ID={gameid}&wd_username={login_account}&wd_SNAME={server_name}&error_url={error_url}",

        init: function() {
            this.getDom();
            this.events();
            client.DoSuperCall( 118, {
                clientinfo: ""
            } );
        },
        /**
         * 获取所有需要的dom元素
         */
        getDom: function() {
            this.$countDown = $( "#countDown" );
            this.$tgPop = $( "#tgPop" );
            this.username = $( "#reg-username" );
            this.password = $( "#reg-password" );
            this.password1 = $( "#reg-password2" );
        },
        /**
         * 绑定事件
         */
        events: function() {
            var _this = this;
            if ( !this.$tgPop || this.$tgPop.length === 0 ) {
                return;
            }
            this.$tgPop.one( "click", function( e ) {
                    //window.clearInterval(_this.timeInt);
                    _this.$countDown.html( "" );
                    if ( e.target.id.indexOf( "btn-close" ) > -1 ) {
                        return;
                    }
                    _this.$tgPop.children( ".reg-panel" ).show();
                } )
                .on( "click.closeFloat", ".btn-close", function( e ) {
                    //_this.hideTg();
                } )
                .on( "click.closegb", "#btn-closegb", function( e ) {
                    //_this.hideTg();
                } )
                .on( "keypress.game", "#reg-username, #reg-password, #reg-password2", function( e ) {
                    if ( e.keyCode === 13 ) {
                        _this.toReg();
                    }
                } )
                .on( "click.register", "a.btn-enter", function( e ) {
                    e.preventDefault();
                    _this.toReg();
                } )/*.on( "mouseover", ".gift-box a", function( event ) {
                    event.preventDefault();
                    var $tar = $( this ),
                        $giftContent = _this.$tgPop.find( ".gift-box" ),
                        $as = $giftContent.children( "a" ),
                        num = $as.index( $tar[ 0 ] ) + 1,
                        cls = $tar.attr( "class" );
                    $as.each( function() {
                        var cls2 = $( this ).attr( "class" );
                        if ( cls2.indexOf( "-hover" ) > -1 ) {
                            cls2 = cls2.replace( "-hover", "" );
                            $( this ).removeClass().addClass( cls2 );
                        }
                    } );
                    if ( cls.indexOf( "-hover" ) === -1 ) {
                        $tar.removeClass().addClass( cls + "-hover" );
                    }
                    $( "#arrow" ).removeClass().addClass( "arrow" + num );
                } )*/;
        },
        /**
         * 设置倒计时
         */
        setCountdown: function() {
            var time = 0,
                t = 0,
                _this = this;
            time = this.$tgPop.data( "tgtime" ) || 60;
            this.timeInt = window.setInterval( function() {
                t = --time;
                if ( t < 0 ) {
                    _this.hideTg();
                }
                _this.$countDown.html( t + "秒" );
            }, 1000 );
        },
        /**
         * 隐藏推广端注册弹窗
         */
        hideTg: function() {
            this.$tgPop.hide().prevAll( "div.tg-pop-bg" ).hide();
            //window.clearInterval( this.timeInt );
        },
        /**
         * 设置注册时需要的数据。该方法被客户端214接口回调
         * @param param
         */
        setRegData: function( param ) { //tgReg.setRegData({gameid:237})
            window.DefaultDataMeta = $.extend( DefaultDataMeta, param );
            DefaultDataMeta.game_id = this.param.ID = param.gameid;
            this.getServerInfo();
        },
        /**
         * 获取游戏服数据
         */
        getServerInfo: function() {
            var that = this;
            $.ajax( {
                url: "/get_game_key.php",
                dataType: "json",
                data: {
                    game_id: DefaultDataMeta.game_id
                }
            } ).done( function( r ) {
                if ( !$.isEmptyObject( r ) ) {
                    that.param.NAME = r.game_name;
                    that.param.GAME_KEY = r.game_key;
                    that.param.SID = r.newest_server.SID;
                    that.param.SERVER_NAME = r.newest_server.SERVER_NAME;
                    DefaultDataMeta.server_id = r.newest_server.ID;
                }
            } );
        },
        /**
         * 根据游戏参数，生成进入游戏的链接
         * @returns {string}
         */
        getUrl: function() {
            var param = this.param;
            return this.gameUrl.replace( /{gameid\}/g, param.ID )
                .replace( /{sid\}/g, param.SID )
                .replace( "{gamename}", encodeURIComponent( param.NAME ) )
                .replace( "{gamekey}", param.GAME_KEY )
                .replace( "{login_account}", this.LOGIN_ACCOUNT )
                .replace( "{server_name}", encodeURIComponent( param.SERVER_NAME ) )
                .replace( "{error_url}", "" );
        },
        /**
         * 开始注册
         */
        toReg: function() {
            var uTip, pTip,
                that = this,
                sqLogin = SQ.Login,
                options = {
                    login_account: this.username.val(),
                    password: this.password.val(),
                    password1: this.password1.val(),
                    url: that.getUrl(),
                    success: function() {
                        window.open( options.url );
                        window.location.reload();
                    },
                    fail: function( res ) {
                        if ( res && res.message ) {
                            alert( res.message );
                        }
                    }
                };

            if ( ( uTip = sqLogin.checkUsername( options.login_account, true ) ) !== true ) {
                //CC.inputStatus( this.username, "status-w" );
                alert( uTip );
                return;
            } else {
                //CC.inputStatus( this.username, "status-r" );
            }

            if ( ( pTip = sqLogin.checkPassword( options.password, options.login_account ) ) !== true ) {
                //CC.inputStatus( this.password, "status-w" );
                alert( pTip );
                return;
            } else {
                //CC.inputStatus( this.password, "status-r" );
            }

            if ( options.password !== options.password1 ) {
                //CC.inputStatus( this.password1, "status-w" );
                alert( "两次密码输入不一致" );
                return;
            } else {
                //CC.inputStatus( this.password1, "status-r" );
            }
            this.LOGIN_ACCOUNT = options.login_account;
            DefaultDataMeta.version = "floatimg";
            //window.game.register["toRegPostAd"]($.extend(options, DefaultDataMeta));
            //改为统一调用Box.User下的方法
            options.source = 1;
            Box.User.toRegPostAd( $.extend( options, DefaultDataMeta ) );
            //this.toRegPostAd($.extend(options, DefaultDataMeta));
        }
    };

    $( document ).ready( function( $ ) {
        tgReg.init();
    } );
} );