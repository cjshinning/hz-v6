require([
        "box",
        "client",
        "SQ.ServerSelect",
        "SQ.ServerData",
        "sq.tab",
        "jQuery.nicescroll"
    ],
    function(Box, client, ServerSelect) {

        var $doc = $(document),
            $win = $(window),
            select = null;

        /**
         * 新闻处理类
         * @type {{init: Function, parse: Function}}
         */
        var news = {
            init: function(d) {
                this.config = d || {};
                this.gameId = d.gameid;
                this.url = "http://ptres.37.com/content/cache/gonggao/g_" + this.gameId + ".js";
                this.parse();

                $("#server-kv").length > 0 && SQ.Tab && new SQ.Tab({
                    tabs: "#server-kv .server-kv-nav:first a",
                    panels: "#server-kv .server-kv-panel",
                    auto: true
                });
                $(".news-tab").length > 0 && SQ.Tab && new SQ.Tab({
                    tabs: ".news-tab-li",
                    panels: ".news"
                });
            },
            /**
             * 获取新闻
             */
            parse: function() {
                var that = this;
                $.ajax({
                    url: this.url,
                    dataType: "jsonp",
                    jsonpCallback: "content_callback_gonggao_g_" + this.gameId
                }).done(function(res) {
                    if (!res || !res.code) return;
                    var html = [],
                        data = res.data,
                        i = 0,
                        t_html = "",
                        l = that.config.len || data.length;

                    for (; i < l; i++) {
                        if (that.config.isShowDate && i != 0) {
                            t_html = "<span class='news-date'>[{date}]</span>".replace("{date}", data[i].stime);
                        }
                        html.push(("<li class='news-li{newsClass}'>{t_html}<a href='" + data[i].url + "' target='_blank'>" + data[i].title + "</a></li>").replace("{newsClass}", i == 0 ? " news-li-first" : "").replace("{t_html}", t_html));
                    }
                    $("#news").html(html.join(""));
                });
            }
        };

        /**
         * 控制服类型tab左右滚动的类，目前这个功能只用在黑色模板
         * @type {{$wrap: null, $listWrap: null, tabWidth: number, tabCount: number, maxNum: number, init: Function, events: Function, toLeft: Function, toRight: Function, isMostLeft: Function, isMostRight: Function, getMarginLeft: Function, setPosition: Function, initBtns: Function, resetBtnStatus: Function}}
         */
        var tabSys = {
            $wrap: null,
            $listWrap: null,
            tabWidth: 166,
            tabCount: 0,
            maxNum: 4,
            init: function() {
                var $titles = null,
                    $tabTitleList = $('.tab-title-list');

                this.$wrap = $("#serverTabTitle");
                this.$listWrap = this.$wrap.find(".tab-title-list");
                $titles = this.$listWrap.children();
                this.tabCount = $titles.length;
                this.tabWidth = $titles.eq(0).width();

                $tabTitleList.width(this.tabWidth * this.tabCount + 40);
                //hack ie6,7
                //this.tabWidth += isIE7 ? 3 : isIE6 ? 4 : 0;
                this.events();
                this.initBtns();
            },
            /**
             * 绑定事件
             */
            events: function() {
                var that = server,
                    _this = this;
                _this.$wrap.on("click.tab-title-list", ".tab-title-list a", function(event) {
                    event.preventDefault();
                    var type = this.getAttribute("data-tab");
                    if (this.className.indexOf("focus") > -1 || this.className.indexOf("pending") > -1) {
                        return;
                    }
                    _this.$listWrap.find("a.focus").removeClass("focus");
                    $(this).addClass("focus");
                    //that.tabChange( type );
                    if (+type > 3) {
                        $("#panel-" + type + "-1").find("a").show();
                    }
                }).on("click", "a.s-btn-left", function(event) {
                    event.preventDefault();
                    _this.toLeft();
                }).on("click", "a.s-btn-right", function(event) {
                    event.preventDefault();
                    _this.toRight();
                });
            },
            /**
             * 向左滑
             */
            toLeft: function() {
                var left = this.getMarginLeft();
                if (this.isMostLeft(left)) {
                    return;
                }
                if ($("body").hasClass('tpl-0')) {
                    this.setPosition(left - this.tabWidth);
                } else {
                    this.setPosition(left - this.tabWidth-2);
                }
            },
            /**
             * 向右滑
             */
            toRight: function() {
                var left = this.getMarginLeft();
                if (this.isMostRight(left)) {
                    return;
                }
                if ($("body").hasClass('tpl-0')) {
                    this.setPosition(left + this.tabWidth);
                } else {
                    this.setPosition(left + this.tabWidth + 2);
                }
            },

            /**
             * 是否已滑动到最左侧
             */
            isMostLeft: function(left) {
                return left < 1;
            },

            /**
             * 是否已滑动到最右侧
             */
            isMostRight: function(left) {
                return left >= this.tabWidth * (this.tabCount - 4);
            },
            /**
             * 获取marginLeft值
             * @returns {number}
             */
            getMarginLeft: function() {
                return Math.abs(+this.$listWrap.css("margin-left").replace("px", ""));
            },
            /**
             * 设置marginLeft
             * @param left
             */
            setPosition: function(left) {
                this.resetBtnStatus(left);
                //this.$listWrap.css("marginLeft", -1*left + "px");
                if(!this.$listWrap.is(":animated")){
                    this.$listWrap.animate({ marginLeft: -1 * left + "px" });
                }
            },
            /**
             * 初始化按钮，是否显示
             */
            initBtns: function() {
                if (this.tabCount > this.maxNum) {
                    this.$wrap.find("a.s-btn-right").css({ "display": "block" });
                }
                //this.$wrap.find("a.s-btn-left").css({"display":"block"});
            },

            /**
             * 设置向左向右滑按钮的显示状态
             */
            resetBtnStatus: function(left) {
                var isLeft = this.isMostLeft(left),
                    isRight = this.isMostRight(left),
                    $left = this.$wrap.find("a.s-btn-left"),
                    $right = this.$wrap.find("a.s-btn-right");
                isLeft ? $left.hide() : $left.show();
                isRight ? $right.hide() : $right.show();
            }
        };

        /**
         * 选服页类，主要是对组件中与盒子不一样的地方打补丁
         * @type {{enterUrl: string, tplStyle: {0: string, 2: string, 3: string}, init: Function, initGameUrl: Function, _resetTemplate: Function, setSize: Function, setNiceScroll: Function, fastCallback: Function, showFastNames: Function, resetSub: Function, _renderServers: Function, events: Function, loadMore: Function, showSubSlideBtn: Function, resetScroll: Function}}
         */
        var server = {
            enterUrl: 'http://gameapp.37.com/controller/enter_game.php?game_id={$gameid}&sid={$sid}&showlogintype=4&wd_entergame=1&wd_NAME={$gamename}&wd_GAME_KEY={$gamekey}&wd_SID={$sid}&wd_GAME_ID={$gameid}&wd_username={$login_account}&wd_SNAME={$s_name_encode}&error_url={error_url}&refer=37wanty&uid=&refer=37wanty&uid=',
            tplStyle: {
                "0": "#6e614a",
                "2": "#755f31",
                "3": "#0b445d"
            },
            sTypeCfg: {
                155: { 2: "95k" }
            },
            init: function() {
                this.$allServer = $("#all-server");
                this.$servers = $("#servers");
                this.$typeList = $("#typeList");
                this.$fname1 = $("#fname1");
                this.$fname2 = $("#fname2");
                this.$paging = $("#paging");
                this.$nameList = $("#nameList");
                this.$optFastName = $("#optFastName");
                
                tabSys.init();
                this.fastCallback();
                this.events();
                //this.setSize();
                this.resetSub();
                this.hoverFirstName();
            },
            /**
             * 初始化进游戏的
             * @param userInfo
             */
            initGameUrl: function(userInfo) {
                var tmp = {
                    gameid: pageConfig.gameid,
                    gamename: encodeURIComponent(pageConfig.gameName),
                    gamekey: pageConfig.gameKey,
                    login_account: userInfo.LOGIN_ACCOUNT,
                    error_url: ''
                };
                this._resetTemplate("#tpl-servers", tmp);
            },
            _resetTemplate: function(selector, tmp) {
                var $el = $(selector),
                    html = $el.html();
                html = html.replace("{$gameid}", tmp.gameid)
                    .replace("{$gameid}", tmp.gameid)
                    .replace("{$gamename}", tmp.gamename)
                    .replace("{$gamekey}", tmp.gamekey)
                    .replace("{$login_account}", tmp.login_account)
                    .replace("{error_url}", tmp.error_url);
                $el.html(html);
                this.enterUrl = this.enterUrl.replace("{$gameid}", tmp.gameid)
                    .replace("{$gameid}", tmp.gameid)
                    .replace("{$gamename}", tmp.gamename)
                    .replace("{$gamekey}", tmp.gamekey)
                    .replace("{$login_account}", tmp.login_account)
                    .replace("{error_url}", tmp.error_url);
            },
            /**
             * 重置页面尺寸。主要是页面布局中使用了绝对定位，这里维护很不方便，应该把布局完全交给样式搞定。下次重构，请注意这一点
             */
            setSize: function() {
                var h = $(window).height(),
                    mainHeight = h - 41,
                    j = 0,
                    mt = $(".main").hasClass("rec_and_his") ? 468 : 428;

                h -= mt;
                if (h < 141) {
                    h = 141; //最小高度619
                } else if (h > 714) {
                    h = 782; //最大高度1200
                }
                this.$allServer.height(h);
                this.$servers.height(h);
                $(".server-list-title").height(h - 2).each(function() {
                    var $this = $(this),
                        li = $this.find("li").length,
                        p_top = $this.data("top") || 0;
                    if (li * 30 > h) {
                        $this.find("ul").css({
                            top: 0 - p_top + 16
                        }).end().find("div").show();
                    } else {
                        $this.find("ul").css({
                            top: 0
                        }).end().find("div").hide();
                    }
                });
                this.setNiceScroll();
                if (pageConfig["tplStyle"] === "1") {
                    j = 338; //313
                } else if (pageConfig["tplStyle"] === "2") {
                    j = 25;
                } else if (pageConfig["tplStyle"] === "3") {
                    j = 29;
                }
                $(".main").height(mainHeight);
                $(".bg").height(mainHeight - j);
            },

            /**
             * 设置服列表区滚动条，并根据不同模板，设置滚动条的不同颜色
             */
            setNiceScroll: function() {
                var opt = {
                    horizrailenabled: false,
                    autohidemode: false,
                    cursorwidth: "10px",
                    cursorborder: "none"
                };
                if (this.tplStyle[pageConfig.tplStyle]) {
                    opt.cursorborder = this.tplStyle[pageConfig.tplStyle];
                }
                this.$servers.niceScroll(opt);
            },
            /**
             * 快速进服下拉选择事件回调
             */
            fastCallback: function() {
                var _this = this,
                    fast0;
                if (!('fast0' in select.qeObj)) {
                    return;
                }
                fast0 = select.qeObj['fast0'];
                fast0.bind("changeType", function(s_type) {
                    _this.showFastNames(s_type);
                });
                fast0.bind("changeName", function(s_type) {

                });
                fast0.bind("created", function(s_type) {

                });
            },
            /**
             * 控制快速选服服名的显示
             * @param s_type
             */
            showFastNames: function(s_type) {
                var names = select.dataObj.getNames(s_type);
                if (names.length < 2) {
                    this.$fname1.hide();
                    this.$fname2.hide();
                } else {
                    this.$fname1.show();
                    this.$fname2.show();
                }
            },

            /**
             * 对二级菜单重新设置
             * @param s_name_id
             */
            resetSub: function(s_name_id) {
                var _this = this,
                    $pc = this.$paging.children(),
                    $nc = this.$nameList.children(),
                    pagesize = 0,
                    s_type = 0;
                if ($pc.length < 2 && $nc.length === 1) {
                    this.$nameList.show();
                    $nc.eq(0).addClass("hover");
                } else if ($pc.length > 1 && $nc.length > 1) {
                    pagesize = +$pc.eq(0).data("pagesize");
                    if (pagesize < 1000) {
                        s_type = +$nc.eq(0).data("type");
                        if (!s_name_id) {
                            s_name_id = +$nc.eq(0).data("name");
                        }
                        this._renderServers(s_type, s_name_id);
                    } else {
                        this.$servers.getNiceScroll(0).scrollend(function() {
                            var scroll = _this.$servers.getNiceScroll(0).scroll;
                            if (scroll.y > 150) {
                                _this.loadMore();
                            }
                        });
                    }
                    this.$paging.hide();
                }
            },

            /**
             * 渲染服列表
             * @param s_type
             * @param s_name_id
             * @param page
             * @private
             */
            _renderServers: function(s_type, s_name_id, page) {
                page = page || 1;
                var _this = this,
                    data = select.dataObj.getList(s_type, s_name_id, page),
                    html = $("#tpl-servers").html();
                if ($.isArray(data) && data.length > 0) {
                    html = SQ.T(html, data);
                    this.$servers.html(html);
                } else {
                    select.dataObj.loadServers(s_type, s_name_id, page).done(function(data) {
                        html = SQ.T(html, data);
                        _this.$servers.html(html);
                    }).fail(function() {

                    });
                }
            },
            events: function() {
                var _this = this;
                $doc.on("click.page", ".server-list-title-prev, .server-list-title-next", function(e) {
                    e.preventDefault();

                    var $p = $(this).parent(),
                        ul_l = $p.find("li").length,
                        p_height = $p.height(),
                        p_top = $p.data("top") || 0;
                    if (this.className.indexOf("prev") > -1) {
                        p_top = p_top - 30;
                        if (p_top < 0) {
                            p_top = 0;
                        }
                    } else {
                        p_top = p_top + 30;
                        if (p_top > ul_l * 30 - p_height + 32) {
                            p_top = ul_l * 30 - p_height + 32;
                        }
                    }
                    $p.data("top", p_top).find("ul").css({
                        top: 0 - p_top + 16,
                        height: ul_l * 30
                    });

                });
            },

            /**
             * 加载更多服列表
             */
            loadMore: function() {
                var _this = this,
                    $p = this.$paging.children("li.hover"),
                    s_type = 0,
                    s_name_id = 0,
                    page = 0,
                    pagesize = 0;
                if (!$p || $p.length === 0) {
                    return;
                }
                s_type = +$p.data("type");
                s_name_id = +$p.data("name");
                page = +$p.data("page");
                pagesize = +$p.data("pagesize");
                if (pagesize < 1000) {
                    return;
                }
                if (page < 2 || !s_type || !s_name_id) {
                    return;
                }
                page--;
                select.dataObj.loadServers(s_type, s_name_id, page).done(function(data) {
                    var html = $("#tpl-servers").html();
                    html = SQ.T(html, data);
                    _this.$servers.append(html);
                    $p.removeClass("hover");
                    _this.$paging.children("[data-page=" + page + "]").addClass("hover");
                }).fail(function() {

                });
            },
            /**
             * 控制服名/分页二级菜单的上下箭头的显示
             */
            showSubSlideBtn: function() {
                var totalHeight = this.$allServer.height() - 4,
                    $list = this.$paging.children().length > 1 ? this.$paging : this.$nameList,
                    $li = $list.children(),
                    height = $li.eq(0).outerHeight();
                if ($li.length * height > totalHeight) {
                    this.$allServer.children(".server-list-title").children("div").show();
                    $list.css({ top: '16px' });
                } else {
                    this.$allServer.children(".server-list-title").children("div").hide();
                    $list.css({ top: '0px' });
                }
            },
            /**
             * 重置滚动条
             */
            resetScroll: function() {
                this.$servers.getNiceScroll().resize();
            },
            /**
             * 重置快速进服服名下拉的宽度
             */
            resetFastNameOpt: function() {
                var $chd = this.$optFastName.children(),
                    column = Math.ceil($chd.length / 10),
                    w = $chd.eq(0).outerWidth();
                this.$optFastName.width(w * column);
            },
            /**
             * 让第一个服着色
             */
            hoverFirstName:function(){
                /*var s_type = this.$typeList.children(".focus").data("type");
                if(s_type == 4){
                    return;
                }*/
                this.$nameList.children().eq(0).addClass("hover");
            },
            setTabNameHover:function(s_name_id){
                this.$nameList.children().each(function(){
                    var $el = $(this);
                    if($el.data("name") === s_name_id){
                        $el.addClass("hover");
                    }else{
                        $el.removeClass("hover");
                    }
                });
            }
        }

        $win.resize(function() {
            server.setSize();
        });

        $doc.ready(function($) {
            var gid = pageConfig.gameid,
                gameName = pageConfig.gameName,
                prop = 'prop!',
                $servers = $("#servers");
            var opt = {
                game_id: gid,
                clientTypeNames: {
                    1: "双线服",
                    4: "地区服"
                },
                doms: {
                    showTypeList: true,
                    tabTypeClk: '#typeList a',
                    tabNameClk: '#nameList li',
                    pageClk: '#paging li',
                    //服列表
                    servers: {
                        elem: '#servers',
                        tmp: '#tpl-servers',
                        count: 0
                    },
                    history: {
                        elem: '#history',
                        tmp: '#tpl-servers',
                        count: 3 //显示条数
                    }
                },

                fastDoms: {
                    refreshList: false,
                    fastType: {
                        elem: '#st-select-con',
                        tmp: prop + 's_type_name',
                        elem2: '#fastType2'
                    },
                    fastServer: {
                        elem: '#inpQuickServer',
                        tmp: prop + 'show_sid'
                    },
                    fastSelTypeOptWrap: '#st-option-bg',
                    fastSelTypeOpts: '#st-option-bg li',
                    fastSelName: '#select-dom-xz',
                    fastSelNameOptWrap: '#ct-option-bg',
                    fastSelNameOpts: '#optFastName li',
                    fastBtn: '#btn-fastin'
                }
            },
            fun = function() {
                select.bind("inited", function() {
                    server.init();
                    var typeObj = select.dataObj.getDefaultType();

                    if ($.isEmptyObject(typeObj)) {
                        server.$servers.html('<span class="white">该游戏暂无服务器开启，请留意游戏公告</span>');
                        server.setSize();
                        return;
                    }
                    server.showFastNames(typeObj.s_type);
                    $("#typeList").children("a").eq(0).addClass("focus");


                    server.showSubSlideBtn();

                    var d = select.dataObj.getGameNewest(),
                        count = opt.doms.history.count,
                        tpl = $(opt.doms.history.tmp).html(),
                        $el = $("#recommend"),
                        fn = function( d, s ) {
                            var back = [];
                            $.each( d, function( index, val ) {
                                if( val.state === s ){
                                    back.push( val );
                                }
                            });
                            return back;
                        },
                        htmltpl;
                    d = fn( d, opt.doms.history.showState || 2 );
                    d = d.slice(0,count);
                    $.each(d,function(){
                        this.game_id = gid;
                    });
                    htmltpl = SQ.T(tpl,d);
                    if ($("#history").data("type") === 'rec') {
                        $("#server-top").html("最新推荐：").addClass( "server-lb-rec" );
                        $("#history").html( htmltpl )
                    } else {
                        $(".main").addClass( "rec_and_his" );
                        $("#server-top").html("最近登录：").addClass( "server-lb-his" );
                        $("#server-label-rec").html("最新推荐：").addClass( "server-lb-rec" ).show();
                        $el.html( htmltpl ).show();
                    }
                    server.setSize();

                    select.qeObj['fast0'].bind("changeType", function(s_type) {
                        server.resetFastNameOpt();
                    })
                });
                select.bind("changeTabType", function(s_type) {
                    server.resetSub();
                    server.showSubSlideBtn();
                    server.resetScroll();
                    server.hoverFirstName();
                });
                select.bind("changeTabName", function(s_type, s_name_id) {
                    server.resetScroll();
                    server.resetSub(s_name_id);
                });
                select.bind("changeTabPage", function() {
                    server.resetScroll();
                });
            };
            if (server.sTypeCfg[gid]) {
                opt.clientTypeNames = server.sTypeCfg[gid];
            }

            Box.User.getGameHistory(gid, function(res) {
                server.initGameUrl(res);
                opt.url = {
                    enterGame: server.enterUrl
                };
                select = new SQ.ServerSelect(opt);
                select.userInfo = res;
                fun();
            }, function() {
                server.initGameUrl( {
                    LOGIN_ACCOUNT: ""
                } );
                opt.url = {
                    enterGame: server.enterUrl
                };
                select = new SQ.ServerSelect(opt);
                fun();
            } );

            news.init({
                isShowDate: 1,
                gameid: 237
            });
            if ( $(".p-gamesite-tip16" ).length ) {
                $doc.on("click", ".p-gamesite-tip16", function(e) {
                    e.preventDefault();
                    var gamesiteTip16Content = eval('sq_content_g_' + pageConfig.gameid + '_gamesite_fcm_content_tips').content;
                    new SQ.Dialog({
                        title: '适龄提示',
                        height: 480,
                        classStyle: 'gamesite-tip16-dialog',
                        content: gamesiteTip16Content
                    });
                });
            }
        });
    });
