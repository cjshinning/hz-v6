require.config({
    baseUrl: "/static/hz/js",
    urlArgs: "t=20180921184000VER&c=cc",
    paths: {
        "jQuery": "lib/landers.core",
        "sq.core": "lib/sq.core",
        "sq.tab": "http://ptres.37.com/js/sq/widget/sq.tab",
        "sq.statis": "http://ptres.37.com/js/sq/widget/sq.statis",
        "sq.tooltip": "http://ptres.37.com/js/sq/widget/sq.tooltip",
        "jQuery.nicescroll": "http://ptres.37.com/js/sq/plugin/jquery.nicescroll.min",
        "sq.login": "http://ptres.37.com/js/sq/widget/sq.login",
        "placeholder": "http://ptres.37.com/js/jquery.placeholder.min",
        "box": "modules/box",
        "tgreg":"modules/tgreg",
        "client": "client",
        "util":"util",
        "swfobject":"http://ptres.37.com/js/sq/plugin/swfobject"
    },
    shim: {
        "sq.core": {
            deps: ["jQuery"],
            exports: "SQ"
        },
        'sq.statis': {
            deps: ['sq.core']
        },
        "sq.tab": {
            deps: ["sq.core"],
            exports: "SQ.Tab"
        },
        'sq.tooltip': {
            deps: ['sq.core']
        },
        "sq.login": {
            deps: ['sq.core']
        },
        'jQuery.nicescroll': {
            deps: ['sq.core']
        },
        'placeholder': {
            deps: ['sq.core']
        }
    }
});

require(["client", "box", "tgreg", "util", "sq.tab", "jQuery.nicescroll", "placeholder","swfobject"], function(client, Box, tgReg, Util) {
var isIE6 = $.browser.msie && (parseInt($.browser.version) < 7);

var Index = new SQ.Class();
Index.include({
    urlHotGames: "http://ptres.37.com/content/s_www/gb_hot_games.js",
    urlRecommend: "http://ptres.37.com/content/s_www/gb_rec_games.js",
    init: function () {
        var _this = this;
        Box.Client.init();//如果要让Box.Client里的setInfo执行就要调一下，靠box里的new client是没用的
        this.ish5 = Box.Client.ish5;//当前盒子版本是否支持h5
        if ( typeof gb_rec2_games == "undefined" ) {
            gb_rec2_games = {};
        }
        Box.User.checkLogin(function(data) {
            Box.Played.init();
            _this.servers = new Box.Servers();
            // _this.showRecommend(gb_rec_games, $("#recommend1"), $("#tmp_recommend1"), "tj");
            // _this.showRecommend(gb_rec2_games, $("#recommend2"), $("#tmp_recommend2"), "boxtj");
            _this.showRecommendLJ(gb_rec2_games.cats, $("#recommend2"), $("#tmp_recommend2"), "boxtj");
            _this.showHotGames(gb_hot_games);
            _this.showMobileGames( gb_index_shouyou );
            _this._checkLoginArea(data); //检测帐号是否异地登录
            // 有time 判断time，无time
            if (data.pwd_is_weak) {
                if (localStorage.getItem("time")==null || +localStorage.getItem("time") < +new Date().getDate()) {
                    _this._checkPswWeak(data);
                }
            }
            //埋点统计初始化
            Util.statistics.init( data.LOGIN_ACCOUNT );
        }, function() {
            //tgReg.init();
            _this.servers = new Box.Servers();
            // _this.showRecommend(gb_rec_games, $("#recommend1"), $("#tmp_recommend1"), "tj");
            // _this.showRecommend(gb_rec2_games, $("#recommend2"), $("#tmp_recommend2"), "boxtj");
            _this.showRecommendLJ(gb_rec2_games.cats, $("#recommend2"), $("#tmp_recommend2"), "boxtj");
            _this.showHotGames(gb_hot_games);
            _this.showMobileGames( gb_index_shouyou );
            //埋点统计初始化
            Util.statistics.init();
        });
        this.initFlash();
        this.$recommend1 = $("#recommend1");
        this.$recommend2 = $("#recommend2");
        this.createKv();
        this.events();
        this.$inputKey = $("#iptSearch").placeholder();
        this.getDefaultVal();
    },
    events: function() {
        var _this = this;
        $("#hotMore").on('click', function(event) {
            event.preventDefault();
            client.DoSuperCall(113, {
                url: Box.urlSearch + "&nologin=" + Box.noLogin,
                type: 2
            });
        });
        if (isIE6 === true) {
            this.$recommend1.on("mouseover mouseout", "li", function(event) {
                if (event.type === "mouseover") {
                    $(this).addClass("hover");
                } else if (event.type === "mouseout") {
                    $(this).removeClass("hover");
                }
            });

            //临时解决，以后删除
            $(".m-recommend-games2 ul").on("mouseover mouseout", "li", function(event) {
                if (event.type === "mouseover") {
                    $(this).addClass("hover");
                } else if (event.type === "mouseout") {
                    $(this).removeClass("hover");
                }
            });
        }
        var isMpOpen;
        $( document )
            .on( "mouseenter mouseleave", ".g-handgame-download, .handgame-qrcode1", function( e ) {
                if ( $( this ).hasClass( "g-handgame-download" ) ) {
                    $qr = $( this ).parent().next().clone();
                    $( document.body ).append( $qr.addClass( 'handgame-qrcode-tmp' ) );
                    if ( !isMpOpen && e.type === "mouseenter" ) {
                        var left = $( this ).offset().left + $( this ).width() + 2;
                        if ( $qr.data("fx") === "r" ) {
                            left = $( this ).offset().left - $qr.width()
                        }
                        $qr.show().css( {
                            top: $( this ).offset().top - 105,
                            left: left
                        } );
                        isMpOpen = true;
                    }
                    if ( isMpOpen && e.type === "mouseleave" ) {
                        $( ".handgame-qrcode-tmp" ).remove();
                        isMpOpen = false;
                    }
                }/*
                return;
                var mp_main = $(this).hasClass( "g-handgame-download" ) ? $( this ).parent().next() : $( this );
                if ( !isMpOpen && e.type === "mouseenter" ) {
                    mp_main.show();
                    isMpOpen = true;
                }
                if ( isMpOpen && e.type === "mouseleave" ) {
                    mp_main.hide();
                    isMpOpen = false;
                }*/
            })
            .on( "mouseenter mouseleave", ".m-mobile-main", function( e ) {
                if ( e.type === "mouseenter" ) {
                    $(this).addClass( "m-mobile-main-h" );
                }
                if ( e.type === "mouseleave" ) {
                    $(this).removeClass( "m-mobile-main-h" );
                }
            });
    },
    /**
    @description    设置顶部搜索输入框的默认值
    @param
    @return         undefined
    */
    getDefaultVal: function() {
        var o = this.opt;
        $.getScript("//ptres.37.com/content/s_www/gb_search_default.js", function() {
            var res = sq_content_s_www_gb_search_default;
            if ( res && res.data && res.data[0] && res.data[0]["default"] ) {
                $("#iptSearch").val( res.data[0]["default"] );
            }
        });
    },
    createKv: function() {
        var $tab1 = $("#tab1"),
            tab1 = new SQ.Tab({
                el: "#tab1", // 容器选择器 默认 body
                tabs: ".kv-thumbs li", //选项 选择器 默认 li
                panels: ".kv-imgs li", //内容选择器 默认 div
                eventType: "click", //切换事件 默认点击
                index: 0, //初始显示第一个
                auto: true, // 是否自动切换
                interval: 5000, //自动切换时间间隔
                currentClass: "focus" // 当前选项的样式class
            }),
            max = tab1.tabs.length - 1;

        $tab1.on('click', '.slide-icon-l', function(event) {
            event.preventDefault();
            i = --tab1.currentIndex;
            i = i < 0 ? max : i;
            tab1.change(i);
        }).on('click', '.slide-icon-r', function(event) {
            event.preventDefault();
            i = ++tab1.currentIndex;
            i = i > max ? 0 : i;
            tab1.change(i);
        });
        setTimeout(function() {
            $tab1.children("ul.kv-imgs").find("img").each(function(index, val) {
                var $this = $(this);
                $this.prop("src", $this.data("imgsrc"));
            });
            $tab1.children(".kv-thumbs").find("img").each(function(index, val) {
                var $this = $(this);
                $this.prop("src", $this.data("imgsrc")).get(0).onload = function() {
                    $(this).removeClass("loading");
                }
            });
        }, 300);
    },
    /**
     * 加载推荐游戏数据
     */
    loadRecommend:function(){
        var _this = this;
        $.ajax({
            url: _this.urlRecommend,
            type: 'GET',
            dataType: 'script'
        }).done(function() {
            _this.showRecommend(sq_content_s_www_gb_rec_games);
        }).fail(function() {
            _this.$recommend1.prev(".loading").html("数据加载出错！");
        });
    },

    /**
     * 推荐游戏 LJ
     * @return {[type]} [description]
     */
    showRecommendLJ: function(obj, $rec, $tmp, uid) {
        var _this = this;

        var data = [],
            game = null;

        if ( obj.length === 0 ) {
            $rec.prev(".loading").html("数据加载出错！");
            return;
        }

        for (var i = 0; i < obj.length; i++) {
            game = obj[i].games[0]

            //当盒子不支持H5游戏时跳过
            if ( !_this.ish5 && game.CATEGORY && +game.CATEGORY !== 1 ) {
                //continue;
            }
            //当是H5游戏时添加内容
            if ( +game.CATEGORY === 2 ) {
                var account = "";
                if ( Box.User.info ){
                    account = Box.User.info.LOGIN_ACCOUNT
                }
                game.account = account;
                game.SNAME = encodeURIComponent( "H5游戏" );
                game.refer = "ha_pt_37yyhz";
                game.uid = uid || "";
            }
            game.index = i + 1;
            game.ident = ( i < 3 ) ? "up" + ( i + 1 ) : "down" + ( i - 2 );
            game.HOSTS = Box.HOSTS;
            game.NAME_URL = encodeURIComponent(game.NAME);
            game.text = obj[i].imgs[0].sub_title;
            game.actionid = uid === "boxtj" ? 160 + game.index : 164;
            game.imgUrl = obj[i].imgs[0].src;
            game.photo_bid = typeof obj[i].imgs[0].photo_bid != "undefined" ? obj[i].imgs[0].photo_bid : "";
            game.imgUrlOther = obj[i].imgs[1].src;
            game.img_tag_src = obj[i].img_tag_src;
            game.img_tag_switch = obj[i].img_tag_switch;
            data.push(game);
        }
        $rec.html(SQ.T($tmp.html(), data)).show().prev(".loading").hide();
    },

    /**
     * 推荐游戏
     * @return {[type]} [description]
     */
    showRecommend: function(obj, $rec, $tmp, uid) {
        var _this = this;

        var data = [],
            game = null;
        $rec = $rec || _this.$recommend1;
        $tmp = $tmp || $("#tmp_recommend1");
        if ($.isEmptyObject(obj)) {
            $rec.prev(".loading").html("数据加载出错！");
            return;
        }
        for (var i = 0; i < 3; i++) {
            game = Box.Game.getGameById(obj.game_ids[i]);
            if ($.isEmptyObject(game)) {
                continue;
            }
            //当盒子不支持H5游戏时跳过
            if ( !_this.ish5 && game.CATEGORY && +game.CATEGORY !== 1 ) {
                //continue;
            }
            //当是H5游戏时添加内容
            if ( +game.CATEGORY === 2 ) {
                var account = "";
                if ( Box.User.info ){
                    account = Box.User.info.LOGIN_ACCOUNT
                }
                game.account = account;
                game.SNAME = encodeURIComponent( "H5游戏" );
                game.refer = "ha_pt_37yyhz";
                game.uid = uid || "";
            }
            game.index = i + 1;
            game.HOSTS = Box.HOSTS;
            game.NAME_URL = encodeURIComponent(game.NAME);
            game.text = obj.text[i];
            game.actionid = uid === "boxtj" ? 160 + game.index : 164;
            game.imgUrl = obj.imgs[i];
            data.push(game);
        }
        $rec.html(SQ.T($tmp.html(), data)).show().prev(".loading").hide();
    },
    getHotData: function(data) {
        var gameList = [],
            _this = this,
            game = null,
            arrTxt = null;
        try {
            console.log(Box.Game.getGameById('577'));
            for (var i = 0, len = data.game_ids.length; i < len; i++) {
                game = Box.Game.getGameById(data.game_ids[i]);
                if ($.isEmptyObject(game)) {
                    continue;
                }
                //当盒子不支持H5游戏时跳过
                if ( !_this.ish5 && game.CATEGORY && +game.CATEGORY !== 1 ) {
                    //continue;
                }
                //当是H5游戏时添加内容
                if ( +game.CATEGORY === 2 ) {
                    var account = "";
                    if ( Box.User.info ){
                        account = Box.User.info.LOGIN_ACCOUNT
                    }
                    game.account = account;
                    game.SNAME = encodeURIComponent( "H5游戏" );
                    game.refer = "ha_pt_37yyhz";
                    game.uid = "yyhot";
                }
                game.index = i + 1;
                game.HOSTS = Box.HOSTS;
                game.NAME_URL = encodeURIComponent(game.NAME);
                game.imgUrl = data.imgs[i];
                arrTxt = data.text[i].split('|');
                game.text1 = arrTxt[0];
                game.text2 = arrTxt[1];
                game.link = data.links[i];
                game.gameType = Box.gameTypes[game.GAME_TYPE];
                game.photo_bid = data.photo_bid[i];
                gameList.push(game);
            }
        } catch (e) {}

        return gameList;
    },
    showHotGames: function(list) {
        var _this = this;
        var $hotGames = $("#hotGames"),
            $temp = $("#tmp_hotgame"),
            html = '',
            data = _this.getHotData(list);
        if($.isEmptyObject(data)){
            return;
        }
        html = SQ.T($temp.html(), data);
        $hotGames.removeClass("hide").prev(".loading").addClass("hide");
        $hotGames.html(html);
        Box.Page.loadImgs($hotGames);
    },
    getMobileData: function(data) {
        var gameList = [],
            _this = this,
            game = null,
            arrTxt = null,
            now = 0,
            add = 0;
        try {
            for (var i = 0, len = data.length; i < len && i < 6; i++) {
                game = Box.Game.getGameByKey(data[ i ].game_name);
                if (!data[ i ].game_name) {
                    continue;
                }
                now++;
                $.extend( game, data[ i ] );
                game.CATEGORY = game.category;
                if ( game.game ) {
                    game.ID = game.game.id;
                    game.GAME_KEY = game.game.game_key;
                    game.NAME = game.game.name;
                    game.GAME_TYPE = game.game.game_type;
                }
                //当是H5游戏时添加内容
                if ( +game.CATEGORY === 2 ) {
                    var account = "";
                    if ( Box.User.info ){
                        account = Box.User.info.LOGIN_ACCOUNT
                    }
                    game.account = account;
                    game.SNAME = encodeURIComponent( "H5游戏" );
                    game.refer = "ha_pt_37yyhz";
                    game.uid = "syhot";
                }
                game.index = now;
                game.empty = 0;
                game.HOSTS = Box.HOSTS;
                game.NAME_URL = encodeURIComponent(game.NAME);
                game.gameType = Box.gameTypes[game.GAME_TYPE];

                gameList.push( game );
            }
            if ( now < 3 ) {
                add = 3 - now;
            } else if ( now > 3 && now < 6 ) {
                add = 6 - now;
            }
            for (var j = 0; j < add; j++) {
                gameList.push( {
                    empty: 1
                } );
            }
        } catch (e) {}

        return gameList;
    },
    showMobileGames: function( list ) {
        var _this = this;
        var $mobileGames = $( "#mobileGames" ),
            $temp = $( "#tmp_mobilegame" ),
            html = '',
            data = _this.getMobileData( list.data );
        if( $.isEmptyObject( data ) ) {
            $( ".m-mobilegames" ).hide();
            return;
        }
        html = SQ.T( $temp.html(), data );
        $mobileGames.removeClass( "hide" ).prev( ".loading" ).addClass( "hide" );
        $mobileGames.html( html );
        Box.Page.loadImgs( $mobileGames );
    },

    /**
     * 初始化首页flash
     */
    initFlash:function(){
        //var _this = this;
        swfobject.registerObject("flashMain");
        var flashMain = swfobject.getObjectById("flashMain");
    },
    /**
     * 判定是否加载成功
     * @param flash
     * @param success
     */
    checkFlashLoad:function(flash,success){
        var _this = this;
        function checkLoaded(flash){
            try{
                if("addObj" in flash && $.isFunction(flash.addObj)){
                    return true;
                }else{
                    return false;
                }
                //return Math.floor(flash.PercentLoaded()) == 100
            }catch(e){
                return false;
            }
        }
        _this.intervalFlash =  setInterval(function(){
            if(checkLoaded(flash)){
                clearInterval(_this.intervalFlash);
                intervalID = null;
                if($.isFunction(success)){
                    success();
                }
            }
        },60);
    },
    /**
     * 用户帐号异地登录弹框提醒
     * @param data 用户登录信息
     */
    _checkLoginArea: function (data) {
        var userInfo = data;
        if (userInfo) {
            $.ajax({
                url: 'http://my.37.com/api/remote_login_media_notice.php',
                type: 'get',
                cache: false,
                dataType: 'jsonp'
            })
            .done(function(res) {
                if (res.code *1 === 1) {
                    var la = userInfo.LOGIN_ACCOUNT,
                        sn = userInfo.SHOW_NAME,
                        aa = userInfo.ALIAS_ACCOUNT,
                        an = userInfo.AUTH_NICKNAME,
                        userData = sn ? sn : aa ? aa : la ? la : "",
                        loginInfo = res.data.remote_addr+'|'+res.data.remote_login_time+'|'+res.data.remote_login_type+'|'+userData,
                        infoData = {
                            "openform": 1, //异地登录是否弹框（0不弹框，1弹框）
                            "openurl": "http://landers.37.com/hz/login_warn.html?"+encodeURIComponent(loginInfo), //弹框页面的地址
                            "wide": 330, //弹框的宽度
                            "high": 216 //弹框的高度
                        };

                    //通知盒子弹出“异地登录”提示框
                    client.DoSuperCall(128, infoData);

                }
            })
            .fail(function() {
                return;
            });
        }
    },
    // 弱密码提示
    _checkPswWeak: function (data) {
        infoData = {
            "openform": 1, //是否弹框（0不弹框，1弹框）
            "openurl": "http://landers.37.com/hz/pwd_weak_warn.html", //弹框页面的地址
            "wide": 330, //弹框的宽度
            "high": 216 //弹框的高度
        };
        client.DoSuperCall(128, infoData);
        
    }
});

/*    window.getFlashData = function(){
        return window.flashConfig.urls;
    }*/
$(document).ready(function($) {
    Box.init();
    new Index();
    new Box.Search();
});
    
function getCookie(name) {
    var result;
    return (result = new RegExp("(?:^|; )" + name + "=([^;]*)").exec(document.cookie)) ? decodeURIComponent(result[1]) : null;
}
function setCookie(key, value, options) {
    options = Object.assign({
        encodeKey: true
    }, options);

    if (value === null) {
        options.expires = -1;
    }

    if (typeof options.expires === "number") {
        var days = options.expires,
            t = options.expires = new Date();
        t.setDate(t.getDate() + days);
    }

    return (document.cookie = [
        options.encodeKey ? encodeURIComponent(key) : key, "=",
        options.raw ? String(value) : encodeURIComponent(String(value)),
        options.expires ? "; expires=" + options.expires.toUTCString() : "", // use expires attribute, max-age is not supported by IE
        options.path ? "; path=" + options.path : "",
        options.domain ? "; domain=" + options.domain : "",
        options.secure ? "; secure" : ""
    ].join(""));
}
});
