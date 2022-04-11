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
        "box": "modules/box_v6",
        "tgreg":"modules/tgreg",
        "client": "client",
        "util":"util",
        "swfobject": "http://ptres.37.com/js/sq/plugin/swfobject",
        "festival": "plugin/festival"
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
        },
        "festival": {
            deps: ['sq.core']
        }
    }
});

require(["client", "box", "tgreg", "util", "sq.tab", "jQuery.nicescroll", "placeholder","swfobject","festival"], function(client, Box, tgReg, Util) {
var isIE6 = $.browser.msie && (parseInt($.browser.version) < 7);

var Index = new SQ.Class();
Index.include({
    urlHotGames: "http://ptres.37.com/content/s_www/gb_hot_games.js",
    urlRecommend: "http://ptres.37.com/content/s_www/gb_rec_games.js",
    getQueryString: function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return decodeURIComponent(r[2]);
        };
        return null;
    },
    init: function () {
        // v6版js 模板
        // console.log(this.getQueryString('_tpl'))
        var action = this.getQueryString('a');
        var type = this.getQueryString('type');
        
        var _this = this;
        Box.Client.init();//如果要让Box.Client里的setInfo执行就要调一下，靠box里的new client是没用的
        this.ish5 = Box.Client.ish5;//当前盒子版本是否支持h5
        if ( typeof gb_rec2_games == "undefined" ) {
            gb_rec2_games = {};
        }
        Box.User.checkLogin(function(data) {
            Box.Played.init();
            _this.servers = new Box.Servers();
            _this.jumps = new Box.Jumps();
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
            $.hzFestival({
                data: {
                    key: "gamebox_index_pop",
                    //todo 1、新增一个cookie字段
                    storage: "37_gamebox_index_pop_normal",
                    exp: 1,
                    val: "1",
                    count: 5,
                    auto: true,
                    api: {
                        api: "//ptres.37.com/content/s_www/gamebox_index_pop.js",
                        position: "37-gamebox-index-pop-normal"
                    }
                }
            });
            //埋点统计初始化
            Util.statistics.init( data.LOGIN_ACCOUNT );
        }, function() {
            //tgReg.init();
            _this.servers = new Box.Servers();
            _this.jumps = new Box.Jumps();
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
        // this.createKv();
        this.events();
        this.$inputKey = $("#iptSearch").placeholder();
        this.getDefaultVal();

        // console.log(action, type);
        if (action == 'index_v6' && type == 1) {
            // 首页
            this.indexKv();
            this.indexEvents();
        } else if(action == 'index_v6' && type == 2){
            // 手游
            this.mobileKv();
            this.mobileEvents();
        } else if(action == 'index_v6' && type == 3){
            // 页游
            this.webKv();
            this.webEvents();
            this.webServer();
        }
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
    // v6首页事件
    indexEvents: function () {
        var _this = this;
        $(document)
            .on('click', '#recommendV6 .yy, #recommendV6 .btn-start-v6, #hotGamesV6 li, #mobileGamesV6 .btn-start-v6, .g-ad-right a', function () { 
                // _this.jumpLink($(this));
                _this.jumps.jumpLink($(this));
            })
            .on('click', '#indexKv .kv-jump', function () { 
                _this.jumps.jumpLink($(this));
            })
    },
    // v6跳转逻辑
    // jumpLink: function ($el) {
    //     var category = $el.attr('data-category'),
    //         ctype = $el.attr('data-ctype'),
    //         gameId = $el.attr('data-gameid'),
    //         gameKey = $el.attr('data-gamekey'),
    //         name = $el.attr('data-name');
    //     console.log(category, ctype, gameId, gameKey, name);

    //     // 原生游戏跳配置的外链，不走下面逻辑
    //     if (category == 3 && ctype != 101) {
    //         return;
    //     }
    //     var link = '';
    //     // console.log(Box.User.info);
    //     if (category == 1) {
    //         if (ctype == 101) {
    //             // 页游端游
    //             console.log('页游端游');
    //             var infoData = {
    //                 "gameid": gameId,
    //                 "gamekey": gameKey,
    //                 "gamename": name,
    //                 "category": category,
    //                 "ctype": ctype,
    //                 "app_pst": Box.User.info.app_pst,
    //                 "ID": Box.User.info.ID,
    //                 "LOGIN_ACCOUNT": Box.User.info.LOGIN_ACCOUNT
    //             };
    //             client.DoSuperCall(132, infoData);
    //         } else{
    //             // 页游普通
    //             link = 'http://game.37.com/redirect.php?action=enter_game_newest&game_id=' + gameId + '&gamebox=1&wd_openingamebox=1&wd_entergame=1&wd_GAME_KEY=' + gameKey + '&wd_GAME_ID=' + gameId;
    //         }
    //     } else if (category == 2) {
    //         // 手游h5
    //         link = 'http://game.37.com/play_h5.php?wd_actionid=0&game_id=' + gameId + '&wd_NAME=' + encodeURIComponent(name) + '&wd_GAME_KEY=' + gameKey + '&wd_SID=1&wd_GAME_ID=' + gameId + '&wd_username=' + Box.User.info.LOGIN_ACCOUNT + '&wd_SNAME=' + encodeURIComponent("H5游戏") + '&wd_IsH5Game=1&wd_entergame=1&referer=ha_pt_37yyhz&uid=syhot';
    //     } else if (category == 3) {
    //         if (ctype == 101) {
    //             // 手游端游
    //             console.log('手游端游');
    //             var infoData = {
    //                 "gameid": gameId,
    //                 "gamekey": gameKey,
    //                 "gamename": name,
    //                 "category": category,
    //                 "ctype": ctype,
    //                 "app_pst": Box.User.info.app_pst,
    //                 "ID": Box.User.info.ID,
    //                 "LOGIN_ACCOUNT": Box.User.info.LOGIN_ACCOUNT
    //             };
    //             client.DoSuperCall(132, infoData);
    //         } else{
    //             // 手游原生
    //         }
    //     }
    //     if (link) { 
    //         console.log(link);
    //         window.open(link, '_blank');
    //     }
    // },
    // v6首页kv
    indexKv: function () { 
        new SQ.Tab({
            el: "#indexKv", // 容器选择器 默认 body
            tabs: ".kv-num li", //选项 选择器 默认 li
            panels: ".kv-img li", //内容选择器 默认 div
            eventType: "click", //切换事件 默认点击
            index: 0, //初始显示第一个
            auto: true,  // 是否自动切换
            interval: 5000,//自动切换时间间隔
            currentClass: "focus" // 当前选项的样式class
        });
    },
    // v6页游事件
    webEvents: function () {
        var _this = this;
        $(document)
            .on('click', '.page-prev, .page-next', function () { 
                _this.changePage(this);
            })
            .on('click', '#hotGamesV6 li, .g-ad-right a', function () { 
                _this.jumps.jumpLink($(this));
            })
            .on('click', '#webKv .kv-jump', function () { 
                _this.jumps.jumpLink($(this));
            })
            .on('click', 'a.btn-clock', function(event) {
                event.preventDefault();
                var $this = $(this),
                    gameData = $this.parents('li').data("game"),
                    arr = gameData.split('|'),
                    json = {starttime:arr[0],gameid:arr[1],serverid:arr[2],servername:arr[3],gamename:arr[4],gamekey:arr[5]};
                client.DoSuperCall(124,json);
            });
    },
    // v6页游服列表翻页
    changePage: function (el) { 
        var $this = $(el),
            isAdd = $this.prop("class").indexOf("-next")>0,
            $pager = $this.parent(),
            pageIndex = $pager.data("pageindex"),
            pageCount = $pager.data("pagecount"),
            newPageIndex = 0;

        if(isAdd){
            newPageIndex = pageIndex+1 > pageCount-1 ? 0 : pageIndex+1;
        }else{
            newPageIndex = pageIndex-1 < 0 ? pageCount-1 : pageIndex-1;
        }
        var $ul = $pager.siblings("ul.server-page-v6").addClass("hide")
            .eq(newPageIndex).removeClass("hide");
        $pager.data("pageindex",newPageIndex)
            .children(".current").html(newPageIndex+1);
        Box.Page.loadImgs($ul);
    },
    // v6页游开服表切换
    webServer: function () { 
        new SQ.Tab({
            el: "#serverListV6", // 容器选择器 默认 body
            tabs: ".serverlist-hd span", //选项 选择器 默认 li
            panels: ".serverlist-bd .pannel", //内容选择器 默认 div
            eventType: "click", //切换事件 默认点击
            index: 0, //初始显示第一个
            currentClass: "focus" // 当前选项的样式class
        });
    },
    // v6页游kv
    webKv: function () { 
        new SQ.Tab({
            el: "#webKv", // 容器选择器 默认 body
            tabs: ".kv-num li", //选项 选择器 默认 li
            panels: ".kv-img li", //内容选择器 默认 div
            eventType: "click", //切换事件 默认点击
            index: 0, //初始显示第一个
            auto: true,  // 是否自动切换
            interval: 5000,//自动切换时间间隔
            currentClass: "focus" // 当前选项的样式class
        });
    },
    // v6手游事件
    mobileEvents: function () {
        var _this = this;
        $(document)
            .on('click', '#mobileGamesV6 .btn-start-v6, .g-ad-right a', function () { 
                _this.jumps.jumpLink($(this));
            })
            .on('click', '#mobileKv .kv-jump, #mobileKvSider .kv-jump', function () { 
                _this.jumps.jumpLink($(this));
            })
    },
    // v6手游kv
    mobileKv: function () {
        new SQ.Tab({
            el: "#mobileKv", // 容器选择器 默认 body
            tabs: ".kv-num li", //选项 选择器 默认 li
            panels: ".kv-img li", //内容选择器 默认 div
            eventType: "click", //切换事件 默认点击
            index: 0, //初始显示第一个
            auto: true,  // 是否自动切换
            interval: 5000,//自动切换时间间隔
            currentClass: "focus" // 当前选项的样式class
        });
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
