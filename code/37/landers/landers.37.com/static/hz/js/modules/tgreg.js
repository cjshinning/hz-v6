/**
 * 游戏盒子推广端注册模块
 */
define(["require","sq.core","box","client","sq.login"],function(require,SQ,Box,client){
    var hosts = "37.com";
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
            this.setTgTpl();
            this.events();
            this.setGiftContent(1);
            client.DoSuperCall(118, {
                clientinfo: ""
            });
        },
        /**
         * 绑定事件
         */
        events: function() {
            var _this = this;
            if(!this.$tgPop || this.$tgPop.length === 0){
                return;
            }
            this.$tgPop.one("click",function(){
                window.clearInterval(_this.timeInt);
                _this.$countDown.html("");
                _this.$tgPop.children(".reg-panel").show();
            })
                .on("click.closeFloat", ".btn-close", function() {
                    _this.hideTg();
                })
                .on("keypress.game", "#reg-username, #reg-password, #reg-password2", function(e) {
                    if (e.keyCode === 13) {
                        _this.toReg();
                    }
                })
                .on("click.register", "a.btn-enter", function(e) {
                    e.preventDefault();
                    _this.toReg();
                }).on("mouseover",".gift-box a",function(event){
                    event.preventDefault();
                    var $tar = $(this),
                        $giftContent = _this.$tgPop.find(".gift-box"),
                        $as = $giftContent.children("a"),
                        num = $as.index($tar[0]) + 1,
                        cls = $tar.attr("class");
                    $as.each(function(){
                        var cls2 = $(this).attr("class");
                        if(cls2.indexOf("-hover") > -1){
                            cls2 = cls2.replace("-hover","");
                            $(this).removeClass().addClass(cls2);
                        }
                    });
                    if(cls.indexOf("-hover") === -1){
                        $tar.removeClass().addClass(cls+"-hover");
                    }
                    _this.setGiftContent(num === 6 ? 4 : num);
                    $("#arrow").removeClass().addClass( "arrow" + num );
                });
        },

        /**
         * 设置礼品内容
         * @param num
         */
        setGiftContent:function(num){
            this.$tgPop.find(".gift-content").html(this.giftList[(num === 6 ? 4 : num)]);
        },

        /**
         * 获取所有需要的dom元素
         */
        getDom:function(){
            this.$countDown = $("#countDown");
            this.$tgPop = $("#tgPop");
            this.username = $("#reg-username");
            this.password = $("#reg-password");
            this.password1 = $("#reg-password2");
        },
        /**
         * 设置注册弹窗的html，并显示弹窗，开始倒计时
         */
        setTgTpl: function() {
            var _this = this;
            if (Box.noLogin != "1" || Box.User.info !== null) {
                return;
            }
            $(document.body).append(this.html);
            this.getDom();
            this.setCountdown();
        },
        /**
         * 设置倒计时
         */
        setCountdown:function(){
            var time = 0,
                t = 0,
                _this = this;
            time = this.$tgPop.data("tgtime") || 60
            this.timeInt = window.setInterval(function() {
                t = --time;
                if (t < 0) {
                    _this.hideTg();
                }
                _this.$countDown.html(t + "秒");
            }, 1000);
        },
        /**
         * 隐藏推广端注册弹窗
         */
        hideTg: function() {
            this.$tgPop.hide().prevAll("div.tg-pop-bg").hide();
            window.clearInterval( this.timeInt );
        },
        /**
         * 设置注册时需要的数据。该方法被客户端214接口回调
         * @param param
         */
        setRegData: function(param) { //tgReg.setRegData({gameid:237})
            window.DefaultDataMeta = $.extend(DefaultDataMeta, param);
            DefaultDataMeta.game_id = this.param.ID = param.gameid;
            this.getServerInfo();
        },
        /**
         * 获取游戏服数据
         */
        getServerInfo: function() {
            var that = this;
            $.ajax({
                url: "/get_game_key.php",
                dataType: "json",
                data: {
                    game_id: DefaultDataMeta.game_id
                }
            }).done(function(r) {
                if (!$.isEmptyObject(r)) {
                    that.param.NAME = r.game_name;
                    that.param.GAME_KEY = r.game_key;
                    that.param.SID = r.newest_server.SID;
                    that.param.SERVER_NAME = r.newest_server.SERVER_NAME;
                    DefaultDataMeta.server_id = r.newest_server.ID;
                }
            });
        },
        /**
         * 根据游戏参数，生成进入游戏的链接
         * @returns {string}
         */
        getUrl: function() {
            var param = this.param;
            return this.gameUrl.replace(/{gameid\}/g, param.ID)
                .replace(/{sid\}/g, param.SID)
                .replace("{gamename}", encodeURIComponent(param.NAME))
                .replace("{gamekey}", param.GAME_KEY)
                .replace("{login_account}", this.LOGIN_ACCOUNT)
                .replace("{server_name}", encodeURIComponent(param.SERVER_NAME))
                .replace("{error_url}", "");
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
                        window.open(options.url);
                        window.location.reload();
                    },
                    fail: function(res) {
                        if (res && res.message) {
                            alert(res.message);
                        }
                    }
                };

            if ((uTip = sqLogin.checkUsername(options.login_account, true)) !== true) {
                //CC.inputStatus( this.username, "status-w" );
                alert(uTip);
                return;
            } else {
                //CC.inputStatus( this.username, "status-r" );
            }

            if ((pTip = sqLogin.checkPassword(options.password, options.login_account)) !== true) {
                //CC.inputStatus( this.password, "status-w" );
                alert(pTip);
                return;
            } else {
                //CC.inputStatus( this.password, "status-r" );
            }

            if (options.password !== options.password1) {
                //CC.inputStatus( this.password1, "status-w" );
                alert("两次密码输入不一致");
                return;
            } else {
                //CC.inputStatus( this.password1, "status-r" );
            }
            this.LOGIN_ACCOUNT = options.login_account;
            DefaultDataMeta.version = "floatimg";
            //window.game.register["toRegPostAd"]($.extend(options, DefaultDataMeta));
            //改为统一调用Box.User下的方法
            options.source = 1;
            Box.User.toRegPostAd($.extend(options, DefaultDataMeta));
            //this.toRegPostAd($.extend(options, DefaultDataMeta));
        },

        /**
         *
         */
        giftList: {
            1:'<p class="gift-name">入门大礼包-盒子专享</p>'+
                '<div class="gift-icon-box"><span class="gift-icon"><img src="/hz/signin/css/images/icon/hzzxjzz.png"><span>2</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/sbjyjz.png"><span>1</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/tsxld.png"><span>1</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/fslp.png"><span>2</span></span></div>' +
            '<p class="gift-detail">礼包内容:金砖（中）*2、双倍经验卷轴*1、天山雪莲（大）*1、法神令牌*2</p>',
            2:'<p class="gift-name">热血大礼包-盒子专享</p>'+
                '<div class="gift-icon-box"><span class="gift-icon"><img src="/hz/signin/css/images/icon/hzzxjzd.png"><span>2</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/sanbjyjz.png"><span>1</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/1000by.png"><span>1</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/gxjz.png"><span>3</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/boss2.png"><span>10</span></span></div>' +
            '<p class="gift-detail">礼包内容:金砖（大）*2、三倍经验卷轴*1、1000绑元*1、功勋卷轴*3、boss积分精魄*10</p>',
            3:'<p class="gift-name">白金大礼包-盒子专享</p>'+
                '<div class="gift-icon-box"><span class="gift-icon"><img src="/hz/signin/css/images/icon/hzzxjzd.png"><span>3</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/sanbjyjz.png"><span>1</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/ym.png"><span>10</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/cjlp.png"><span>6</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/2000by.png"><span>1</span></span></div>' +
            '<p class="gift-detail">礼包内容:金砖（大）*3、三倍经验卷轴*1、羽毛*10、成就令牌*6、2000绑元*1</p>',
            4:'<div class="gift-icon-box"><span class="gift-icon"><img src="/hz/signin/css/images/icon/myjz.png"><span>10</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/hzzxjzx.png"><span>5</span></span>' +
            '<span class="gift-icon"><img src="/hz/signin/css/images/icon/sbjyjz.png"><span>1</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/tsxlz.png"><span>5</span></span>' +
            '<span class="gift-icon"><img src="/hz/signin/css/images/icon/fbjz.png"><span>2</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/ym.png"><span>10</span></span>' +
            '<span class="gift-icon"><img src="/hz/signin/css/images/icon/cjlp.png"><span>5</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/2000by.png"><span>1</span></span>' +
            '<span class="gift-icon"><img src="/hz/signin/css/images/icon/boss2.png"><span>5</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/gxjz.png"><span>2</span></span>' +
            '<span class="gift-icon"><img src="/hz/signin/css/images/icon/sanbjyjz.png"><span>5</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/fslp.png"><span>1</span></span> </div>',
            5:'<p class="gift-name">神助大礼包-盒子专享</p>'+
            '<div class="gift-icon-box"><span class="gift-icon"><img src="/hz/signin/css/images/icon/hzzxjzd.png"><span>2</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/sanbjyjz.png"><span>1</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/myjz.png"><span>1</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/cjlp.png"><span>5</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/fslp.png"><span>2</span></span></div>' +
            '<p class="gift-detail">礼包内容:金砖（大）*2、三倍经验卷轴*1、玛雅卷轴*1、成就令牌*5、法神令牌*2</p>',
            6:'',
            7:'<p class="gift-name">狂欢大礼包-盒子专享</p>'+
                '<div class="gift-icon-box"><span class="gift-icon"><img src="/hz/signin/css/images/icon/hzzxjzx.png"><span>2</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/sbjyjz.png"><span>1</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/tsxlz.png"><span>1</span></span><span class="gift-icon"><img src="/hz/signin/css/images/icon/fbjz.png"><span>2</span></span></div>' +
            '<p class="gift-detail">礼包内容:金砖（小）*2、双倍经验卷轴*1、天山雪莲（中）*1、副本卷轴*2</p>'
        },

        /**
         * 推广端弹窗的html
         */
        html:'<div class="tg-pop-bg"></div><div class="tg-pop-panel" id="tgPop" data-tgtime="60">'+
        '<div class="control"><span id="countDown">60秒</span><a href="javascript:void(0);" class="btn-close">关闭</a></div>'+
        '<div class="panel-gift"><div class="gift-box"><a href="javascript:;" class="day1"></a><a href="javascript:;" class="day2"></a><a href="javascript:;" class="day3"></a>'+
        '<a href="javascript:;" class="day4"></a><a href="javascript:;" class="day5"></a><a href="javascript:;" class="day6"></a><a href="javascript:;" class="day7"></a></div>'+
        '<p class="arrow1" id="arrow"></p><div class="gift-content"></div><a href="javascript:;" class="tg-btn-start"></a></div>'+
        '<div class="reg-panel tg-bg-panel hide"><div class="reg-form">'+
        '<p class="p-r-usr"><label for="reg-username">用户帐号：</label><input type="text" id="reg-username" name="reg-username" class="reg-username"/><span class="status"></span></p>'+
        '<p class="reg-tip usr-tip">4-20个字符（数字或者字母组成）</p>'+
        '<p class="p-r-pwd"><label for="reg-password">设置密码：</label><input type="password" id="reg-password" name="reg-password" class="reg-password"/><span class="status"></span></p>'+
        '<p class="reg-tip">长度6-20个字符</p>'+
        '<p class="p-r-pwd2"><label for="reg-password2">重复密码：</label><input type="password" id="reg-password2" name="reg-password2" class="reg-password2"/><span class="status"></span></p>'+
        '<p class="reg-tip">两次输入的密码请保持一致</p>'+
        '<p class="p-btn"><a href="#" class="btn-enter" title="注册" id="btn-reg">注　册</a></p></div></div></div>'
    };

    return tgReg;
});