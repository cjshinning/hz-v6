/**
 * 盒子的基类，用于封闭通用功能
 * @param  {Object} SQ){var Box           [description]
 * @return {[type]}          [description]
 */
define(["require","sq.core","client","sq.tooltip","sq.login"],function(require,SQ,client){

var hosts = "37.com",
    isIE = function( ver ){
        var b = document.createElement('b');
        b.innerHTML = "<!--[if IE " + ver + "]><i></i><![endif]-->";
        return b.getElementsByTagName('i').length === 1;
    },
    $win = $(window),
    $doc = $(document);

var TJFROM_BOX = 106; //来源：盒子和盒子小号
var TJWAY_PLATFROM = 1;
var TJWAY_AUTOLOGIN = 2;

//公用的命名空间，所有该项目定义的类都放在该基类下，以防止命名污染
var Box = {
    a: '<a data-state="{state}" {gameName} {date} href="{url}" title="{name}" class="btn-s {classState}">{name}</a>',
    //serverListUrl: "http://gameapp." + hosts + "/controller/game_servers.php",  // 服务器列表接口链接
    serverListUrl: "http://ptres.37.com/content/cache/game_server/{gameid}.js",
    gameUrl: "http://gameapp." + hosts + "/controller/enter_game.php?game_id={gameid}&sid={sid}&wd_entergame=1&wd_NAME={gamename}&wd_GAME_KEY={gamekey}&wd_SID={sid}&wd_GAME_ID={gameid}&wd_username={login_account}&wd_SNAME={server_name}&error_url={error_url}",  // 进入游戏链接
    h5GameUrl: "http://game." + hosts + "/play_h5.php?game_id={gameid}&wd_NAME={gamename}&wd_GAME_KEY={gamekey}&wd_SID=1&wd_GAME_ID={gameid}&wd_username={login_account}&wd_SNAME={server_name}&wd_IsH5Game=1&wd_entergame=1&referer={refer}&uid={uid}&error_url={error_url}",
    serverUrl: "http://landers." + hosts + "/gb/server.php?g={gameid}&wd_NAME={gamename}&wd_GAME_KEY={gamekey}&wd_SID=0&wd_GAME_ID={gameid}",
    gameTypes:{"RPG":"角色扮演","SLG":"战争策略","SIM":"模拟经营","SPT":"休闲竞技","3D":"3D"},
    gameTheme:{"SANGUO":"三国",
        "XIYOU":"西游",
        "SHUIHU":"水浒",
        "XIANXIA":"仙侠",
        "WUXIA":"武侠",
        "MOHUAN":"魔幻",
        "DONGMAN":"动漫",
        "LISHI":"历史",
        "TIYU":"体育",
        "JUNSHI":"军事",
        "HANGHAI":"航海",
        "QITA":"其它"},
    gameFightingMode:{"ROUND":"回合","IMMEDIATE":"即时","OTH":"其它"},
    urlSearch:"http://landers." + hosts +"/index.php?c=hz-main&a=search",
    noLogin:1,
    HOSTS: hosts,

    /**
     * 让所有图片使用默认图片，当页面加载时才去加载图片
     * @function defaultImgSet
     * @memberof main
     */
    defaultImgSet: function($container) {
        if(!$container){
            $container = $( ".img_loaded" );
        }else{
            $container = $container.find("img[data-src]");
        }
        $container.each( function( i, e ) {
            var imgUrl = $( e ).attr( "data-src" );
            var img = new Image();
            img.onload = function(){
                $( e ).attr( "src", imgUrl );
            };
            img.src = imgUrl;
        });
        $( ".css_loaded" ).each( function( i, e ) {
            var imgUrl = $( e ).attr( "data-src" );
            var img = new Image();
            img.onload = function(){
                $( e ).html( '<div class="b-list-bg" style="background-image:url('+imgUrl+')">' + $( e ).html() + "</div>" );
            };
            img.src = imgUrl;
        });
    },
    init:function(){
        this.noLogin = SQ.getParam("nologin");
        Played.dom.page.data( "page", 1 );
        this.Page = new Page();
        this.Game = new Game();
    },
    getRdm:function(max){
        return Math.ceil(Math.random()*max);
    }
};


/**
* 用户信息登录状态相关处理
* @namespace main.login
*/
var User = {
    _url: "http://my.37.com/api/login.php?action=userinfo",
    historyGame:null,
    info:null,

    _getData:function(data,success,fail){
        var _this = this;
        $.ajax({
            data: $.extend( {
                tj_from: TJFROM_BOX,
                tj_way: TJWAY_AUTOLOGIN
            }, data || {} ),
            dataType: "jsonp",
            url: _this._url
        }).done(function( r ) {
            if(r.code === 0){
                Box.noLogin = 0;
                _this.info = r.data;
                if($.isFunction(success)){
                    success(r.data);
                }
            }else if(r.code === -1){
                _this.failLogin(location.href);
                if($.isFunction(fail)){
                    fail();
                }
            }
        }).fail(function( xhr, status, error ) {
            Box.noLogin = 1;
            if($.isFunction(fail)){
                fail();
            }else{
                _this.failLogin(location.href);
            }
        });
    },
    checkLogin:function(success,fail){
        this._getData(null,success,fail);
    },

    /**
     * 获取用户信息
     * @param  {[type]} data     [description]
     * @param  {[type]} success  [description]
     * @param  {[type]} errorUrl [description]
     * @return {[type]}          [description]
     */
    getInfo:function(){
        return this.info;
    },

    getGameHistory:function(gameid,success,fail){
        this._getData({
            "gameid": gameid,
            tj_from: TJFROM_BOX,
            tj_way: TJWAY_AUTOLOGIN
        },success,fail);
    },

	/**
	 * 设置和获取用户的积分
	 * @function getScore
	 * @memberof Box.login
	 */
	getScore: function() {
	    if( !this.info.POINT ) {
	        this.info.POINT = 0;
	    }
	    if ( !this.info.VIP_DEEP ) {
	        this.info.VIP_DEEP = 0;
	    }
	    Box.userPoint = this.info.POINT;
	    Box.vipDeep = this.info.VIP_DEEP;
	    client.DoSuperCall( 112, {
	        score: Box.userPoint,
	        vip: Box.vipDeep
	    });
	},
    loginSuccess:function(){
        $("#played-module").show();
        $("#nologin").hide();
    },
	/**
	 * 用户无登录状态时继续加载程序
	 * @function noLogin
	 * @memberof box.login
	 */
	noLogin: function() {
	    client.DoSuperCall( 105, {
            relogin: 1,
            url: ""
        });
        setTimeout(function(){
            location.reload();
        },600);
	},
    /**
     * 获取登录信息失败时的处理
     * @param  {[type]} url [description]
     * @return {[type]}     [description]
     */
	failLogin: function( url ) {
        if(!url){
            url = location.href;
        }
	    /*if ( Box.noLogin == 1 ) {
	        this.noLogin();
	        return;
	    }*/
        if(SQ.getParam("nologin") === "1"){
            this.showNologin();
        }
	    client.DoSuperCall( 117, {
	        account: 0
	    });
	},
    showNologin:function(){
        var $nologin = $("#nologin").show();
        if ( $nologin && $nologin.length == 0 ) {
            return;
        }
        $nologin.on("click","a.login",function(){
            client.DoSuperCall( 105, {
                relogin: 0,
                url: ""
            });
        }).on("click","a.reg",function(){
            client.DoSuperCall( 105, {
                relogin: 1,
                url: ""
            });
        });
        $("#played-module").hide();
        Box.Page.loadImgs($nologin);
    },
    reLogin:function(obj){
        var _this = this,
            options = {
            remember_me: 0,
            save_state: 1,
            ltype: 2,
            ajax: 0,
            tj_from: TJFROM_BOX,
            tj_way: TJWAY_AUTOLOGIN
        };
        $.extend(true, options, obj);
        if ( options.account && options.password ) {
            options.login_account = obj.account;
            SQ.Login.checkUsername(options.login_account);
            SQ.Login.toLog( $.extend({
                success: function() {
                    //如果是登录页，则返回
                    if(location.search.indexOf('&a=login&') > 0){
                        return;
                    }
                    location.reload();
                    return;
                },
                fail: function( res ) {
                    _this.loginFail();
                }
            }, options ) );
        } else {
            _this.loginFail();
        }
    },
    /**
     * 登录失败的处理
     */
    loginFail:function(){
        if(Box.noLogin == 1){
            return;
        }
        location.href = "/hz/error.html?backUrl=" + encodeURIComponent(location.href);
    },
	toError: function( data ) {
	    var account = data.account || "",
	        password = data.password.replace( /“/g, '"' ).replace( /、/g, '\\' ) || "",
	        gameid = data.gameid || 0;

	    location.href = "error.html?a=" + account + "&p=" + password + "&g=" + gameid + "&backUrl=" + encodeURIComponent( location.href );
	},

    regUrl: "http://regapi." + hosts + "/api/p_register_client.php?login_account={login_account}&password={password}&password1={password1}&referer={refer}&referer_param={uid}&installtime={installtime}&ab_param={version}&game_id={game_id}&game_server_id={server_id}&name={name}&id_card_number={id_card_number}&ltype=4&tj_from={tj_from}&tj_way={tj_way}",
    /**
     * 广告接口注册，已增加支持身份验证
     * @param options {json} 注册的信息
     * @function toRegPostAd
     * @memberof game.register
     */
    toRegPostAd: function( options ) {
        //判断是否走https
        if(window.bHTTPSEnabled === true){
            this.regUrl = this.regUrl.replace("http:","https:");
        }
        if ( SQ.Login.cryps ) {
            options = SQ.Login.cryps( options );
        }
        var url = this.regUrl.replace( "{login_account}", encodeURIComponent( options.login_account || "" ) )
                .replace( "{password}", encodeURIComponent( options.password || "" ) )
                .replace( "{password1}", encodeURIComponent( options.password1 || "" ) )
                .replace( "{refer}", options.refer || "" )
                .replace( "{uid}", options.uid || "" )
                .replace( "{installtime}", options.installtime || "" )
                .replace( "{version}", options.version || "" )
                .replace( "{game_id}", options.game_id || "" )
                .replace( "{name}", options.name || "" )
                .replace( "{id_card_number}", options.id_card_number || "" )
                .replace( "{server_id}", options.server_id || "")
                .replace( "{tj_from}", options.tj_from || TJFROM_BOX )
                .replace( "{tj_way}", options.tj_way || TJWAY_PLATFROM),
            that = this,
            s = null,
            f = null;

        s = options.success || function() {
                location.href = "http://landers.37.com/index.php?c=hz-main&a=index&gameid=" + game.data.game_id + "&refer=" + game.data.refer + "&uid=" + game.data.uid + "&wd_username=" + options.login_account;
            };
        f = options.fail || function( res ) {
                if ( res && res.message ) {
                    if(typeof(that) === "object" && "showError" in that){
                        that.showError(res.message);
                    }else{
                        alert(res.message);
                    }
                }
            };

        delete options.success;
        delete options.fail;

        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'jsonp'
        })
            .done(function( res ) {
                if ( res.success === "0" ) {
                    client.DoSuperCall( 101, {
                        logintype: "0",
                        account: options.login_account,
                        password: options.password.replace( '"', "“" ),
                        accountstate: 0,
                        source: options.source
                    });
                    s.call( that, res, options );
                } else {
                    f.call( that, res, options );
                }
            })
            .fail(function( res ) {
                f.call( that, res, options );
            });
    }
};

/**
 * 左上角上次玩过游戏的处理
 * @namespace main.played
 */
var Played = {
    gamedata:[],
    dom: {
        div: $( "#played" ),
        num: $( "#played-page-num" ),
        page: $( "#played-page" ),
        module: $( "#played-module" ),
        topTxt: $( "#played-top-txt" ),
        tplHtml: $( "#played-tpl" ).html(),
        findHtml: $( "#played-find" ).html()
    },
    init: function() {
        var $el = this.dom.module;

        if ( !$el || !$el.length ) return;
        this.pageSize = 6;
        $.extend(true, this.gamedata, game_data);
        // console.log(game_data);

        client.DoSuperCall( 114, {
            doccomplete: ""
        });
        //this.getUserGame();
        this.events();
    },
    events: function() {
        var that = this;
        that.dom.module
            .on( "click.page", "#ico-prev, #ico-next", function() {
                that.page($( this ).attr( "id" ).substr( 4 ));
            })
            .on( "click.ico", "#ico-xiaohao, #ico-delete", function() {
                var $playedGames = that.dom.module.find(".m-played-games"),
                    $this = $(this);
                if($playedGames.hasClass('m-delete')){
                    $playedGames.removeClass('m-delete');
                    $this.removeClass('btn-del-hover').addClass('btn-del');
                }else{
                    $playedGames.addClass('m-delete');
                    $this.removeClass('btn-del').addClass('btn-del-hover');

                }
            });
        that.dom.div.on("click",".game-pic",function(event){
            event.preventDefault();
            window.open($(this).parent().attr("href"));
        }).on( "click.del", ".icon-del", function(event) {
            event.preventDefault();
            that.deleteGame( this );
        }).on( "click.open", ".game-search", function() {
            client.DoSuperCall( 113, {
                url: Box.urlSearch,
                type: 2
            });
        });
    },
    /**
     * 端将用户的玩过游戏数据传递过来的处理
     * @param param {json} 游戏数据
     */
    handler: function (param) {
        var i = 0,
            i_r = 0,
            i_l = 0,
            html_r = [],
            html_l = [],
            count,
            page = 0,
            p_null = 0,
            playedList = "li";
        if ( param == 1 ) {
            param = [];
            i_r++;
        }
        count = param.length;
        if ( count == 0 ) {
            p_null = 1;
        }
        this.data = param;
        this.dom.div.empty();
        for ( ; i < count; i++ ) {
            // alert(param[ i ].GAME_ID);
            param[ i ].LID = i + 1;
            var CATEGORY, _gamedata;
            _gamedata = this.getGameById( param[ i ].GAME_ID );
            if ($.isEmptyObject(_gamedata)) {
                continue;
            }
            CATEGORY = _gamedata.CATEGORY;

            /*if ( param[i].CATEGORY ) {
                CATEGORY = param[i].CATEGORY;
            } else {
                _gamedata = this.getGameById( param[ i ].GAME_ID );
                CATEGORY = _gamedata.CATEGORY;
            }*/
            if( +CATEGORY === 2 ){ //CATEGORY=1为页游，CATEGORY=2为H5，CATEGORY=3为手游
                param[ i ].URL = Box.h5GameUrl
                    .replace( /{gameid\}/g, param[ i ].GAME_ID )
                    .replace( /{sid\}/g, param[ i ].SID )
                    .replace( "{gamename}", encodeURIComponent( param[ i ].NAME ))
                    .replace( "{gamekey}", param[ i ].GAME_KEY )
                    .replace( "{login_account}", Box.User.info.LOGIN_ACCOUNT )
                    .replace( "{server_name}", encodeURIComponent( "H5游戏" ))
                    .replace( "{refer}", "ha_pt_37yyhz" )
                    .replace( "{uid}", "last" )
                    .replace( "{error_url}", "" );
                param[ i ].shortName = "H5游戏";
                param[ i ].SERVER_NAME = "H5游戏";
            } else {
                param[ i ].URL = Box.gameUrl
                    .replace( /{gameid\}/g, param[ i ].GAME_ID )
                    .replace( /{sid\}/g, param[ i ].SID )
                    .replace( "{gamename}", encodeURIComponent( param[ i ].NAME ))
                    .replace( "{gamekey}", param[ i ].GAME_KEY )
                    .replace( "{login_account}", Box.User.info.LOGIN_ACCOUNT )
                    .replace( "{server_name}", encodeURIComponent( param[ i ].SERVER_NAME ))
                    .replace( "{error_url}", "" );
                param[ i ].shortName = this.shortName( param[ i ].SERVER_NAME, param[ i ].GAME_ID, param[ i ].SID );
            }

            if(param[i].NAME.length > 7){
                param[i].title = param[i].NAME;
            }else{
                param[i].title = "";
            }

            if ( !param[ i ].HOTSORT || param[ i ].HOTSORT === "0" ){
                html_l.push(SQ.T( this.dom.tplHtml, param[ i ] ));
                i_l++;
            } else {
                html_r.push(SQ.T( this.dom.tplHtml, param[ i ] ));
                i_r++;
            }
        }
        if ( html_l.length > 0 ) {
            html_l.push(this.dom.findHtml);
            this.dom.div.append( html_l.join('') );
            this.dom.topTxt.html( "最新玩过的游戏" );

            for ( var l = 0; l < this.pageSize && l < i_l; l++ ) {
                this.dom.div.find( playedList ).eq( l ).show();
            }
            if ( l < this.pageSize ) {
                this.dom.div.find( playedList ).eq( l ).show();
            }

            page = Math.floor( (i_l + 1) / this.pageSize) + (((i_l + 1) % this.pageSize > 0 ) ? 1 : 0);//算出页数
        } else {
            html_r.push(this.dom.findHtml);
            this.dom.div.append( html_r.join('') );
            if ( p_null == 1 ) {
                this.dom.topTxt.html( "最新玩过的游戏" );
            } else {
                this.dom.topTxt.html( "热门游戏推荐" );
            }

            for ( var r = 0; r < this.pageSize && r < i_r; r++ ) {
                this.dom.div.find( playedList ).eq( r ).show();
            }
            if ( r < this.pageSize ) {
                this.dom.div.find( playedList ).eq( r ).show();
            }

            page = Math.floor( (i_r + 1) / this.pageSize) + (((i_r + 1) % this.pageSize > 0 ) ? 1 : 0);//算出页数
        }
        this.setTooltips();

        Box.defaultImgSet(this.dom.div);
        this.dom.div.children("a").each(function(index, val) {
            if(index>5){
                $(this).addClass("hide").removeClass("inline-block");
            }
        });
        this.dom.num.html( '<span class="num">1</span>/' + page );
        this.dom.page.data("page", 1);
        this.allPage = page;
    },
    getGameById: function (id) {
        var game = {};
        for(var i=0,len=this.gamedata.length;i<len;i++){
            if(this.gamedata[i].ID == id){
                game = this.gamedata[i];
                break;
            }
        }
        return game;
    },
    setTooltips:function(){
        $("#sq-tips").hide();
        this.dom.div.find('a[data-sq="Tips"]').each(function() {
            var self = $( this ),
                sqTitle = self.data("title");
            if(!sqTitle){
                return true;
            }
            new SQ.ToolTip({
                el: self,
                title: sqTitle,
                tipId: "sq-tips"
            });
        });
        SQ.ToolTip.bind( 'show', function( e ) {
            var ofs = e.el.offset();
            e.tip.css({
                top: ofs.top + 76,
                left: ofs.left + 48,
                zIndex: 20
            });
        });
    },
    /**
     * 游戏服名进行短名处理
     * @param serverName {string} 服名
     * @param gameId {int} 游戏id
     * @param sid {int} 服的顺序id
     * @returns {*}
     */
    shortName: function( serverName, gameId, sid ){
        var str = /\d+\服/g.exec(serverName);
        str = !str ? "" : str[0];
        if(parseInt(str,10) > 0){
            return str;
        }
        str = /\d+\区/g.exec(serverName)
        str = !str ? "" : str[0];
        if(parseInt(str,10) > 0){
            return str;
        }
        return "";
        /*var out = typeof(serverName) === "string" ? serverName.replace(/[^0-9]/ig, "") : "";
        sid = !sid ? 0 : sid;
        if( gameId == 233 || gameId == 247 ) {
            return out;
        }
        serverName = "-" + serverName;
        if( serverName.indexOf( '内测' ) > 0 ){
            return '内测';
        }
        else if( serverName.indexOf( '体验' ) > 0 ){
            return '体验' + out;
        }if( serverName.indexOf( '首服' ) > 0 ){
            return '1';
        }else if( serverName.indexOf( '测试' ) > 0
            || serverName.indexOf( '封测' ) > 0
            || serverName.indexOf( '删测' ) > 0
            || serverName.indexOf( '删档' ) > 0
            || ( serverName.indexOf( '测' ) > 0 && !out )
            )
        {
            return '测试';
        }

        if( out ){
            return out > 67110 ? out.replace("6711","") : out;
        }

        return sid;*/
    },
    /**
     * 翻页处理
     * @param type {string} 翻页的类型，“prev”：上一页；“next”：下一页
     */
    page: function( type ) {
        var nowPage = parseInt(this.dom.page.data( "page" ));
        if ( type == "prev" ) {
            nowPage = nowPage-1 < 1 ? this.allPage : nowPage -1;
        } else if ( type == "next" ) {
            nowPage = nowPage+1 > this.allPage ? 1 : nowPage+1;
        }
        this.toPage(nowPage);
    },

    /**
     * 去第几页
     * @param nowPage
     */
    toPage:function(nowPage){
        this.dom.list = this.dom.div.children("a");
        this.dom.list.removeClass("inline-block").addClass("hide");
        for (var i = 0; i < this.dom.list.length; i++ ) {
            if ( (nowPage - 1) * this.pageSize <= i && i < nowPage * this.pageSize ) {
                this.dom.list.eq( i).removeClass("hide").addClass("inline-block");
            }
        }
        this.hackSearchBtn();
        this.dom.page.data( "page", nowPage );
        this.dom.num.html( "<span>" + nowPage + "</span>/" + this.allPage );
    },
    /**
     * 删除游戏
     * @param dom {object} dom对象
     */
    deleteGame: function( dom ) {
        var $a = $( dom ).parent(),
            index = $a.index();//$a.data( "lid" ) - 1;

        client.DoSuperCall( 111, {
            keynum: index
        });

        this.data.splice(index,1);
        $a.remove();
        //this.handler( this.data );
        this.toPage(this.dom.page.data( "page" ));
        this.hackSearchBtn();
        //this.dom.div.find( "a.icon-del" ).show();
    },
    hackSearchBtn:function(){
        var $search = this.dom.div.find(".game-search");
        if($search.hasClass("inline-block") && this.dom.div.find("a.inline-block").length === 1){
            $search.css({"top":0});
        }
    },
    /**
     * 通过用户接口获取用户的上次进入游戏的信息
     */
    getUserGame: function() {
        var _this = this,
            h = Box.User.info.hasOwnProperty("HISTORY_GAME_SERVER") ? Box.User.info[ "HISTORY_GAME_SERVER" ] : null,
            back = [];

        if ( $.isArray(h) && h.length > 0 ) {
            for (var i = 0; i < h.length; i++ ) {
                //当盒子不支持H5游戏时跳过
                if ( !Box.Client.ish5 && h.CATEGORY && +h.CATEGORY !== 1 ) {
                    //continue;
                }
                if( +h[i].CATEGORY && +h[i].CATEGORY === 3 ){ //CATEGORY=1为页游，CATEGORY=2为H5，CATEGORY=3为手游
                    continue;
                }else{
                    back.push( {
                        CATEGORY: h[i].CATEGORY + "",
                        NAME: h[i].GAME_NAME,
                        GAME_KEY: h[i].GAME_KEY,
                        SID: h[i].SID,
                        GAME_ID: h[i].GAME_ID,
                        SERVER_NAME: h[i].SERVER_NAME,
                        HOTSORT: h[i].HOTSORT
                    } );
                }
            }

            client.DoSuperCall( 110, {
                gamedata: back
            });
            _this.handler( back );
        } else {
            _this.getRecomGame();
        }
    },
    /**
     * 生成推荐游戏信息
     */
    getRecomGame: function() {
        var d, back = [];
        for ( var i = 0; i < 3; i++ ) {
            var h = game_data[ i ];
            //当盒子不支持H5游戏时跳过
            if ( !Box.Client.ish5 && h.CATEGORY && +h.CATEGORY !== 1 ) {
                //continue;
            }
            d = {
                CATEGORY: h.CATEGORY + "",
                NAME: h.NAME,
                GAME_KEY: h.GAME_KEY,
                SID: 0,
                GAME_ID: h.ID
            };
            back.push( d );
        }
        client.DoSuperCall( 110, {
            gamedata: back
        });
        this.handler( back );
    }
};

var Servers = SQ.Class();
Servers.include({
    init:function(){
        this.$tabServer = $("#tabServer");
        this.createTab();
        this.events();
        this.initLink();
    },
    createTab:function(){
        var _this = this,
            tab = new SQ.Tab({
                el: "#tabServer",
                tabs: "div.m-tab-tit a",
                panels: "div.panel",
                eventType: "mouseenter",
                index: 0,
                auto: false,
                interval: 5000,
                currentClass: "hover"
            });
        tab.bind("change",function(){
            var idx = this.currentIndex;
            $.each(this.tabs, function(index, val) {
                var hasHover = idx == index ? true : false,
                    $elem = $(val).removeClass("hover");
                _this.setHoverCls($elem,hasHover);
            });
            Box.Page.loadImgs(this.panels.eq(idx));
        });
        Box.Page.loadImgs(this.$tabServer.children(".panel:first").children(".server-page:first"));
    },
    setHoverCls:function($elem,hasHover){
        var cls = $elem.prop("class").replace("-hover","");
        cls = hasHover ? cls+"-hover" : cls;
        $elem.removeClass().addClass(cls);
    },
    events:function(){
        var _this = this,$pager;
        this.$tabServer.on('mouseenter', '.server-page>li', function(event) {
            event.preventDefault();
            $(this).delay(400).addClass("hover").siblings("li.hover").removeClass("hover");
        }).on('click', '.page-l,.page-r', function(event) {
            event.preventDefault();
            _this.changePage(this);
        }).on('click', 'a.btn-alert', function(event) {
            event.preventDefault();
            var $this = $(this),
                gameData = $this.parent().data("game"),
                arr = gameData.split('|'),
                json = {starttime:arr[0],gameid:arr[1],serverid:arr[2],servername:arr[3],gamename:arr[4],gamekey:arr[5]};
            client.DoSuperCall(124,json);
        })
    },
    initLink:function(){
        this.$tabServer.find("a.btn3,a.name,a.num").each(function(index, val) {
            var $this = $(val),
                url = $this.prop("href");
            url = url.replace( "{login_account}", $.isEmptyObject(Box.User.info) ? "" : Box.User.info.LOGIN_ACCOUNT );
            $this.prop("href", url);
        });
    },
    changePage:function(el){
        var $this = $(el),
            isAdd = $this.prop("class").indexOf("-r")>0,
            $pager = $this.parent(),
            pageIndex = $pager.data("pageindex"),
            pageCount = $pager.data("pagecount"),
            $pagePrev = $pager.children("a:first"),
            $pageNext = $pager.children("a:last"),
            newPageIndex = 0;

        if(isAdd){
            newPageIndex = pageIndex+1 > pageCount-1 ? 0 : pageIndex+1;
        }else{
            newPageIndex = pageIndex-1 < 0 ? pageCount-1 : pageIndex-1;
        }
        var $ul = $pager.siblings("ul.server-page").addClass("hide")
            .eq(newPageIndex).removeClass("hide");
        $pager.data("pageindex",newPageIndex)
            .children("p").html('<span class="num">'+(newPageIndex+1)+'</span>/'+pageCount);
        Box.Page.loadImgs($ul);
    }
});

/**
 * 封装关于游戏的一些操作，比如获取game_data
 * @type {[type]}
 */
var Game = SQ.Class();
Game.include({
    data:[],
    init:function(){
        // 判断是否存在实例
        if (typeof Game.instance === 'object') {
            return Game.instance;
        }
        // 缓存实例
        Game.instance = this;
        $.extend(true, this.data, game_data);
    },
    getGameById: function (id) {
        var game = {};
        for (var i = 0, len = this.data.length; i < len; i++){
            if(this.data[i].ID == id){
                game = this.data[i];
                break;
            }
        }
        return game;
    },
    getGameByKey:function(key){
        var game = {};
        for(var i=0,len=this.data.length;i<len;i++){
            if(this.data[i].GAME_KEY == key){
                game = this.data[i];
                break;
            }
        }
        return game;
    }
});

/**
 * 封装页面公共操作
 * @type {[type]}
 */
var Page = SQ.Class();
Page.include({
    $gMain:null,
    nice:null,
    init:function(){
        this.$gMain = $("#gMain");
        this.resetSize();
        this.events();
        this.resetScroll();

        if(window.attachEvent){
            window.focus();
        }
    },
    events:function(){
        var _this = this;
        $win.resize(function() {
            _this.resetSize();
        }).on("blur,mouseout",function(){
            $("#sq-tips").hide();
        });
    },
    /**
     * 页面高度重置
     * @param h {int} 页面的高度
     */
    resetSize: function() {
        var _this = this;
        if(_this.timer){
            clearTimeout(_this.timer);
        }
        _this.timer = setTimeout(function(){
            var h = $win.height(),
                w = $win.width(),
                $body = $(document.body),
                $topIcon = $("#topIcon"),
                $first = $("#adLeft>a:first"),
                $last = $("#adLeft>a:last"),
                $adRight = $(".g-ad-right");
            h = h < 625 ? 625 : h;
            w = w < 1440 ? 1440 : w;
            $body.children(".g-ad-right").css("height",h);
            $body.css({"width":w,"height":h}).children(".wrapper").css({"width":w,"height":h});
            $topIcon.css("margin-right",$win.width()-1412);
            _this.resetScroll();

            if(w > 1440){
                $adRight.show();
                _this.loadImgs($adRight);
            }else{
                $adRight.hide();
                $body.css({"width":w,"height":h});
            }
            if(h > 755){
                $first.show();
                _this.loadImgs($first);
            }else{
                $first.hide();
            }
            if(h > 895){
                $last.show();
                _this.loadImgs($last);
            }else{
                $last.hide();
            }
        },30);
    },
    resetScroll:function(){
        if(!this.nice){
            this.$gMain.niceScroll({cursorcolor:"#cbd0d5",autohidemode: false,horizrailenabled:false,cursorwidth:"8px",cursorborderradius: "6px",zIndex:900});
            this.nice = this.$gMain.getNiceScroll();
        }else{
            this.nice.resize();
        }
    },
    getStatUrl:function(url,code){
        var sign = url.indexOf('?')>-1 ? '&' : '?';
        return url + sign + 'wd_actionid=' + code;
    },
    loadImgs:function($el){
        if(!$el){
            $el = $doc;
        }
        $el.find("img[data-src]").each(function() {
            var $this = $(this);
            $this.prop("src",$this.data("src")).removeClass("loading");
        });
    }
});

/**
 * 搜索游戏
 * @namespace main.search
 */
var Search = SQ.Class();
Search.include({
    data:[],
    matchData:[],
    filterKeys:{"GAME_CATE":"","GAME_TYPE":"","GAME_THEME":"","FIGHTING_MODE":"","GAME_PINYIN":""},
    dom:{},
    defaultText:"搜索游戏名",
    pageSize: 18,
    pageIndex:0,
    mode:"default",
    init: function() {
        this.act = SQ.getParam("a");
        this.data = Box.Game.data;
        this.ish5 = Box.Client.ish5;//当前盒子版本是否支持h5
        this.dom.$inputKey = $("#iptSearch");
        this.dom.$searchDiv = $( "#gameSearch" );
        this.getMarks();
        this.eventsInput();
        if(this.act === "search_v6"){
            this.dom.$filerBar = $("#filerBar");
            this.dom.$result = $("#searchResult");
            this.searchByHash();
            this.eventsSearch();
        }
    },

    /**
     * 通用事件
     */
    eventsInput:function(){
        var _this = this;
        this.dom.$searchDiv.on( "click", "a.btn", function( e ) {   //点击搜索
            e.preventDefault();
            _this.onSearch();
        })
        .on("focusin.searchInput", "#iptSearch", function( e ){
            _this.setAutocomplete();
        })
        .on( "keyup.searchInput", "#iptSearch", function( e ) {
            var $this = $( this ), key = $this.val();
            if( e.keyCode == 13 ) {
                _this.onSearch();
                return;
            }
            _this.setAutocomplete();
        })
        .on( "focusout.searchInput", "#iptSearch", function() {
            var $this = $(this);
            if ( $this.val() == "" ) {
                //$( this ).val( _this.defaultText );
                $this.attr("placeholder",_this.defaultText).placeholder();
                if(_this.act === "search_v6"){
                    _this.showDefault();
                    _this.resetFilterBtn();
                }
            }
            clearTimeout( _this.comp );

            _this.$autocomplete && _this.$autocomplete.data("lastkey","");
        })
        .on('click', 'a.option', function(event) {
            event.preventDefault();
            _this.dom.$inputKey.val($(this).html());
            _this.hideAutocomplete();
            _this.onSearch();
        });
        $doc.on( "click", function( e ) {
            if ( e.target.id !== "m-autocomplete") {
                _this.hideAutocomplete();
            }
        });
    },

    /**
     * 搜索页事件
     */
    eventsSearch:function(){
        var _this = this;
        this.dom.$filerBar.on('click', 'a', function(event) {
            event.preventDefault();
            _this.filter(this);
        });

        Box.Page.$gMain.getNiceScroll(0).scrollstart(function(){
            //显示向上图标
            _this.showTopIcon();
        }).scrollend(function(){
            //滚动到上部则退出
            var scroll = Box.Page.$gMain.getNiceScroll(0).scroll;
            if(scroll.y < 50){
                _this.hideTopIcon();
            }else{
                _this.showTopIcon();
                //加载20个游戏
                _this.loadMore();
            }
        });
    },

    /**
     * 显示向上图标
     * @return {[type]} [description]
     */
    showTopIcon:function(){
        var _this = this;
        if ($.browser.msie && ($.browser.version == "6.0") && !$.support.style) {
            return false;
        }
        this.$topIcon = $("#topIcon");
        if(this.$topIcon.length === 0){
            Box.Page.$gMain.append('<a href="javascript:;" id="topIcon" class="icon-top hide"></a>');
            this.$topIcon = $("#topIcon").fadeIn("fast",function(){

            }).on('click', function(event) {
                event.preventDefault();
                Box.Page.$gMain.getNiceScroll(0).doScrollTop(0,'up');
                _this.hideTopIcon();
            });
            new SQ.Fixed({
                element: _this.$topIcon,
                location: "rightBottom"
            });
            this.$topIcon.css({"margin-right":$win.width()-1412,"margin-bottom":3});
        }else{
            this.$topIcon.fadeIn('fast', function() {

            });
        }
    },
    hideTopIcon:function(){
        this.$topIcon.fadeOut('fast', function() {

        });
    },
    setAutocomplete:function(){
        var _this = this;
        if(_this.comp){
            clearTimeout( _this.comp );
        }
        _this.comp = setTimeout( function() {
            _this.showAutocomplete();
        }, 500 );
    },
    hideAutocomplete:function(){
        if(this.$autocomplete){
            this.$autocomplete.hide();
        }
    },
    onSearch:function(){
        if(this.act === "search_v6"){
            this.search();
            client.DoSuperCall( 125, {
                actionid:184
            });
        }else{
            var key = $.trim(this.dom.$inputKey.val());
            if(!key || key === this.defaultText){
                key = "";
            }
            client.DoSuperCall( 113, {
                url: Box.urlSearch+"&nologin=" + Box.noLogin + "&key=" + encodeURIComponent( key ),
                type: 2,
                actionid:166
            });
        }
    },
    /**
     * 搜索输入框的提示处理
     * @param k {string} 输入框的内容
     * @returns {string} 处理后的html内容
     */
    showAutocomplete: function(  ) {
        var r = [],
            k = this.dom.$inputKey.val(),
            data = this.getDataByKey(k);
        if( !k || k === this.defaultText ){
            return;
        }
        this.$autocomplete = $("#m-autocomplete");
        if(this.$autocomplete.data("lastkey") === k){
            return;
        }
        this.$autocomplete.data("lastkey",k);
        if(this.$autocomplete.length === 0){
            this.dom.$searchDiv.append('<div class="m-autocomplete hide" id="m-autocomplete"></div>');
            this.$autocomplete = $("#m-autocomplete");
        }
        for(var i=0,len=data.length;i<len;i++){
            r.push('<a href="javascript:;" class="option">',data[i].NAME,'</a>');
        }
        if ( r.length ) {
            this.$autocomplete.show().html( r.join("") );
        } else {
            this.$autocomplete.hide();
        }
    },
    search:function(){
        var key = $.trim(this.dom.$inputKey.val());
        if(!key || key === this.defaultText){
            this.showDefault();
            this.resetFilterBtn();
            return;
        }
        this.searchByKey(key);
    },

    /**
     * 设置搜索框文字
     * @param {[type]} key [description]
     */
    setSearchKey:function(key){
        if(key){
            this.dom.$inputKey.val(key);
        }else{
            this.dom.$inputKey.placeholder();
        }
    },

    /**
     * 通过地址栏传参查询
     */
    searchByHash:function(){
        var hashKey = decodeURIComponent(location.hash.substring( 1 )) || decodeURIComponent(SQ.getParam("key"));
        if(!hashKey){
            this.showDefault();
            this.setSearchKey();
        }else{
            this.searchByKey(hashKey);
        }
    },

    /**
     * 通过关键词搜索
     * @param  {[type]} key [description]
     * @return {[type]}     [description]
     */
    searchByKey:function(key){
        var _this = this;
        if(!key){
            return;
        }
        this.mode = "search";
        _this.resetFilterBtn();
        _this.setSearchKey(key);
        _this.matchData = _this.getDataByKey(key);
        if(this.matchData.length === 0){
            _this.renderEmpty();
        }else{
            _this.render();
        }
    },
    /**
     * 根据关键词查找数据
     * @return {[type]} [description]
     */
    getDataByKey:function(key){
        var _this = this;
        _this.matchData = [];
        key = key.toUpperCase();
        $.each(_this.data, function(index, val) {
            //当盒子不支持H5游戏时跳过
            if ( !_this.ish5 && val.CATEGORY && +val.CATEGORY !== 1 ) {
                //return true;
            }
            if( val.NAME.toUpperCase().indexOf(key) > -1 ) {
                _this.matchData.push( val );
            }
        });
        return _this.matchData;
    },
    /**
     * 过滤游戏
     * @return {[type]} [description]
     */
    filter:function(el){
        var $el = $(el),key = $el.data("key");
        this.mode = "filter";
        if ( $el.hasClass("focus") ) return;//如果这个选项已经被选中了，不允许点击
        $el.parent().children().removeClass( "focus" );
        $el.addClass( "focus" );
        var type = $el.parent().data( "type" );
        if(!type || type === "0"){
            this.filterKeys[type] = undefined;
            delete this.filterKeys[type];
        }else{
            this.filterKeys[type] = key;
        }
        if(this.isEmptyFilter()){
            this.showDefault();
            return;
        }
        this.setMatchData();    //匹配筛选数据
        if(this.matchData.length === 0){
            this.renderEmpty();
        }else{
            this.render();
        }
    },
    /**
     * 判断过滤条件是否为空
     * @return {Boolean} [description]
     */
    isEmptyFilter:function(){
        if($.isEmptyObject(this.filterKeys)){
            return true;
        }
        for(var p in this.filterKeys){
            if(this.filterKeys[p]){
                return false;
                break;
            }
        }
        return true;
    },

    /**
     * 重置过滤条件
     * @return {[type]} [description]
     */
    resetFilterBtn:function(){
        this.filterKeys={"GAME_CATE":"","GAME_TYPE":"","GAME_THEME":"","FIGHTING_MODE":"","GAME_PINYIN":""};
        this.dom.$filerBar.find(".block-body").each(function(i){
            var $this = $(this);
            $this.children("a.focus").removeClass("focus").end().children("a:first").addClass("focus");
        });

        /*if(/msie/.test(navigator.userAgent.toLowerCase())){
            this.dom.$inputKey.val("搜索游戏名");
        }*/
    },

    /**
     * 获取new，hot标记
     * @return {[type]} [description]
     */
    getMarks:function(){
        var _this = this,
            markData = typeof(sq_content_s_www_gb_index_games) === "undefined" ? {} : sq_content_s_www_gb_index_games,
            ids = [],
            marks = [],
            markArr = {};
        if($.isEmptyObject(markData)){
            return;
        }
        ids = markData.game_ids || [];
        marks = markData.game_hot_new || [];
        for(var i=0,len=ids.length;i<len;i++){
            markArr[ids[i]] = marks[i];
        }
        if($.isEmptyObject(markArr)){
            return;
        }
        // console.log(markArr);
        $.each(_this.data, function (index, obj) {
            var mark = markArr[obj.ID];
            if(typeof(mark) !== "string"){
                return true;
            }
            if(mark == "new"){
                obj.mark = "icon-new";
            }else if(mark == "hot"){
                obj.mark = "icon-hot";
            }else{
                obj.mark = "-";
            }
        });
    },

    /**
     * 根据条件筛选游戏
     * @param filter
     */
    setMatchData: function() {
        var _this = this;
        _this.matchData = [];
        $.each(_this.data, function(index, val) {
            if(_this.isGameMatched(val)){
                _this.matchData.push(val);
            }
        });
    },

    /**
     * 判断某个游戏对象是否符合过滤条件
     * @param  {[type]}  gameObj [description]
     * @return {Boolean}         [description]
     */
    isGameMatched:function(gameObj){
        //当盒子不支持H5游戏时跳过
        if ( !this.ish5 && gameObj.CATEGORY && +gameObj.CATEGORY !== 1 ) {
            //return false;
        }
        // if(this.filterKeys["GAME_CATE"] && +gameObj["CATEGORY"] !== +this.filterKeys["GAME_CATE"]){
        //     return false;
        // }
        if (this.filterKeys["GAME_CATE"]) {
            if (+gameObj["CATEGORY"] !== 3) {
                if (+gameObj["CATEGORY"] !== +this.filterKeys["GAME_CATE"]) {
                    return false;
                }
            } else { 
                if (+this.filterKeys["GAME_CATE"] === 1) { 
                    return false;
                }
            }
        }
        if(this.filterKeys["GAME_TYPE"] && gameObj["GAME_TYPE"] !== this.filterKeys["GAME_TYPE"]){
            return false;
        }
        if(this.filterKeys["FIGHTING_MODE"] && gameObj["FIGHTING_MODE"] !== this.filterKeys["FIGHTING_MODE"]){
            return false;
        }
        if(this.filterKeys["GAME_PINYIN"] && this.filterKeys["GAME_PINYIN"].indexOf(gameObj["GAME_PINYIN"].toUpperCase()) < 0){
            return false;
        }
        if(this.filterKeys["GAME_THEME"]){
            var r = false;
            if(!(gameObj["themePinYin"] instanceof Array)){
                return false;
            }
            for(var i = 0,len=gameObj["themePinYin"].length;i<len;i++){
                if(gameObj["themePinYin"][i] == this.filterKeys["GAME_THEME"]){
                    r = true;
                }
            }
            if(!r){
                return false;
            }
        }

        return true;
    },

    /**
     * 显示页面初次加载时的游戏
     * @return {[type]} [description]
     */
    showDefault:function(){
        this.mode = "default";
        this.pageIndex = 0;
        this.loadGame(0,this.pageSize,false);
    },

    /**
     * 加载更多游戏
     * @return {[type]} [description]
     */
    loadMore:function(){
        var start=0,end=0;
        if(this.mode !== "default"){
            return false;
        }
        if((this.pageIndex+1) * this.pageSize >= this.data.length){
            return false;
        }
        this.pageIndex++;
        start = this.pageIndex*this.pageSize;
        end = (this.pageIndex+1) * this.pageSize;

        this.loadGame(start,end,true);
    },
    /**
     * 加载游戏
     * @param  {[type]} start [从第几个开始]
     * @param  {[type]} end   [到第几个]
     * @param  {[type]} clear   [是否清空原有数据]
     * @return {[type]}       [description]
     */
    loadGame:function(start,end,isAppend){
        var data = this.data.slice(start,end);
        isAppend = typeof(isAppend) === "undefined" ? true : isAppend;
        this.render(data,isAppend);
    },

    /**
     * 渲染页面
     * @return {[type]} [description]
     */
    render:function(data,isAppend){
        data = data || this.matchData;
        var html = $("#searchItem").html();
        $.each(data, function(index, val) {
            val.NAME_URL = encodeURIComponent(val.NAME);
            val.HOSTS = Box.HOSTS;
            val.refer = "ha_pt_37yyhz";
            val.uid = "search";
            var theme = [];
            var themePinYin = [];
            for (var i in val.GAME_THEME) {
                theme.push(val.GAME_THEME[i]);
                themePinYin.push(i);
            }
            val.theme = theme;
            val.themeLength = theme.length;
            val.themePinYin = themePinYin;
            val.iconUrl = "//img1.37wanimg.com/www/images/sets/" + val.GAME_KEY + "/80x80.png";
            var qrImg = '';
            if (val.OTHER_INFO) { 
                qrImg = val.OTHER_INFO.download_img;
            }
            val.qrImg = qrImg;
            val.tags = val.GAME_TAGS;
            val.idx = index + 1;
            
            //当是H5游戏时添加内容
            if ( +val.CATEGORY === 2 ) {
                var account = "";
                if ( Box.User.info ){
                    account = Box.User.info.LOGIN_ACCOUNT
                }
                val.account = account;
                val.SNAME = encodeURIComponent( "H5游戏" );
            }
        });
        html = SQ.T(html,data);
        if(isAppend === true){
            this.dom.$result.append(html);
        }else{
            this.dom.$result.html(html);
        }
        Box.Page.resetScroll();
    },
    renderEmpty:function(){
        this.dom.$result.html('<div class="nothing-text">对不起，未找到您想要的结果！</div>');
    }
});

window.flashCrash = function(ts){
    clearTimeout(this.timer);
    this.timer = setTimeout(function(){
        client.DoSuperCall(126,{iscrashed:1});
    },ts*10+1000);
}

    /**
     * 存储客户端信息
     */
    var Client = new SQ.Class( SQ.Widget );
    Client.include({
        //当前盒子的版本号
        version:0,
        //客户端返回过来的来源
        refer:'',
        //子站
        uid:'',
        //游戏ID
        gameid:0,
        //是不是ie盒子
        isIE:true,
        isIE6:false,
        isIE7:false,
        //是不是官方端
        isOfficial:true,
        //是不是有H5游戏的版本
        ish5: true,

        //缓存默认数据，等同于原来的DefaultDataMeta
        DefaultData:{
            game_id: "",
            installtime: "",
            refer: "",
            uid: "",
            version: "",
            showlogintype: ""
        },
        //缓存游戏服信息
        ServerInfo:{},
        /**
         * 构造函数
         */
        init:function(){
            var isIE = !!window.ActiveXObject,
                isIE6 = isIE && !window.XMLHttpRequest,
                isIE7 = navigator.userAgent.indexOf("MSIE 7") > 0;
            this.isIE = isIE;
            this.isIE6 = isIE6;
            this.isIE7 = isIE7;
            this.getInfoFromClient();
        },

        /**
         * 设置客户端信息
         * @param info
         */
        setInfo:function(clientinfo){
            this.version = clientinfo.version;
            this.refer = clientinfo.refer;
            this.uid = clientinfo.uid;
            this.gameid = clientinfo.gameid;
            this.checkOfficial();
            this.ish5 = ( +this.version >= 4005 && +this.version < 900000 ); //4005以上的版本为盒子处理了H5游戏的版本

            if("DefaultDataMeta" in window){
                window.DefaultDataMeta = $.extend(DefaultDataMeta, clientinfo);
            }else{
                window.DefaultDataMeta = clientinfo;
            }

            DefaultDataMeta.game_id = clientinfo.gameid;
            this.getServerInfo();

            this.trigger( "inited", this );
        },

        /**
         * 向客户端发请求，获取客户端信息（请求接口118，从接口214返回）
         */
        getInfoFromClient:function(){
            client.DoSuperCall( 118, {
                clientinfo: "alternate"
            });
        },

        /**
         * 判断客户端是不是官方端
         * 依据客户端版本号来判断，推广端的版本号为六位数，91开头
         */
        checkOfficial:function(){
            var v = this.version.toString();
            this.isOfficial = !(v.length === 6 && v.substr(0,2) === "91");
        },

        /**
         * 获取游戏服数据
         */
        getServerInfo: function() {
            var that = this,
                param = this.ServerInfo;
            $.ajax({
                url: "/get_game_key.php",
                dataType: "json",
                data: {
                    game_id: DefaultDataMeta.game_id
                }
            }).done(function(r) {
                if (!$.isEmptyObject(r)) {
                    param.NAME = r.game_name;
                    param.GAME_KEY = r.game_key;
                    param.SID = r.newest_server.SID;
                    param.SERVER_NAME = r.newest_server.SERVER_NAME;
                    DefaultDataMeta.server_id = r.newest_server.ID;
                }
            });
        }
    });

    !(function() {
        //是否存在SQ.alert方法，不存在则引入
        if ( !SQ.alert ) {
            //引入dialog样式
            var alertCss = "<style>.sq-dialog{position:absolute;top:200px;left:500px;z-index:1001;padding:0;width:420px;color:#6c6c6c;font:12px/20px 'Microsoft Yahei';}.sq-dialog-source{display:none;}.sq-dialog-avatar{z-index:1;width:22px;height:23px;position:absolute;top:7px;left:12px;background:transparent url(http://img1.37wanimg.com/www/css/images/common/dialog2/bg-dialog-avatar.png) no-repeat;_background-image:url(http://img1.37wanimg.com/www/css/images/common/dialog2/bg-dialog-avatar-8.png);}.sq-dialog-body{word-break:break-all;background-color:#fff;border:1px solid transparent;_border-color:#fff;border-radius:3px;box-shadow:inset 0 0 2px 1px #fff;*padding-bottom:10px;}.sq-dialog-titlebar{position:relative;height:20px;color:#3c3c3c;padding:10px 0 4px 46px;}.sq-dialog-titlebar-text{color:#3c3c3c;font-size:14px;}.sq-dialog-notitle{height:1px;overflow:hidden;}.sq-dialog-client{background-color:#fff;padding:24px 14px 0;margin-right:10px;margin-left:10px;font-size:14px;_line-height:20px;}.sq-dialog-content{margin-left:10px;margin-right:10px;}.sq-dialog-close{position:absolute;width:14px;height:13px;top:10px;right:15px;text-indent:-9999px;background:transparent url(http://img1.37wanimg.com/www/css/images/common/dialog2/bg-dialog-close.png) no-repeat 0 0;_background-image:url(http://img1.37wanimg.com/www/css/images/common/dialog2/bg-dialog-close-8.png);}.sq-dialog-close:hover{background-position:0 -30px;}.sq-dialog-buttons{position:relative;margin:0 10px 10px;background-color:#fff;padding-bottom:15px;text-align:center;*zoom:1;}.sq-dialog-buttons a{margin-left:10px;margin-right:10px;position: relative;}.sq-dialog-nobutton{border:none;padding:0;height:1px;overflow:hidden;}.sq-dialog-nobutton button{display:none;}.sq-dialog-masking{background-color:#000;left:0;opacity:0;filter:alpha(opacity=0);position:absolute;top:0;z-index:1000;width:100%;}.sq-dialog-overlay{background-color:#fff;border:1px solid #999;position:absolute;}.sq-dialog-content h5{font-weight:normal;font-size:16px;color:#f25277;padding:15px 0;}.sq-dialog-content a{margin-left:3px;margin-right:3px;}.sq-dialog-content p{line-height:18px;margin:8px 0;}.sq-dialog-content-col{display:inline-block;width:112px;text-align:right;}.sq-dialog-loading{height:60px;background:transparent url(http://img1.37wanimg.com/www/css/images/common/loading-48x48.gif) no-repeat 50px center;}.sq-dialog-loading span{position:relative;top:20px;left:120px;}.sq-dialog .btn-s-140,.sq-dialog .btn-s-w{width:140px;height:36px;line-height:36px;font-size:16px;}.sq-dialog .not-button{color:#9c9c9c;}.sq-dialog-titlebar{background-image:url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2YyZjJmMiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2U5ZTllOSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==');background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0%,#f2f2f2),color-stop(100%,#e9e9e9));background-image:-moz-linear-gradient(#f2f2f2,#e9e9e9);background-image:-webkit-linear-gradient(#f2f2f2,#e9e9e9);background-image:linear-gradient(#f2f2f2,#e9e9e9);background-color:#e9e9e9\\9;}.sq-dialog .btn-s-140{background:#ffab16;border-radius:4px;color:#fff;display:inline-block;text-align:center;overflow:hidden;}.sq-dialog .btn-s-140:hover{background:#ff970e;color:#fff;text-decoration:none;}.sq-dialog .btn-s-w{border:1px solid #d9d9d9;border-radius:3px;background:#fff;color:#9c9c9c;display:inline-block;text-align:center;overflow:hidden;}.sq-dialog .btn-s-w:hover{color:#0c3c3c;text-decoration:none;}.sq-dialog .btn-s-disabled{color:#9c9c9c;cursor:default;}.sq-dialog .btn-s-disabled:hover{color:#9c9c9c;}</style>";
            $("head").append(alertCss);
            //引入dialogjs
            $.ajax({
                url: "http://ptres.37.com/js/sq/widget/sq.dialog2015.js?t="+new Date().getTime(),
                dataType: "script",
                success: function(){
                    window.alert = SQ.alert || window.alert;
                }
            })

        }
    })();

    /**
     * v6版跳转逻辑
     *  */
    var Jumps = SQ.Class();
    Jumps.include({
        init:function(){
            this.events();
        },
        events: function () {
            var _this = this;
            $(document)
                .on('click', '#searchResult .yy, #searchResult .sy .btn-start-v6, .g-ad-right a', function () { 
                    _this.jumpLink($(this));
                })
        },
        
        jumpLink: function ($el) {
            var category = $el.attr('data-category'),
                ctype = $el.attr('data-ctype'),
                gameId = $el.attr('data-gameid'),
                gameKey = $el.attr('data-gamekey'),
                name = $el.attr('data-name');
            // console.log(category, ctype, gameId, gameKey, name);
    
            // 原生游戏跳配置的外链，不走下面逻辑
            if (category == 3 && ctype != 101) {
                return;
            }
            var link = '';
            // console.log(Box.User.info);
            if (category == 1) {
                if (ctype == 101) {
                    // 页游端游
                    // console.log('页游端游');
                    var infoData = {
                        "gameid": gameId,
                        "gamekey": gameKey,
                        "gamename": name,
                        "category": category,
                        "ctype": ctype,
                        "app_pst": Box.User.info.app_pst,
                        "ID": Box.User.info.ID,
                        "LOGIN_ACCOUNT": Box.User.info.LOGIN_ACCOUNT
                    };
                    client.DoSuperCall(132, infoData);
                } else{
                    // 页游普通
                    link = 'http://game.37.com/redirect.php?action=enter_game_newest&game_id=' + gameId + '&gamebox=1&wd_openingamebox=1&wd_entergame=1&wd_GAME_KEY=' + gameKey + '&wd_GAME_ID=' + gameId;
                }
            } else if (category == 2) {
                // 手游h5
                link = 'http://game.37.com/play_h5.php?wd_actionid=0&game_id=' + gameId + '&wd_NAME=' + encodeURIComponent(name) + '&wd_GAME_KEY=' + gameKey + '&wd_SID=1&wd_GAME_ID=' + gameId + '&wd_username=' + Box.User.info.LOGIN_ACCOUNT + '&wd_SNAME=' + encodeURIComponent("H5游戏") + '&wd_IsH5Game=1&wd_entergame=1&referer=ha_pt_37yyhz&uid=syhot';
            } else if (category == 3) {
                if (ctype == 101) {
                    // 手游端游
                    // console.log('手游端游');
                    var infoData = {
                        "gameid": gameId,
                        "gamekey": gameKey,
                        "gamename": name,
                        "category": category,
                        "ctype": ctype,
                        "app_pst": Box.User.info.app_pst,
                        "ID": Box.User.info.ID,
                        "LOGIN_ACCOUNT": Box.User.info.LOGIN_ACCOUNT
                    };
                    client.DoSuperCall(132, infoData);
                } else{
                    // 手游原生
                }
            }
            if (link) { 
                // console.log(link);
                window.open(link, '_blank');
            }
        }
    });

$.extend(Box,{
    User:User,
    Played:Played,
    Servers:Servers,
    Game:Game,
    Search:Search,
    Client: new Client(),
    isIE: isIE,
    Jumps: Jumps
});
return Box;

});
