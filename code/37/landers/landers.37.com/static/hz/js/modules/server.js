require.config({
    baseUrl:"/static/hz/js",
    paths: {
        "jQuery":"lib/landers.core",
        "sq.core": "lib/sq.core",
        "sq.tab": "http://ptres.37.com/js/sq/widget/sq.tab",
        "sq.statis": "http://ptres.37.com/js/sq/widget/sq.statis",
        "sq.tooltip":"http://ptres.37.com/js/sq/widget/sq.tooltip",
        "jQuery.nicescroll":"http://ptres.37.com/js/sq/plugin/jquery.nicescroll.min",
        "sq.dialog":"http://ptres.37.com/js/sq/widget/sq.dialog",
        "sq.login":"http://ptres.37.com/js/sq/widget/sq.login",
        "SQ.DQServer":"http://ptres.37.com/js/sq/widget/sq.dqserver",
        "box":"modules/box",
        "client":"client"
    },  
    shim:{
        "sq.core" :{
            deps:["jQuery"],
            exports:"SQ"
        },
        'sq.statis':{
            deps:['sq.core']
        },
        "sq.tab":{
            deps:["sq.core"],
            exports:"SQ.Tab"
        },
        'sq.tooltip':{
            deps:['sq.core']
        },
        'jQuery.nicescroll':{
            deps:['sq.core']
        },
        "sq.login":{
            deps:['sq.core']
        },
        'sq.dialog':{
            deps:['sq.core']
        },
        'SQ.DQServer':{
            deps:['sq.core']
        }
    },
    urlArgs:"t=2015101501VER"
});

require( [
	"box",
	"client", 
	"sq.tab",
	"jQuery.nicescroll",
    "SQ.DQServer"
	], 
	function( Box,client ) {
var $doc = $(document),
	$win = $(window);

//判断ie版本，以后要删除，从Box.Client中取
var isIE = !!window.ActiveXObject,
    isIE6 = isIE && !window.XMLHttpRequest,
    isIE7 = navigator.userAgent.indexOf("MSIE 7") > 0;

/**
 * 服务器列表
 * @namespace main.server
 */
var server = {
    serverAreaListUrl: "http://ptres.37.com/content/cache/game_server_v2/{$gameid}/server_{$serverType}_{$page}.js",
    serverFastinUrl: "http://game.37.com/api/p_games.php?action=p_gamebox_servername&game_id={$gameid}&sid={$sid}",
    p: '<div class="server-list-panel cf" id="panel-{type}-{id}">{content}</div>',
    t: '<li class="{tab}"><a {focus} data-page="{page}" href="#" data-type="{type}">{num}</a></li>',
    t_ul: '<div class="server-list-title" id="server-list-title-{type}"><div class="server-list-title-prev"></div><ul>{content}</ul><div class="server-list-title-next"></div></div>',
    isLoadingCache: {},
    init: function( gameId, setting ) {
        var $el = $( "#all-server" ),
            serverStyle = setting["serverStyle"];
        if ( !$el || !$el.length ) return;

        server.gameId = gameId;
        server.gameName = setting["gameName"];
        server.gameKey = setting["gameKey"];
        this.gameSetting = setting;
        this.hisDiv = $( "#history-server" );
        this.allDiv = $el;
        this.panDiv = $el.find( ".server-list-p" );
        this.tabUl = $( ".server-tab" );
        this.defaultServerType = +this.gameSetting.serverType || 1;
        //if ( this.gameSetting.serverType && +this.gameSetting.serverType > 3 ) {
            this.exServer();
        //}
        this.getUserHis();
        this.events();
        serverStyle && this.diffStyle[ serverStyle ] && this.diffStyle[ serverStyle ]();
        this.cursorcolor = setting.tplStyle && this.tplStyle[ setting.tplStyle ] || this.tplStyle[ "0" ];

        $el.trigger("focus");

        //dts.init(gameId);
    },

    state: {
        "1": "37 《{name}》 {server}，将于 {date} 火爆开启，敬请期待！",
        "empty":'<span class="white">该游戏暂无服务器开启，请留意游戏公告</span>',
        "empty2":'<span class="white lh36"> &nbsp;暂无推荐服务器</span>',
        "3": "游戏正在维护中，请留意官网公告！"
    },

    tplStyle: {
        "0": "#6e614a",
        "2": "#755f31",
        "3": "#0b445d"
    },

    diffStyle: {
        "2": function() {
            $( "#server-kv" ).length > 0 && SQ.Tab && new SQ.Tab({
                tabs: "#server-kv .server-kv-nav:first a",
                panels: "#server-kv .server-kv-panel",
                auto: true
            });
            $( ".news-tab" ).length > 0 && SQ.Tab && new SQ.Tab({
                tabs: ".news-tab-li",
                panels: ".news"
            });
        }
    },

    events: function() {
        var that = this;
        $doc
            .on( "click", function( e ) {
                if ( e.target.id !== "option-dom" && e.target.id !== "select-con" && e.target.id !== "select-btn" ){
                    $( "#option-bg" ).hide();
                }
                if ( e.target.id !== "st-option-dom" && e.target.id !== "st-select-con" && e.target.id !== "st-select-btn" ){
                    $( "#st-option-bg" ).hide();
                }
                if ( this.className !== "option-dom ct-option-dom" < 0 && e.target.id !== "ct-select-con" && e.target.id !== "ct-select-btn" ) {
                    $( "#ct-option-bg" ).hide();
                }
            })
            .on( "click.server", "#btn-fastin", function( e ) {
                e.preventDefault();
                that.fastIn( $( "#server-fastin" ).val(), that.totalServer, $( "#server-begin-num" ).val() );
            })
            .on( "click.server", "a[data-state]", function( e ) {
                var state = this.getAttribute( "data-state" );
                if ( state !== "2" ) {
                    e.preventDefault();
                    that.stateAlert( this, server.gameName );
                }
            })
            .on( "click.select", "#select-con, #select-btn", function() {
                $( "#option-bg" ).toggle();
            })
            .on( "mouseenter.option", "#option-dom li", function() {
                $( "#option-dom" ).find( "li" ).removeClass( "focus" );
                $( this ).addClass( "focus" );
            })
            .on( "mouseleave.option", "#option-dom li", function() {
                $( "#option-dom" ).find( "li" ).removeClass( "focus" );
            })
            .on( "click.option", "#option-dom li", function() {
                var opt = $( this ).attr( "data-opt" ),
                    type = $( this ).attr( "data-type" );
                $( "#server-begin-num" ).val( opt );
                $( "#server-type" ).val( type || 1 );
                $( "#select-con" ).html( $( this ).html() );
                $( "#option-bg" ).toggle();
                $( "#server-fastin" ).val( "" ).focus();
                if ( that.gameSetting.serverType && !type ) {
                    $( "#server-type" ).val( type );
                    $("#panel-" + type + "-1").find("a").hide().end().find( "a[data-area="+opt+"]").show();
                    that.setSize();
                }
            })
            .on( "click.st-select", "#st-select-con, #st-select-btn", function() {
                $( "#st-option-bg" ).toggle();
            })
            .on( "mouseenter.st-option", "#st-option-dom li", function() {
                $( "#st-option-dom" ).find( "li" ).removeClass( "focus" );
                $( this ).addClass( "focus" );
            })
            .on( "mouseleave.st-option", "#st-option-dom li", function() {
                $( "#st-option-dom" ).find( "li" ).removeClass( "focus" );
            })
            .on( "click.st-option", "#st-option-dom li", function() {
                var stType = $( this ).attr( "data-type" ),
                    $n, opt, type;
                $( "#st-select-con" ).html( $( this ).html() );
                $( "#st-option-bg" ).toggle();

                $( ".ct-option-dom" ).hide();
                $n = $( "#option-dom-" + stType ).show().find( "li" ).eq(0);
                opt = $n.data( "opt" );
                type = $n.data( "type" );
                $( "#server-begin-num" ).val( opt );
                $( "#server-type" ).val( type || 1 );
                $( "#ct-select-con" ).html( $n.html() );
                $( "#server-fastin" ).val( "" ).focus();
                if ( that.gameSetting.serverType && +type > 3 ) {
                    $( "#server-type" ).val( type );
                    $("#panel-" + type + "-1").find("a").each(function(){
                        var $this = $(this);
                        if($this.data("area") === opt){
                            $this.show();
                        }else{
                            $this.hide();
                        }
                    });
                    //$("#panel-" + type + "-1").find("a").hide().end().find( "a[data-area="+opt+"]").show();
                    that.setSize();
                }
            })
            .on( "click.select", "#ct-select-con, #ct-select-btn", function() {
                $( "#ct-option-bg" ).toggle();
            })
            .on( "mouseenter.ct-option", ".ct-option-dom li", function() {
                $( ".ct-option-dom" ).find( "li" ).removeClass( "focus" );
                $( this ).addClass( "focus" );
            })
            .on( "mouseleave.ct-option", ".ct-option-dom li", function() {
                $( ".ct-option-dom" ).find( "li" ).removeClass( "focus" );
            })
            .on( "click.ct-option", ".ct-option-dom li", function() {
                var opt = $( this ).attr( "data-opt" ),
                    type = $( this ).attr( "data-type" );
                $( "#server-begin-num" ).val( opt );
                $( "#server-type" ).val( type || 1 );
                $( "#ct-select-con" ).html( $( this ).html() );
                $( "#ct-option-bg" ).toggle();
                $( "#server-fastin" ).val( "" ).focus();
                if ( that.gameSetting.serverType && +type > 3 ) {
                    $( "#server-type" ).val( type );
                    $("#panel-" + type + "-1").find("a").hide().end().find( "a[data-area="+opt+"]").show();
                    that.setSize();
                }
            });
        $doc
            .on( "click.server-tab", ".server-tab a", function( e ) {
                e.preventDefault();
                var type = this.getAttribute( "data-tab" );
                if ( this.className.indexOf( "focus" ) > -1 || this.className.indexOf( "pending" ) > -1 ) {
                    return;
                }
                that.tabUl.find( "a" ).removeClass( "focus" );
                $( this ).addClass( "focus" );
                that.tabChange( type );
                if ( +type > 3 ) {
                    $("#panel-" + type + "-1").find("a").show();
                }
            })
            .on( "click.server", ".server-list-title a", function( e ) {
                e.preventDefault();

                var page = this.getAttribute( "data-page" ),
                    type = this.getAttribute( "data-type" ),
                    $panel;
                if ( +type > 3 ) {
                    $panel = $("#panel-" + type + "-1");
                    if ( page === "1" ) {
                        $panel.find("a").hide().end().find( "a").slice(0, 9).show();
                    } else {
                        var l = that.gameSetting.serverTypeList,
                            i = 0,
                            p = false;
                        for ( i; i < l.length; i++ ) {
                            if ( type == l[i].server_type ) {
                                p = l[i].server_type_parent === 1;
                                break;
                            }
                        }
                        if ( p ) {
                            $panel.find("a").hide().end().find( "a[data-parea=" + page + "]").show();
                        } else {
                            $panel.find("a").hide().end().find( "a[data-area=" + page + "]").show();
                        }
                    }
                    that.setScroll();
                    $( "#server-list-title-" + type ).find( "a" ).removeClass( "focus" )
                        .end()
                        .find( "a[data-page=" + page + "]").addClass( "focus" );
                    return;
                }
                if ( this.className.indexOf( "focus" ) > -1 || this.className.indexOf( "pending" ) > -1 ) {
                    return;
                }
                that.panelChange( type, page, $( this ));
            })
            .on( "click.page", ".server-list-title-prev, .server-list-title-next", function( e ) {
                e.preventDefault();

                var $p = $( this ).parent(),
                    ul_l = $p.find( "li" ).length,
                    p_height = $p.height(),
                    p_top = $p.data( "top" ) || 0;
                if ( this.className.indexOf( "prev" ) > -1 ) {
                    p_top = p_top - 30;
                    if ( p_top < 0 ) {
                        p_top = 0;
                    }
                } else {
                    p_top = p_top + 30;
                    if ( p_top > ul_l * 30 - p_height + 32 ) {
                        p_top = ul_l * 30 - p_height + 32;
                    }
                }
                $p.data( "top", p_top ).find( "ul" ).css({
                    top: 0 - p_top + 16,
                    height: ul_l * 30
                });
                
            });
        if(pageConfig.data.serverStyle === "2" && pageConfig.data.tplStyle === ""){
            that.tabSys.init();
        }
    },

    tabSys:{
        $wrap:null,
        $listWrap:null,
        tabWidth:169,
        tabCount:0,
        maxNum:4,
        init:function(){
            this.$wrap = $("#serverTabTitle");
            this.$listWrap = this.$wrap.find(".tab-title-list");
            var $titles = this.$listWrap.children();
            this.tabCount = $titles.length;
            this.tabWidth = $titles.eq(0).width();
            //hack ie6,7
            //this.tabWidth += isIE7 ? 3 : isIE6 ? 4 : 0;
            this.events();
            this.initBtns();
        },
        /**
         * 绑定事件
         */
        events:function(){
            var that = server, _this = this;
            that.tabSys.$wrap.on( "click.tab-title-list", ".tab-title-list a", function( event ) {
                event.preventDefault();
                var type = this.getAttribute( "data-tab" );
                if ( this.className.indexOf( "focus" ) > -1 || this.className.indexOf( "pending" ) > -1 ) {
                    return;
                }
                _this.$listWrap.find( "a.focus" ).removeClass( "focus" );
                $( this ).addClass( "focus" );
                that.tabChange( type );
                if ( +type > 3 ) {
                    $("#panel-" + type + "-1").find("a").show();
                }
            }).on("click","a.s-btn-left",function(event){
                event.preventDefault();
                _this.toLeft();
            }).on("click","a.s-btn-right",function(event){
                event.preventDefault();
                _this.toRight();
            });
        },
        /**
         * 向左滑
         */
        toLeft:function(){
            var left = this.getMarginLeft();
            if(this.isMostLeft(left)){
                return;
            }
            this.setPosition(left - this.tabWidth);
        },
        /**
         * 向右滑
         */
        toRight:function(){
            var left = this.getMarginLeft();
            if(this.isMostRight(left)){
                return;
            }
            this.setPosition(left + this.tabWidth);
        },

        /**
         * 是否已滑动到最左侧
         */
        isMostLeft:function(left){
            return left < 1;
        },

        /**
         * 是否已滑动到最右侧
         */
        isMostRight:function(left){
            return left >= this.tabWidth * (this.tabCount - 4);
        },
        /**
         * 获取marginLeft值
         * @returns {number}
         */
        getMarginLeft:function(){
            return Math.abs(+this.$listWrap.css("margin-left").replace("px",""));
        },
        /**
         * 设置marginLeft
         * @param left
         */
        setPosition:function(left){
            this.resetBtnStatus(left);
            //this.$listWrap.css("marginLeft", -1*left + "px");
            this.$listWrap.animate({marginLeft:-1*left + "px"});
        },
        /**
         * 初始化按钮，是否显示
         */
        initBtns:function(){
            if(this.tabCount > this.maxNum){
                this.$wrap.find("a.s-btn-right").css({"display":"block"});
            }
            //this.$wrap.find("a.s-btn-left").css({"display":"block"});
        },

        /**
         * 设置向左向右滑按钮的显示状态
         */
        resetBtnStatus:function(left){
            var isLeft = this.isMostLeft(left),
                isRight = this.isMostRight(left),
                $left = this.$wrap.children("a.s-btn-left"),
                $right = this.$wrap.find("a.s-btn-right");
            isLeft ? $left.hide() : $left.show();
            isRight ? $right.hide() : $right.show();
        }
    },

    /**
     * 获取用户上次玩过的游戏数据
     */
    getUserHis: function() {
        var that = this;
        Box.User.getGameHistory(server.gameId, function( res ){
            var h = res["HISTORY_HOT_GAMESERVER"],
                list = [],
                hotList = [];
            Box.User.info = res;
            if ( h && h[0] ) {
                //server.gameName = h[0]["GAME_NAME"];
                //server.gameKey = h[0]["GAME_KEY"];
                for (var i = 0; i < h.length; i++ ) {
                    if ( h[i].HOTSORT == 0 && h[i].STATE == 2 ) {
                        list.push( that.getServerA( h[i], "SERVER_NAME" ) );
                    } else {
                        hotList.push( that.getServerA( h[i], "SERVER_NAME" ) );
                    }
                }
                if ( list.length > 0 ) {
                    that.hisDiv.html( list.join("") );
                } else {
                    $( "#server-top" ).html( "推荐服务器" );
                    that.hisDiv.html( hotList.join("") );
                }

                that.hisList = list;
            }
            that.getServerData();
        });
    },

    /**
     * 获取默认服类型的游戏服数据
     */
    getServerData: function() {
        var that = this;
        if ( this.gameSetting["serverStyle"] == "2" ) {
            $.ajax({
                url: this.serverAreaListUrl.replace( "{$gameid}", server.gameId ).replace( "{$serverType}", this.defaultServerType ).replace( "{$page}", 1 ),
                dataType: "jsonp",
                jsonpCallback: "game_server_callback_" + server.gameId
            }).done(function( res ) {
                var data = res,
                    hotList = [],
                    allList = [],
                    titleCache = [],
                    serverData = null,
                    pageSize = +data.pagesize,
                    i = 0,
                    j = totalPage = +data.taotalpage;

                for(var p in data.newest_server_type_list){
                    if(data.newest_server_type_list.hasOwnProperty(p) && +p === that.defaultServerType){
                        serverData = data.newest_server_type_list[p];
                        that.newestServerType = p;
                        break;
                    }
                }

                //快速进入服设置
                that.newestServer = data.newest_server_type_list;
                //that.newestServer = dts.setNewestData(that.newestServer);
                if(!serverData){
                    that.totalServer = 0;
                }else{
                    that.totalServer = parseInt(serverData.SERVER_TYPE,10) === 2 ? (serverData["SID"] - that.gameSetting.serverSub) : serverData["SID"];
                }
                $( "#server-fastin" ).val( that.totalServer);

                //没有上次进入游戏，则添加最新推荐
                if( !that.hisList || !that.hisList.length ) {
                    $( "#server-top" ).html( "推荐服务器" );
                    for ( var v = 0; v < data.newest_server_list.length; v++ ) {
                        var l = data.newest_server_list[ v ];
                        if( hotList.length < 3 ) {
                            hotList.push( that.getServerA( l, "SERVER_NAME" ) );
                        }
                    }
                    that.hisDiv.html( hotList.length > 0 ? hotList.join( "" ) : that.state.empty2);
                }
                //处理左侧分页
                for ( j; j > 0; j-- ) {
                    i ++;
                    start = ( j - 1 ) * pageSize + 1;
                    end = j * pageSize;
                    titleCache.push(
                        that.t.replace( "{num}", start + "-" + end + "服" )
                            .replace( "{focus}", i === 1 ? "class='focus'" : "" )
                            .replace( "{page}", i.toString() )
                            .replace( "{type}", "1" )
                            .replace( "{tab}", "li" )
                    );
                }
                that.allDiv.append( that.t_ul.replace( "{type}", "1").replace( "{content}", titleCache.join("") ));
                that.allDiv.append( that.t_ul.replace( "{type}", "2").replace( "{content}", that.t
                    .replace( "{num}", that.getTestServerName() )
                    .replace( "{focus}", 'class="focus"' )
                    .replace( "{page}", "1" )
                    .replace( "{type}", "2" )
                    .replace( "{tab}", "li" ))
                );

                for ( var v = 0; v < data.server_list.length; v++ ) {
                    var l = data.server_list[ v ];
                    allList.push( that.getServerA( l, "SERVER_NAME" ) );
                }

                if(allList.length > 0){
                    that.panDiv.append( that.p.replace( "{content}", allList.join("") ).replace( "{type}", that.defaultServerType ).replace( "{id}", 1 ) );
                }else{
                    that.panDiv.append( that.p.replace( "{content}", that.state.empty ).replace( "{type}", that.defaultServerType ).replace( "{id}", 1 ) );
                }

                that.isLoadingCache[ that.defaultServerType + "-1" ] = true;
                if(serverData && !that.gameSetting.serverType ){
                    that.tabChange( serverData.SERVER_TYPE, "1" );
                }else{
                    that.tabChange( that.defaultServerType, "1" );
                }
				//that.serverDataObj = res;
                that.fastinDefaultData();
            }).fail(function() {
                that.panDiv.html( '<div class="focus" id="reload">网络堵塞，请刷新</div>' );
            }).always(function(){
                that.setSize();
            });
        } else {
            $.ajax({
                url: Box.serverListUrl.replace("{gameid}",server.gameId),
                type: 'GET',
                dataType: 'jsonp',
                jsonpCallback:"game_server_callback_"+server.gameId
            }).done(function(res) {
                var hottest = 0,
                    hotList = [],
                    allList = [],
                    fastInData = null,
                    defaultServerType = +$("#server-type").val();
                that.totalServer = res.msg;
                that.serverData = res.data;

                for ( var v = 0; v < res.data.length; v++ ) {
                    var l = res.data[ v ];
                    if ( l["STATE"] == 2 && hottest < 1) {
                        $( "#server-fastin" ).val( res.data[ v ].SID - that.gameSetting.serverSub );
                        hottest++;
                    }
                    if( hotList.length < 3 ) {
                        hotList.push( that.getServerA( l, "SERVER_NAME" ) );
                    }
                    allList.push( that.getServerA( l, "SERVER_NAME" ) );
                }
                if((!that.hisList || !that.hisList.length) && hotList.length === 0){
                    that.hisDiv.html( that.state.empty2 );
                }else if( !that.hisList || !that.hisList.length ) {
                    $( "#server-top" ).html( "推荐服务器：" );
                    that.hisDiv.html( hotList.join( "" ));
                }
                if ( server.gameId == "192" ) {
                    var qjllUrl = Box.a.replace( /{name\}/g, "白羊10服 大天使专属" )
                        /*.replace( "{state}", "1" )
                        .replace( "{url}", "javascript:;" )
                        .replace( "{gameName}", "data-gamename='" + server.gameName + "'" )
                        .replace( "{classState}", "btn-r" + ( that.gameSetting.isBigBtn ? " btn-b" : "" ))
                        .replace( "{date}", "data-date='2015-11-12 10:00'" );*/
                        .replace( "{state}", "2" )
                        .replace( "{url}", that.gameUrl
                            .replace( /{gameid\}/g, "237" )
                            .replace( /{sid\}/g, "30140" )
                            .replace( "{gamename}", encodeURIComponent( "大天使之剑" ))
                            .replace( "{gamekey}", "dts" )
                            .replace( "{login_account}", Box.User.info ? Box.User.info.LOGIN_ACCOUNT : "" )
                            .replace( "{server_name}", encodeURIComponent( "白羊10服 大天使专属" ))
                            .replace( "{error_url}", "" ) )
                        .replace( "{gameName}", "" )
                        .replace( "{classState}", ( that.gameSetting.isBigBtn ? " btn-b" : "" ))
                        .replace( "{date}", "" );
                    $( "#server-top" ).html( "推荐服务器：" );
                    hotList.splice( 0, 3, qjllUrl );
                    that.hisDiv.html( hotList.join( "" ));
                    allList.splice( 0, 0, qjllUrl );
                }
                if(allList.length > 0){
                    that.allDiv.html( allList.join( "" ));
                }else{
                    that.allDiv.html(that.state.empty);
                }
            })
            .fail(function() {
                that.allDiv.html( '<a class="focus" id="reload">网络堵塞，请刷新</a>' );
            }).always(function(){
                that.setSize();
            });
        }
    },

    /**
     * 获取测试服名
     */
    getTestServerName:function(){
        var title = $("ul.server-tab").find("a[data-tab=2]").html();
        if(!title || title === "不删档"){
            return "不删档服";
        }else{
            return title.substr(0,6);
        }
    },

    /**
     * 重置页面尺寸
     */
    setSize: function() {
        var h = $(window).height(),
            j = 0;
        if ( this.gameSetting["serverStyle"] == "2" ) {
            h -= 428;
            if( h < 191 ){
                h = 191;            //最小高度619
            } else if( h > 714 ) {
                h = 782;            //最大高度1200
            }
            this.allDiv.height( h );
            $( ".server-list-title" ).height( h - 2 ).each( function() {
                var $this = $( this ),
                    li = $this.find( "li" ).length,
                    p_top = $this.data( "top" ) || 0;
                if ( li * 30 > h ) {
                    $this.find( "ul" ).css({
                        top: 0 - p_top + 16
                    }).end().find( "div" ).show();
                } else {
                    $this.find( "ul" ).css({
                        top: 0
                    }).end().find( "div" ).hide();
                }
            });
            this.panDiv.height( h ).niceScroll({
                horizrailenabled: false,
                autohidemode: false,
                cursorcolor: this.cursorcolor,
                cursorwidth: "10px",
                cursorborder: "none"
            });
            if ( this.gameSetting["tplStyle"] === "1" ) {
                j = 313;
            }
        } else {
            h -= 486;
            if( h < 133 ){
                h = 133;            //最小高度619
            } else if( h > 714 ) {
                h = 714;            //最大高度1200
            }
            this.allDiv.height( h ).niceScroll({
                horizrailenabled: false,
                autohidemode: false,
                cursorcolor: "#d5e2f0"
            });
        }
        $( ".bg" ).height( $( ".main" ).height() - j );
    },

    setScroll: function() {
        var h = $(window).height(),
            d = this.allDiv.data( "hData" );
        h -= 428;
        h = h + (d ? 1 : -1);
        this.allDiv.height( h ).data( "hData", d ? "" : "1" );
        this.panDiv.height( h ).niceScroll({
            horizrailenabled: false,
            autohidemode: false,
            cursorcolor: "#6e614a",
            cursorwidth: "10px",
            cursorborder: "none"
        });
    },

    /**
     * 处理服列表的按钮
     * @param l {json} 服的数据
     * @param nameKey {string} 服名的key
     * @returns {string} 服链接
     */
    getServerA: function( l, nameKey ) {
        nameKey = nameKey || "SERVER_NAME";
        var dataArea = "",
            dataPArea = "";
        if ( +l.SERVER_TYPE > 3 ) {
            if ( +l.SERVER_TYPE > 4 ) {
                dataArea = " data-area='" + l.SERVER_NAME_ID + "'";
            } else {
                dataArea = " data-area='" + l.AREA_ID + "'";
            }
            dataPArea = " data-parea='" + l.PARENT_ID + "'";
        }
        return Box.a.replace( /{name\}/g, nameKey === "SERVER_NAME" ? (l.C_NAME ? l[ nameKey ] + "（" + l.C_NAME + "）" : l[ nameKey ]) : l[ nameKey ] )
            .replace( "{state}", l["STATE"] )
            .replace( "{url}", l["STATE"] == "2" ? this.getServerUrl( l.SID, l[ nameKey ] ) : "javascript:;" )
            .replace( "{gameName}", l["STATE"] == "1" ? "data-gamename='" + (server.gameName || "") + "'" : "" )
            .replace( "{classState}", ( l["STATE"] == "1" ? "btn-r" : "" ) + ( this.gameSetting.isBigBtn ? " btn-b" : "" ))
            .replace( "{date}", ( l["STATE"] == "1" ? "data-date=\"" + (!l["START_TIME"] ? l["SERVER_START_TIME"] : l["START_TIME"]) + "\"" : "" ) + dataArea + dataPArea );
    },

    /**
     * 进入游戏
     * @param sid {int}  服id
     * @param server_name {string}  服名
     * @param login_account {string}  帐号
     * @returns {*}
     */
    enterGame: function( sid, server_name, login_account ) {
        if ( !sid ) {
            return alert( "没有服 id " );
        }
        login_account = login_account || "";
        location.href = this.getServerUrl( sid, server_name, login_account );
    },

    /**
     * 快速进入
     * @param v {int}  输入的服数
     * @param max {int}  最大服
     * @param t {int} 服类型的标识
     * @returns {*}
     */
    fastIn: function( v, max, t ) {
        if ( !v ) {
            return alert( "请输入服数" );
        }
        v = parseInt(v, 10);
        t = parseInt(t, 10);
        if ( v < 1 ) {
            return alert( "输入的服数不正确" );
        }
        var d, a, i, sl,
            serverName = "",
            did = v,
            that = this,
            serverType = parseInt($("#server-type").val(),10);
        if ( serverType === 4 && server.area[ t ] ) {
            a = server.area[ t ];
            v = "";
            for ( i = 0; i < a.length; i++ ) {
                if ( did == a[i].DID ) {
                    v = a[i].SID;
                    break;
                }
            }
        } else if( serverType > 4 && that.exServerData[ serverType ] && (t in that.exServerData[ serverType ]) ) {
            a = that.exServerData[ serverType ][ t ];
            v = "";
            for ( i = 0; i < a.length; i++ ) {
                if ( did == a[i].SHOW_SID ) {
                    v = a[i].SID;
                    break;
                }
            }
        } else {
            v = v + t;
        }
        if ( !v ) {
            return alert( "您输入的服数不存在^o^" );
        }
        if ( this.gameSetting["serverStyle"] == "2" ) {
            if (!this.newestServer[ serverType ]){
                return alert("这类型的服还没有开启！");
            }
            max = +this.newestServer[ serverType ][ "SID" ];
            if ( max && (+v > max) ) {
                return alert( "服数超上限了^o^" );
            }
            $.ajax({
                url: this.serverFastinUrl.replace( "{$gameid}", server.gameId ).replace( "{$sid}", v ),
                dataType: "jsonp"//,
                // jsonpCallback: "game_server_name"
            }).done(function( res ) {
                var serverName = res["SERVER_NAME"];
                if( "SID" in res && !res.SID){
                    alert( "您输入的服数不存在^o^" );
                    return;
                }
                if ( res["STATE"] == "3" ) {
                    alert( that.state["3"] );
                } else {
                    that.enterGame( v, serverName, "" );
                }
            });
        } else {
            d = this.serverData;
            for ( i = 0; i < d.length; i++ ) {
                if ( v == d[i].SID ) {
                    serverName = d[i].SERVER_NAME || d[i].NAME;
                    sl = i;
                    break;
                }
            }
            if ( !serverName ) {
                return alert( "您输入的服数不存在^o^" );
            }
            if ( d[sl].STATE !== "2" ) {
                this.stateAlert( d[sl].STATE, server.gameName, serverName, (d[sl].START_TIME || d[sl].SERVER_START_TIME) );
                return;
            }
            this.enterGame( v, serverName, "" );
        }
    },

    /**
     * 服务器状态提示弹窗
     * @param type  状态值, "1" "2" "3" 期待、正常、维护
     * @param gameName  // 游戏名称，比如三国情缘
     * @param server    // 服名称
     * @param date      // 日期，什么时候开服
     */
    stateAlert: function( type, gameName, server, date ) {
        var dom;
        if ( type.nodeName ) {
            dom = type;
            type = dom.getAttribute( "data-state" );
            server = dom.title;
            date = dom.getAttribute( "data-date" ) || "近期";
        }

        if ( type == "3" ) {
            alert( this.state["3"] );
        }

        if ( type == "1" ) {
            alert( this.state["1"].replace( "{name}", gameName ).replace( "{server}", server ).replace( "{date}", date ) );
        }
    },
    gameUrl: "http://gameapp.37.com/controller/enter_game.php?game_id={gameid}&sid={sid}&showlogintype=4&wd_entergame=1&wd_NAME={gamename}&wd_GAME_KEY={gamekey}&wd_SID={sid}&wd_GAME_ID={gameid}&wd_username={login_account}&wd_SNAME={server_name}&error_url={error_url}",  // 进入游戏链接

    /**
     * 处理服务器的地址
     * @param sid {int} 服id
     * @param server_name {string} 服名
     * @param login_account {string} 帐号
     * @returns {*} 服务器的地址
     */
    getServerUrl: function( sid, server_name, login_account ) {
        if ( !sid ) {
            return alert( "没有服 id " );
        }
        login_account = login_account || Box.User.info ? Box.User.info.LOGIN_ACCOUNT : "";
        return this.gameUrl
            .replace( /{gameid\}/g, server.gameId )
            .replace( /{sid\}/g, sid )
            .replace( "{gamename}", encodeURIComponent( server.gameName ))
            .replace( "{gamekey}", server.gameKey )
            .replace( "{login_account}", login_account )
            .replace( "{server_name}", encodeURIComponent( server_name ))
            .replace( "{error_url}", "" );
    },

    exServerData: {},
    exServerOptions: {
        5: {
            parent: 0,
            w: "216px"
        }
    },
    /**
     * 获取扩展服的数据
     */
    exServer: function() {
        var that = this,
            list = this.gameSetting.serverTypeList,
            i = 0,
            l;
        that.tabUl.find( "a" ).removeClass( "focus" ).filter( "a[data-tab=" + that.defaultServerType + "]" ).addClass( "focus" );
        
        if ( list && list.length > 0 ) {
            l = list.length;
            if ( SQ.DQServer ) {
                for( i; i < l; i++ ) {
                    if ( !list[i].server_type || list[i].server_type < 4 ) {
                        continue;
                    }
                    if ( list[i].server_type === 4 ) {
                        that.dqServer();
                        continue;
                    }
                    that.getExServer( list[i].server_type, that.exServerOptions[ list[i].server_type ] );
                }
            }
        }
    },

    /**
     * 处理扩展服的数据
     */
    getExServer: function( server_type, option ) {
        var that = this,
            ex = SQ.DQServer.pullExConfig( server.gameId, server_type );
        option = option || {};
        ex.done( function( res ) {
            var exArray = SQ.DQServer.getExConfig( res, $.extend( true, {}, option, {
                    serverType: server_type
                })),
                pat,
                titleExCache = [],
                expage = 0,
                $tDiv;
            that.exServerData[ server_type ] = exArray.server;
            $( "#option-dom-" + server_type ).html( exArray.html ).css({
                "width": option.w || "108px"
            });
            if ( option.parent === 1 ) {
                pat = exArray.parent_title;
                for ( var pt in pat ) {
                    expage++;
                    titleExCache.push(
                        that.t.replace( "{num}", pat[pt].SERVER_NAME + "区" )
                            .replace( "{focus}", "" )
                            .replace( "{page}", pat[pt].SERVER_NAME_PARENT_ID )
                            .replace( "{type}", server_type )
                            .replace( "{tab}", "li" )
                    );
                }
            } else {
                pat = exArray.server_title;
                for ( var pt in pat ) {
                    expage++;
                    titleExCache.push(
                        that.t.replace( "{num}", pat[pt].name + "服" )
                            .replace( "{focus}", "" )
                            .replace( "{page}", pat[pt].name_id )
                            .replace( "{type}", server_type )
                            .replace( "{tab}", "li" )
                    );
                }
            }
            $tDiv = $(that.t_ul.replace( "{type}", server_type ).replace( "{content}", titleExCache.join("") ));
            that.allDiv.append( $tDiv );
            that.tDivSize( $tDiv );
            //左侧栏偶尔不显示的bug。(当getServerData中的ajax加载完，而getExServer中的ajax未加载完成时，则会出现此bug)
            if(server_type === that.defaultServerType){
                $tDiv.show();
            }
        });
    },

    /**
     * 设置快速进入默认的服数
     */
    fastinDefaultData: function() {
        var that = this,
            $n, opt, type, a, did,
            newestServer,
            fastinVal = "",
            defaultType = 1;    //没设置用最新服的

        /*if(that.hasStarServer() === false){
            return;
        }*/
        defaultType = that.newestServerType || defaultType;
        $( "#st-select-con" ).html( $( "#st-option-dom" ).find( "[data-type=" + defaultType + "]").html() );
        $n = $( "#option-dom-" + defaultType ).show().find( "li" ).eq(0);
        opt = $n.attr( "data-opt" );
        type = $n.attr( "data-type" );
        $( "#server-begin-num" ).val( opt );
        $( "#server-type" ).val( type );
        $( "#ct-select-con" ).html( $n.html() );
        newestServer = that.newestServer[ defaultType ];
        did = newestServer[ "SID" ];
        if ( defaultType === "4" ) {// && server.area[ opt ]
            $("#option-dom-4").find("li[data-opt="+newestServer.AREA_ID+"]").trigger("click");
            try{
                a = server.area[ newestServer.AREA_ID ];
            }catch(e){
                a = [];
            }
            for (var i = 0; i < a.length; i++ ) {
                if ( did == a[i].SID ) {
                    fastinVal = a[i].DID;
                    break;
                }
            }
        } else if( +defaultType >= 5 ) {// && that.exServerData[ defaultType ][ opt ]
            try{
                //$("#option-dom-"+defaultType).find("li[data-opt="+newestServer.SERVER_NAME_ID+"]").trigger("click");
                a = that.exServerData[ defaultType ][ newestServer.SERVER_NAME_ID ];
            }catch(e){
                a = [];
            }
            for (var i = 0; i < a.length; i++ ) {
                if ( did == a[i].SID ) {
                    fastinVal = a[i].SHOW_SID;
                    break;
                }
            }
        }/*else if( defaultType === "1" ){
            a = that.serverDataObj.server_list;
            //针对大天使之剑做了特殊处理，让快速选服显示正确的双线服
            if(that.gameId === "237"){
                for(var p in a){
                    if(a.hasOwnProperty(p) && a[p].SERVER_TYPE === newestServer.SERVER_TYPE && a[p].SERVER_NAME_ID === dts.SERVER_NAME_ID_1){
                        fastinVal = a[p].SID;
                        break;
                    }
                }
            }else{
                //正常的处理逻辑
                for (var i = 0; i < a.length; i++ ) {
                    if ( did == a[i].SID && newestServer.SERVER_NAME_ID === a[i].SERVER_NAME_ID) {
                        fastinVal = a[i].SID;
                        break;
                    }
                }
            }
        }*/else {
            fastinVal = did - that.getServerBeginNum(defaultType);
        }
        $( "#server-fastin" ).val( fastinVal );
    },

    /**
     * 获取服类型对应的偏移量
     * @param defaultType
     * @returns {*}
     */
    getServerBeginNum:function(defaultType){
        var typeList = pageConfig.data.serverTypeList;
        defaultType = parseInt(defaultType, 10);
        for(var i=0;i<typeList.length;i++){
            if(typeList[i].server_type === defaultType){
                return typeList[i].server_begin_num;
            }
        }
    },

    hasStarServer:function(){
        var serverTypeList = pageConfig.data.serverTypeList,
            hasStarServer = false;
        for(var i= 0,len = serverTypeList.length;i<len;i++){
            if(serverTypeList[i].server_type >2){
                hasStarServer = true;
                break;
            }
        }
        return hasStarServer;
    },

    /**
     * 获取地区服的数据
     */
    dqServer: function() {
        var that = this;
        new SQ.DQServer({
            parent_area: 1
        });
        var dq = SQ.DQServer.pullConfig( server.gameId );

        dq.done( function( res ) {
            var dqArray = SQ.DQServer.getConfig( res ),
                pat = dqArray.parent_area_title,
                titleDqCache = [],
                dqpage = 0,
                $tDiv;

            server.area = dqArray.server;
            if ( that.hasStarServer() ) {
                $( "#option-dom-4" ).html( dqArray.html ).css({
                    "width": "432px"
                });
            } else {
                $( "#option-dom" ).append( dqArray.html ).css({
                    "width": "432px"
                });
            }

            /*titleDqCache.push(
                that.t.replace( "{num}", "推荐服" )
                    .replace( "{focus}", 'class="focus"' )
                    .replace( "{page}", "1" )
                    .replace( "{type}", "4" )
                    .replace( "{tab}", "li" )
            );*/
            if ( !$.isEmptyObject( pat ) ) {
                for ( var pt in pat ) {
                    dqpage++;
                    titleDqCache.push(
                        that.t.replace( "{num}", pat[pt].name + "区" )
                            .replace( "{focus}", "" )
                            .replace( "{page}", pat[pt].id )
                            .replace( "{type}", "4" )
                            .replace( "{tab}", "li" )
                    );
                }
            }
            $tDiv = $(that.t_ul.replace( "{type}", "4" ).replace( "{content}", titleDqCache.join("") ));
            that.allDiv.append( $tDiv );
            that.tDivSize( $tDiv );
        });
    },

    tDivSize: function( $tDiv ) {
        $tDiv.find( "ul" ).css({
            top: 16
        });
        var h = $(window).height(),
            li = $tDiv.find( "li" ).length,
            p_top = $tDiv.data( "top" ) || 0;
        h -= 428;
        if( h < 191 ){
            h = 191;            //最小高度619
        } else if( h > 714 ) {
            h = 782;            //最大高度1200
        }
        if ( li * 30 > h ) {
            $tDiv.find( "ul" ).css({
                top: 0 - p_top + 16
            }).end().find( "div" ).show();
        } else {
            $tDiv.find( "ul" ).css({
                top: 0
            }).end().find( "div" ).hide();
        }
    },

    tabChange: function( type, page ) {
        var $titleList = $( ".server-list-title" );
            $onTitleList = $( "#server-list-title-" + type ),
            page = page || 1;
        $titleList.hide();
        $onTitleList.show();
        this.panelChange( type, page );
    },

    panelChange: function( type, page, $title ) {
        var cut = type + "-" + page,
            $onTitleList = $( "#server-list-title-" + type );
        if ( this.isLoadingCache[ cut ] ) {
            this.panDiv.find( "div.server-list-panel" )
                .filter( "#panel-" + this.focus ).hide()
                .end()
                .filter( "#panel-" + cut ).show();

            $onTitleList.show().find( "a" ).removeClass( "focus" )
                .end()
                .find( "a[data-page=" + page + "]" ).addClass( "focus" );

            this.focus = cut;
        } else {
            this.getServerPage( type, page, $onTitleList.find( "a" ).find( "a[data-page=" + page + "]" ) );
        }
    },
    getServerPage: function( type, page, $title ) {
        var that = this,
            $panel = $("#panel-"+type+"-"+page);
        $title.addClass( "pending" ).data( "text", $title.text() ).text( "加载中..." );
        if($panel.length === 0){
            that.panDiv.append( that.p.replace( "{content}", '<span class="white">加载中...</span>' ).replace( "{type}", type ).replace( "{id}", page ) );
            $panel = $("#panel-"+type+"-"+page);
            that.isLoadingCache[ type + "-" + page ] = true;
            that.panelChange( type, page );
        }
        $.ajax({
            url: this.serverAreaListUrl.replace( "{$gameid}", server.gameId ).replace( "{$serverType}", type ).replace( "{$page}", page ),
            dataType: "jsonp",
            timeout: 10000,
            jsonpCallback: "game_server_callback_" + server.gameId
        }).done(function( res ) {
            var data = res,
                allList = [];

            for ( var v = 0; v < data.server_list.length; v++ ) {
                var l = data.server_list[ v ];
                allList.push( that.getServerA( l, "SERVER_NAME" ) );
            }

            $title.removeClass( "pending" ).text( $title.data("text") );
            /*if(allList.length > 0){
                that.panDiv.append( that.p.replace( "{content}", allList.join("") ).replace( "{type}", type ).replace( "{id}", page ) );
            }else{
                that.panDiv.append( that.p.replace( "{content}", that.state.empty ).replace( "{type}", type ).replace( "{id}", page ) );
            }*/
            $panel.html(allList.length > 0 ? allList.join("") : that.state.empty);
        }).fail(function() {
            //that.panDiv.html( '<div class="focus" id="reload">网络堵塞，请刷新</div>' );
            $panel.html('<span class="white">网络异常或该类别服务器未开启，刷新重试或留意游戏公告</span>');
        }).always(function(){
            that.setSize();
        });
    }
}

var news = {
    init: function( d ) {
        this.config = d || {};
        this.gameId = d.gameid;
        this.url = "http://ptres.37.com/content/cache/gonggao/g_" + this.gameId + ".js";
        this.parse();
    },
    /**
     * 获取新闻
     */
    parse: function() {
        var that = this;
        $.ajax({
            url : this.url,
            dataType : "jsonp",
            jsonpCallback: "content_callback_gonggao_g_" + this.gameId
        }).done(function( res ) {
            if( !res || !res.code ) return;
            var html = [],
                data = res.data,
                i = 0,
                t_html = "",
                l = that.config.len || data.length;

            for( ; i < l; i++ ){
                if ( that.config.isShowDate && i != 0 ) {
                    t_html = "<span class='news-date'>[{date}]</span>".replace( "{date}", data[ i ].stime );
                }
                html.push( ("<li class='news-li{newsClass}'>{t_html}<a href='" + data[ i ].url + "' target='_blank'>" + data[ i ].title + "</a></li>").replace( "{newsClass}", i == 0 ? " news-li-first" : "" ).replace( "{t_html}", t_html ));
            }
            $( "#news" ).html( html.join( "" ));
        });
    }
}

$win.resize(function(){
    server.setSize();
});
$doc.ready(function($) {
	server.init(pageConfig.gameid,pageConfig.data);
	news.init({
        isShowDate: 1,
        gameid:pageConfig.gameid
    });
});


});