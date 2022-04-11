require.config({
    baseUrl:"/static/hz/js",
    urlArgs:"t=20180612103000VER&c=c",
    paths: {
        "jQuery":"lib/landers.core",
        "sq.core": "lib/sq.core",
        "sq.tab": "http://ptres.37.com/js/sq/widget/sq.tab",
        "sq.statis": "http://ptres.37.com/js/sq/widget/sq.statis",
        "sq.tooltip":"http://ptres.37.com/js/sq/widget/sq.tooltip",
        "jQuery.nicescroll":"http://ptres.37.com/js/sq/plugin/jquery.nicescroll.min",
        "jQuery.mjpscroll":"http://ptres.37.com/js/sq/plugin/jquery.mousewheel",  //只是控制小号注册滚动条样式
        "jQuery.jpscroll":"http://ptres.37.com/js/sq/plugin/jquery.jscrollpane",  //只是控制小号注册滚动条样式
        "placeholder":"http://ptres.37.com/js/jquery.placeholder.min",
        "sq.login":"http://ptres.37.com/js/sq/widget/sq.login",
        "sq.validate":"http://ptres.37.com/js/sq/widget/sq.validate",
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
        "sq.login":{
            deps:['sq.core']
        },
        'jQuery.nicescroll':{
            deps:['sq.core']
        },
        'jQuery.mjpscroll':{
            deps:['sq.core']
        },
        'jQuery.jpscroll':{
            deps:['sq.core']
        },
        'placeholder':{
            deps:['sq.core']
        },
        "sq.validate":{
            deps:["sq.core"]
        }
    }
});

require(
    [
        "sq.core",
        "client",
        "box",
        "sq.login",
        "jQuery.nicescroll",
        "jQuery.mjpscroll",
        "jQuery.jpscroll",
        "placeholder",
        "sq.statis",
        "sq.validate"
    ],
    function( SQ, client, Box ) {

var hosts = "37.com";
var inputDom;

var TJFROM_BOX = 106; //来源：盒子和盒子小号
var TJFROM_BOX_AD = 206; //来源：盒子和盒子小号-广告
var TJWAY_PLATFROM = 1;
var TJWAY_AUTOLOGIN = 2;
var TJWAY_PHONE = 5;
var TJWAY_TOKEN = 6; //token登录

var VERSION_VALUE = 3507;
/**
 * @namespace game
 * @type {{data: (DefaultDataMeta|*), regType: string, regUrl: string, checkUserUrl: string, checkWordsUrl: string, init: Function, events: Function, inputStatus: Function, changeForm: Function, login: {init: Function, cursorPosition: Function, handler: Function, toLog: Function}, register: {init: Function, toReg: Function, toRegPost: Function, toRegPostAd: Function, inputFocus: Function, inputBlur: Function, recomAccount: Function}, _validate: {check: Function, checkField: Function, checkAccount: Function, checkAjax: Function, showPending: Function, showRight: Function, showError: Function, showFail: Function, username: Function, password: Function, eq: Function, code: Function, passwordGrade: Function}, Jsonp: Function}}
 */
var game = {

    data: DefaultDataMeta,
    regType: "",
    regUrl: "http://regapi." + hosts + "/api/p_register_client.php?login_account={login_account}&password={password}&password1={password1}&referer={refer}&referer_param={uid}&installtime={installtime}&ab_param={version}&game_id={game_id}&game_server_id={server_id}",
    checkUserUrl: "http://my." + hosts + "/api/register.php?action=checkUser",
    checkWordsUrl: "http://my." + hosts + "/api/check_words.php?action=check",
    thirdLogUrl: "http://my." + hosts + "/api/oauth_api.php?action=oauth_login",//第三方登录接口
    browserType:"ie",
    switchAnth:false,
    switchAnthConfig:{
        official:false,
        promotion:false
    },
    regStep: 0, //0:帐号注册，1：手机注册
    /**
     * 页面初始处理
     * @function init
     * @memberof game
     */
    init: function() {
        var d,that = this;
        this.sRecom = 0;
        this.initSwitchAnth();

        // 获取表单验证实例
        if ( !SQ.Login.Validate ) {
            SQ.Login.Dialog();
        }

        this.login.init();
        this.register.init();

        //判断实名认证类型（channeltype=norealname则不需要实名认证）
        this.checkChannelType();
        $("#mini-container").show();

        //初始化盒子信息
        Box.Client.bind("inited",function(){
            that.regType = this.isOfficial ? "" : "Ad";
            if (this.version >= 3500 && this.version < 900000) {
                that.thirdLogBtn();
            }
        });
        Box.Client.init();

        this.events();

        if ( game.isAlternate ) {
            return;
        }

        if ( this.login.$username.val() == "帐号" ){
            this.login.$username.val( cookie_account );
            d = 1;
        } else {
            d = 2;
        }
        try {
            client.DoSuperCall( 106, {
                doccomplete: d
            });
        } catch ( e ) {
            SQ.log( "finish error!" );
        }
        SQ.Statis.setReferer();
    },

    checkChannelType: function(){
        //判断渠道是否需要实名认证
        var channelType =  SQ.getParam('channeltype') , refer = SQ.getParam('refer');
        if( channelType === "norealname" ){
            resetRegDom();
        }

        //判断refer是否包含这几个wd_feitian，wd_37cs,37cs_wd,feitian_wd
        var referArr = ["wd_feitian","wd_37cs","37cs_wd","feitian_wd"];
        if( $.inArray(refer,referArr) !== -1 ){
            //resetRegDom();
        }

        //重置注册dom
        function resetRegDom(){
            $("#form-account .reg-name-box,#form-account .reg-card-box").remove();
            $("#form-phone .reg-name-box,#form-phone .reg-card-box").remove();
            $("#form-account").css("height","295px");
            $("#form-phone").css("height","328px");
        }
    },

    /**
     * 第三方登录callback页面初始处理
     * @function init
     * @memberof game
     */
    initThirdLog: function() {
        var d,that = this;
        this.sRecom = 0;
        this.getUserInfo();

        //初始化盒子信息
        Box.Client.bind("inited",function(){
            that.regType = this.isOfficial ? "" : "Ad";
        });
        Box.Client.init();

        this.events();

        if ( game.isAlternate ) {
            return;
        }

        SQ.Statis.setReferer();
    },

    /**
     * TOKEN登录
     * @function init
     * @memberof game
     */
    initTokenLog: function() {
        var getToken = SQ.getParam("mytoken") ? SQ.getParam("mytoken") : '',
            $loadingStatus = $('.loading-status'),
            point = ".",
            count = 1;

        if (!getToken || getToken === SQ.cookie('oldToken')) {
            $('#log-msg').text(' ');
            $('.hide-box').show();
        } else {
            $loadingStatus.show();

            setInterval(function(){
                if (count > 5) {
                    count = 1;
                    point = ".";
                } else {
                    count ++;
                    point += ".";
                }
                $('.loading-text').text('正在进入游戏'+point);
            }, 500);
        }
        getToken = getToken + "";//转为字符串

        /*
        *ie6、7、8浏览器下载带TOKEN的盒子后直接点击“运行”按钮，
        *浏览器会在临时文件夹下创建一个37game-z4ddc3sv[1].exe文件
        *与其他浏览器下的37game-z4ddc3sv.exe相比多了个"[1]"因此要做如下分割，
        *才能获取正确的TOKEN
        */
        if (getToken.indexOf('[') > -1) {
            getToken = getToken.split("[")[0];
        }

        if (!!getToken && getToken !== SQ.cookie('oldToken')) {
            SQ.cookie('oldToken', getToken, {domain:'landers.37.com',path:'/',expires:1});

            $.ajax({
                url: 'http://my.37.com/api/api_gamebox_token.php?action=login',
                type: 'post',
                cache: false,
                dataType: 'jsonp',
                jsonpCallback: "jsCallbackhz",
                data: {
                    token: getToken + "",
                    callback: "jsCallbackhz",
                    ajax: 0,
                    tj_from: TJFROM_BOX,
                    tj_way: TJWAY_TOKEN
                }
            })
            .done(function(res) {
                if (res.code*1 === 2) {
                    var info = res.data,
                        inGameUrl = encodeURIComponent('http://gameapp.37.com/controller/enter_game.php?game_id='+info.game_server_info.GAME_ID+'&sid='+info.game_server_info.SID+'&showlogintype=4&wd_entergame=1&wd_NAME='+info.game_server_info.GAME_NAME+'&wd_GAME_KEY='+info.game_server_info.GAME_KEY+'&wd_SID='+info.game_server_info.SID+'&wd_GAME_ID='+info.game_server_info.GAME_ID+'&wd_username='+info.login_account+'&wd_SNAME='+info.game_server_info.SERVER_NAME+'&error_url=&refer='+info.referer+'&uid='+info.referer_param);

                    info.login_account = info.login_account+"";

                    $.ajax({
                        data: {
                            tj_from: TJFROM_BOX,
                            tj_way: TJWAY_AUTOLOGIN
                        },
                        dataType: "jsonp",
                        url: "http://my.37.com/api/login.php?action=userinfo"
                    }).done(function( res ) {
                        if (res.code*1 === 0) {
                            var results = res.data;

                            results.LOGIN_ACCOUNT = results.LOGIN_ACCOUNT+'';

                            client.DoSuperCall( 101, {
                                logintype: 1,
                                account: results.LOGIN_ACCOUNT.toLowerCase(),
                                password: "",
                                accountstate: 0,
                                source: 0,
                                nickname: encodeURIComponent(results.AUTH_NICKNAME || ""),
                                thirdlogin: results.AUTH_TYPE || "",
                                alias_account: results.ALIAS_ACCOUNT || "",
                                showthirdhead: results.IS_ALIAS_HEADER || 0,
                                thirdheadurl: results.SHOW_HEADER || "",
                                isadult: results.IS_ADULT,
                                ingameurl: inGameUrl
                            });
                            $('.hide-box').show();
                            $loadingStatus.hide();

                            location.href = "http://landers.37.com/index.php?c=hz-main&a=index&gameid=" + info.game_server_info.GAME_ID + "&refer=" + info.referer + "&uid=" + info.referer_param + "&wd_username=" + info.login_account;

                        } else if (res.code*1 === -1) {
                            alert(res.msg);
                        }
                    });
                } else {
                    $('#log-msg').text('自动登录失败，请重新手动登录');
                    $('.hide-box').show();
                    $loadingStatus.hide();
                }
            })
            .fail(function() {
                SQ.log("请求验证失败！");
            });
        }
    },

    initSwitchAnth:function(refer){
        var refer = refer || SQ.getParam("refer"),
            clientType = refer === "37wanty" ? "official" : "promotion";
        this.switchAnth = this.switchAnthConfig[clientType];
    },

    /**
     * 事件绑定
     * @event events
     * @memberof game
     */
    events: function() {
        $( "div.container" )
            .on( "click", function( e ) {
                if ( e.target.id !== "recom-alert" ){
                    if ( game.sRecom != 1 ) {
                        game.sRecom = 0;
                        $( "#recom-alert" ).hide();
                        $( "#ascrail2001" ).hide();
                    } else {
                        // if ( inputDom == "reg-username-s" && e.target.id !="btn-reg" ) {
                        //     game.sRecom = 1;
                        //     var $dom = $( "#" + inputDom ).next(),
                        //         rule = $dom.attr( "data-rule" );
                        //     if ( rule ) {
                        //         game.accountRegister.$regMsg.html( "" );
                        //         game._validate.checkField( $dom[0], rule, game.accountRegister );
                        //     }
                        // }
                    }
                }
                if (e.target.id !== "show-alert") {
                    var $inputAlert = $("#input-alert");
                    if (e.target.className.indexOf("input-alert-del") == -1 && !$inputAlert.is(":hidden")) {
                        $inputAlert.hide();
                        $("#ascrail2000").hide();
                    }
                }
            })
            //页面最小化
            .on('click.topbtn', '#top-btn-min', function(event) {
                event.preventDefault();
                client.DoSuperCall( 122, {
                    operatename: "min"
                });
            })
            //页面关闭
            .on('click.topbtn', '#top-btn-close', function(event) {
                event.preventDefault();
                client.DoSuperCall( 122, {
                    operatename: "close"
                });
            })

            //checkbox处理
            .on( "click.checkbox", "#checkbox-rPassword, #checkbox-rPassword-a, #checkbox-autoLogin, #checkbox-autoLogin-a", function( e ) {
                e.preventDefault();
                $( "#" + this.id.substring( 0, 18 )).toggleClass( "checked" );
                var $autoLogin = $( "#checkbox-autoLogin" ),
                    $rPassword = $( "#checkbox-rPassword" );
                if ( this.id.substring( 0, 18 ) == "checkbox-autoLogin" && $autoLogin.hasClass( "checked" ) ) {
                    $rPassword.addClass( "checked" );
                }
                if ( this.id.substring( 0, 18 ) == "checkbox-rPassword" && !$rPassword.hasClass( "checked" ) ) {
                    $autoLogin.removeClass( "checked" );
                }
            })
            .on( "click.checked", "#checkbox-agreement, #p-checkbox-agreement", function(e){
                $( this ).toggleClass( "checked" );
            })
            //输入框处理
            .on( "focusin focusout", ".log-input", function( e ) {
                var $showAlert = $( "#show-alert");

                $showAlert.removeClass( "ico-2-focus" );
                if ( e.type == "focusin" ) {
                    $( ".log-input" ).removeClass( "input-focus" );
                    $( "#log-msg" ).html( "" );
                    $( this ).addClass( "input-focus" );
                } else if ( e.type == "focusout" ) {
                    $( this ).removeClass( "input-focus" );
                }
            })
            //登录、注册操作，回车
            .on( "keypress.game", ".input", function( e ) {
                if ( e.keyCode === 13 ) {
                    if ( this.id.indexOf( "log" ) > -1 ) {
                        game.login.toLog();
                    } else {
                        // var className = $( this ).parent().attr("class");
                        // if ( className.indexOf("p-reg") > -1 ) {
                        //     game._validate.check( game.phoneRegister.$div, game.phoneRegister);
                        // } else {
                        //     game._validate.check( game.accountRegister.$div, game.accountRegister);
                        // }
                    }
                }
            })

            .on( "mouseover.select-game", "#select-game", function() {
                $( this ).addClass( "select-game-hover" );
            })
            .on( "mouseout.select-game", "#select-game", function() {
                $( this ).removeClass( "select-game-hover" );
            })
            .on( "click.filter", "#game-letter a", function() {
                game.gf.fData.gameLetter = [];
                game.gf.fData.gameLetter.push( $( this ).attr( "data-key" ));
                game.gf.getMatchData( game.gameLetter );    //匹配筛选数据
            });

        if (!this.data.version || +(this.data.version.indexOf("gb_") > -1 ? this.data.version.substring(3) : this.data.version) < VERSION_VALUE) {
            // var isIE6 = $.browser.msie && (parseInt($.browser.version) < 7);
            var $miniContainer = $( "#mini-container" );
            $( "body" ).css({ "height": "270px"});  //处理IE6的兼容问题
            $miniContainer.css({"height":"100%"});
            // if (!isIE6) {
            //     miniContainer.niceScroll({cursorcolor:"#cbd0d5",autohidemode: false,horizrailenabled:false,cursorwidth:"8px",cursorborderradius: "8px",zIndex:900});
            // }
            $miniContainer.jScrollPane({
                "mouseWheelSpeed":20
            });

        }

        // 绑定注册页tab切换事件
        $( ".reg-tab-box" ).on("click", ".reg-tab", function(e){
            var target = $(this);
            var index = target.index();
            if ( target.hasClass("focus") ) {
                return;
            }
            // 设置标识
            game.regStep = index;

            // 切换内容
            $(".form-content").hide().eq(index).show();

            // 刷新验证码
            if ( index === 0 && game.accountRegister.regVC.isOpen ) {
                game.accountRegister.regVC.refreshImg();
                game.accountRegister.regVC.codeTip.find("input").removeClass("input-w");
                // game.accountRegister.$username.prev().focus();
            }
            if ( index === 1 ) {
                game.phoneRegister.regVC.refreshImg();
                game.phoneRegister.regVC.codeTip.find("input").removeClass("input-w");
                game.phoneRegister.$username.prev().focus();
            }
        });
    },

    /**
     * 输入框添加样式状态
     * @param options {object} 输入框的jquery对象
     * @param value {string} 样式名
     * @function inputStatus
     * @memberof game
     */
    inputStatus: function( $options, value ) {
        if ( value !== "w" ) {
            $options.removeClass( "input-w" );
        } else {
            $options.addClass( "input-w" );
        }
    },

    /**
     * 登录页和注册页切换的相关处理
     * @param dom {object} 登录页或注册页的jquery对象
     * @param type {string} 可选，进入登录页的类型参数，有值：登录页加上参数并刷新；无值：将帐号输入框的光标移到字符后
     * @function changeForm
     * @memberof game
     */
    changeForm: function( elemid, type ) {
        type = type || "";
        $( ".container" ).children( "div" ).addClass("hide");
        $( "#" + elemid ).removeClass("hide");
        client.DoSuperCall( 104, {
            changepage: ( elemid.indexOf("og") > 0 ) ? 1 : 2
        });
        $( "#avatar" ).hide();
        $( "#reg-bg-icon" ).hide();
        if(elemid === "reg-form"){
            $( "#reg-bg-icon" ).show();
            if ( game.regStep === 0 ) {
                this.accountRegister.isNeedVerifyCode();
                this.accountRegister.$username.focus();
                this.login.cursorPosition( this.accountRegister.$username );
            }
        }else if(elemid === "log-form"){
            $( "#avatar" ).show();
            /*if( type && type !== "c" ){alert(type);
                window.location.reload();
                //window.location.href = window.location.href.indexOf('ischg') > 0 ? window.location.href : window.location.href + "&ischg=1";
            } else {*/
                this.login.$password.prev().hide().end().show();
                this.login.cursorPosition( game.login.$username );
            //}
            this.login.vcClose();
        }else if(elemid === "reg-anth-form"){
            game.register.$realName.focus();
        }
    },

    vc: {
        code_type: "log",
        checkCodeUrl: "http://my.37.com/code_check.php?callback=?",
        events: function( $this ) {
            var that = this;

            $this.$codeImg = $this.$codeTip.find( "img" ).prop( "src", SQ.Login.codeUrl + "?from=" + that.code_from + "&t=" + $.now() ).on( "click", function() {
                SQ.Login.refreshCode( this, null, false, that.code_type );
            });

            $this.$codeInput.on( "keyup.keydoing", function( e ) {
                var v, ret;

                if ( e.keyCode === 13 ) {
                    return;
                }

                v = this.value;

                if ( v.length === 4 ) {
                    ret = game._validate.code( v );
                    if ( ret !== true ) {
                        return that._state( "error", $this, ret );
                    }

                    if ( $this.currentState === "pending" ) {
                        return;
                    }
                    that._state( "pending", $this );
                    that.check(v,$this);
                } else if ( $this.currentState === "right" ) {
                    that._state( "error", $this, "请输入正确的验证码" );
                } else {

                }
            }).placeholder();
        },

        check:function(code,$this,callBack){
            var that = this;
            if(!$this){
                return;
            }
            $.getJSON( that.checkCodeUrl, {
                save_code: code,
                from: that.code_from
            }).done(function( res ) {
                if ( res.code === 0 ) {
                    that._state( "right", $this, "" );
                    if($.isFunction(callBack)){
                        callBack();
                    }
                } else {
                    that._state( "error", $this, "请输入正确的验证码" );
                    $this.$verifyCode instanceof jQuery && $this.$verifyCode.focus();
                }
            });
        },

        refreshImg: function( $this ) {
            if ( $this.$codeImg ) {
                SQ.Login.refreshCode( $this.$codeImg, null, false, this.code_type );
            }
        },

        _state: function( s, $this, msg ) {
            $this.currentState = s;
            if ( s === "pending" ) {
                return;
            }
            if ( s === "right" ) {
                $this.setMsg( $this.$codeInput, "" );
            } else {
                $this.setError( $this.$codeInput, msg );
            }
        },

        open: function( $this ) {
            var i = $this.$codeInput = $this.$codeTip.find( "input" );
            this.code_from = SQ.Login.cType ? SQ.Login.cType( this.code_type ) : 0;
            this.events( $this );
            $this.vcOpen && $this.vcOpen.call( this, $this );

            /*setTimeout(function() {
                i.focus();
            }, 10 );*/

            $this.isOpen = true;
        },

        close: function( $this ) {
            if ( $this && $this.isOpen ) {
                $this.$codeTip.addClass("hide");
                $this.$codeImg.off();
                $this.$codeInput.off( "keydoing" );
                $this.currentState = $this.$codeImg = $this.$codeInput = null;
                $this.isOpen = false;
                $this.vcClose && $this.vcClose.call( this, $this );
            }
        }
    },

    /**
     * 第三方授权成功后登录
     * @namespace game.thirdLogin
     */
    getUserInfo: function() {
         $.ajax({
            data: {
                tj_from: TJFROM_BOX,
                tj_way: TJWAY_AUTOLOGIN
            },
            dataType: "jsonp",
            url: "http://my.37.com/api/login.php?action=userinfo"
        }).done(function( res ) {
            if (res.code*1 === 0) {
                var info = res.data;

                info.LOGIN_ACCOUNT = info.LOGIN_ACCOUNT+'';

                client.DoSuperCall( 101, {
                    logintype: 1,
                    account: info.LOGIN_ACCOUNT.toLowerCase(),
                    password: "",
                    accountstate: 0,
                    source: 0,
                    nickname: encodeURIComponent(info.AUTH_NICKNAME || ""),
                    thirdlogin: info.AUTH_TYPE || "",
                    alias_account: info.ALIAS_ACCOUNT || "",
                    showthirdhead: info.IS_ALIAS_HEADER || 0,
                    thirdheadurl: info.SHOW_HEADER || "",
                    isadult: info.IS_ADULT
                });

            } else if (res.code*1 === -1) {
                alert(res.msg);
            }
        });
    },
    /**
     * 登录
     * @namespace game.login
     */
    login: {
        /**
         * @function init
         * @memberof game.login
         */
        init: function() {
            this.$div = $( "#log-form" );
            if(this.$div.hasClass("hide") || this.$div.is(":hidden")){
                return;
            }
            this.ischg = SQ.getParam( "ischg" );
            this.$username = $( "#log-username" );
            this.$password = $( "#log-password" );
            this.$rPassword = $( "#checkbox-rPassword" );
            this.$autoLogin = $( "#checkbox-autoLogin" );
            this.$logMsg = $( "#log-msg");
            this.$codeTip = $( "#log-verify");

            this.$username.placeholder();
            this.$password.placeholder();

            this.events();

            try {
                client.DoSuperCall( 123, {
                    account: ""
                });
            } catch ( e ) {
                SQ.log( "account error!" );
            }

        },

        events:function(){
            this.$div.on('click', '#btn-reg-form', function(event) {//“马上注册”按钮
                var version = game.data.version.indexOf("gb_") > -1 ? game.data.version.substring(3) : game.data.version;
                if ( version >= VERSION_VALUE ) {
                    event.stopPropagation();
                    event.preventDefault();
                    game.changeForm( "reg-form" );
                } else {
                    $( event.target ).attr("href", "http://my.37.com/register.html?refer=" + SQ.getParam("refer"));
                }
            }).on( "click.alert", "#show-alert", function() {//下拉账号选择按钮
                var $inputAlert = $( "#input-alert"),
                    $logUsername = $( "#log-username"),
                    $showAlert = $( "#show-alert"),
                    $inputAlertUl = $( "#input-alert-ul"),
                    $ascrail = $( "#ascrail2000" );
                $inputAlert.toggle();
                if( !$inputAlert.is(":hidden")) {
                    $logUsername.addClass( "input-focus" );
                    $showAlert.addClass( "ico-2-focus" );
                    $inputAlertUl.css({
                        "overflow": "hidden"
                    });
                    if( $inputAlertUl.find( "li" ).size() > 4) {
                        $ascrail.show();
                    }
                } else {
                    $logUsername.focusin();
                    $ascrail.hide();
                }
            }).on( "click.game", "a.btn-log", function(event)  {//登录按钮
                event.stopPropagation();
                event.preventDefault();
                game.login.toLog();
            })
            //帐号列表，鼠标进入的处理
            .on( "mouseenter.account", ".input-alert-li", function() {
                $( this ).addClass( "input-alert-hover" ).find( ".input-alert-del" ).show();
            })
            //帐号列表，鼠标离开的处理
            .on( "mouseleave.account", ".input-alert-li", function() {
                $( this ).removeClass( "input-alert-hover" ).find( ".input-alert-del" ).hide();
            })
            //帐号列表，删除帐号的处理
            .on( "click.account-del", "span.input-alert-del", function() {
                var $dom = $( this ).parent(),
                    $par = $dom.parent(),
                    account = $dom.find( "a.log-account" ).html();
                client.DoSuperCall( 103, {
                    account: account
                });
                $dom.remove();
                if ( $par.html() == "" ){
                    $( "#input-alert" ).hide();
                }
                if( $par.find( "li" ).size() < 5) {
                    $( "#ascrail2000" ).hide();
                }
            })
            .on( "click.account-close", "span.input-alert-close", function() {
                $( "#recom-alert" ).hide();
            })//帐号列表，选择帐号后的处理
            .on( "click.account", "#input-alert-ul a", function() {
                var account = $( this ).html();
                if ( this.className.indexOf( "avatar" ) > -1 ) {
                    account = $( this ).next().html();
                }
                $( "#log-username" ).val( account ).focusin();
                $( "#input-alert" ).hide();
                $( "#ascrail2000" ).hide();
                /*client.DoSuperCall( 102, {
                    account: account
                });*/
                game.login.changeAccount( account );
            });
        },

        initAccount: function( accounts ) {
            var account,
                html = "";
            if(game.browserType === "ie"){
                html = '<li class="input-alert-li"><a class="input-alert-avatar log-avatar" style="FILTER: progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=\'true\',sizingMethod=\'scale\',src=\'{avatar}\') progid:DXImageTransform.Microsoft.Matrix(M11=1,M12=0,M21=0,M22=1,SizingMethod=\'auto expand\');"></a><a class="log-account">{account}</a><span class="input-alert-del ico ico-3-focus"></span></li>';
            }else{
                html = '<li class="input-alert-li"><a class="input-alert-avatar log-avatar"><img src="http://img1.37wanimg.com/landers/hz/images/head/{avatar}.png" alt=""/></a><a class="log-account">{account}</a><span class="input-alert-del ico ico-3-focus"></span></li>';
            }

            if ( $.isEmptyObject(accounts) || accounts.length === 0 ) {
                return;
            }
            account = accounts[0];

            this.$username.val( account.account );

            this.handler( account );
            var temp = [],
                $inputAlertUl = $( "#input-alert-ul" );
            for ( var a = 0; a < accounts.length; a++ ) {
                temp.push( html.replace( "{avatar}", decodeURIComponent(accounts[ a ].avatar) ).replace( "{account}", accounts[ a ].account ));
            }
            this.accountCache = accounts;
            $inputAlertUl.html( temp.join("") );
            if( accounts.length > 2 ) {
                $inputAlertUl.height(88).niceScroll({
                    cursorcolor:"#cbd0d5",horizrailenabled:false,cursorwidth:"8px",autohidemode:false
                });
            }
        },

        changeAccount: function( account ) {
            var accounts;
            if ( !this.accountCache.length ) {
                return;
            }
            accounts = this.accountCache;
            for ( var a = 0; a < accounts.length; a++ ) {
                if ( accounts[ a ].account === account ) {
                    this.handler( accounts[ a ] );
                    return;
                }
            }
        },

        /**
         * 输入框光标处理
         * @param $dom {object} 帐号输入框的jquery对象
         * @function cursorPosition
         * @memberof game.login
         */
        cursorPosition: function( $dom ) {
            //$( "#log-password" ).focus();
            $dom.addClass( "input-focus" ).focus();
            if("createTextRange" in $dom[0]){
                var rng = $dom[0].createTextRange();
                rng.move( "character", $dom.val().length );
                rng.select();
            }
            //rng.text = $dom.value;
            //rng.collapse(false);
        },

        /**
         * 端将帐号信息传到页面后的相关处理
         * @param data {json} 帐号的相关信息
         * @function handler
         * @memberof game.login
         */
        handler: function( data ) {
            var $logPassword = $( "#log-password" );
            if ( data.accountstate == 2 ) {
                this.$autoLogin.addClass( "checked" );
                this.$password.val( data.password.replace( /“/g, '"' ).replace( /、/g, '\\' ) );
                //$logPassword.focus();
                if( !this.ischg ) {
                    this.toLog( "alert" );
                }
            }
            if ( data.accountstate == 1 ) {
                this.$rPassword.addClass( "checked" );
                this.$password.val( data.password.replace( /“/g, '"' ).replace( /、/g, '\\' ) );
                //$logPassword.focus();
            }
            if ( data.accountstate != 1 && data.accountstate != 2) {
                this.$password.val( "" );
            }
            if(game.browserType === "ie"){
                $( "#avatar" ).find( ".avatar-img" )[0].style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true',sizingMethod='scale',src='{avatar}')".replace( "{avatar}", data.avatar.replace( "(", "\(" ).replace( ")", "\)" ) );
            }else{
                //$( "#avatar" ).find( ".avatar-img" )[0].style = "background:url(http://img1.37wanimg.com/landers/hz/images/head/{avatar}_login.png) no-repeat;".replace( "{avatar}", data.avatar );
                $( "#avatar" ).find( ".avatar-img").css({"background":"url(http://img1.37wanimg.com/landers/hz/images/head/{avatar}_login.png) no-repeat".replace( "{avatar}", data.avatar)});
            }
        },

        /**
         * 登录操作
         * @param tipType {string} 错误提示的类型，有值：alert提示；无值：文字提示
         * @function toLog
         * @memberof game.login
         */
        toLog: function( tipType ) {
            var u, p, uTip, pTip,
                that = this,
                options = {
                    login_account: this.$username.val(),
                    password: this.$password.val(),
                    save_code: this.isOpen ? this.$codeInput.val() : "",
                    gameid: game.data.game_id || 0,
                    remember_me: 0,
                    save_state: 1,
                    ltype: 4,
                    tj_from: TJFROM_BOX,
                    tj_way: TJWAY_PLATFROM
                };

            tipType = tipType || "";
            u = options.login_account;
            //return this.setError( this.$username, "游戏停服中 愿祖国昌盛" );
            //检验账号、提示信息
            if ( (uTip = SQ.Login.checkUsername( u )) !== true ) {
                if ( tipType ){
                    alert( uTip );
                } else {
                    this.setError( this.$username, uTip );
                }
                return;
            }

            p = options.password;
            //密码校验、提示信息
            if ( (pTip = SQ.Login.checkPassword( p )) !== true ) {
                if ( tipType ){
                    alert( pTip );
                } else {
                    this.setError( this.$password, pTip );
                }
                return;
            }
            if ( this.isOpen && this.currentState !== "right" ) {
                return;
            }

            SQ.Login.toLog( $.extend({

                success: function(res) {
                        var info = res;

                        info.LOGIN_ACCOUNT = info.LOGIN_ACCOUNT+'';//兼容数字转为字符串

                        client.DoSuperCall( 101, {
                            logintype: "1",
                            account: info.LOGIN_ACCOUNT.toLowerCase(),
                            password: options.password.replace( /"/g, "“" ).replace( /\\/g, '、' ),
                            accountstate: that.$autoLogin.hasClass( "checked" ) ? 2 : ( that.$rPassword.hasClass( "checked" ) ? 1 : 0 ),
                            source: 0,
                            nickname: info.AUTH_NICKNAME || "",
                            thirdlogin: info.AUTH_TYPE || "",
                            alias_account: info.ALIAS_ACCOUNT || "",
                            showthirdhead: info.IS_ALIAS_HEADER || 0,
                            thirdheadurl: info.SHOW_HEADER || "",
                            isadult: info.IS_ADULT
                        });
                        game.vc.close( that );
                        location.href = "http://landers.37.com/index.php?c=hz-main&a=index&gameid=" + game.data.game_id + "&refer=" + game.data.refer + "&uid=" + game.data.uid + "&wd_username=" + u;
                },
                fail: function( res ) {
                    var map = {
                            "-1": that.$username,
                            "-2": that.$password
                        },
                        msg = {
                            "-1": "请输入正确的帐号",
                            "-2": "请输入正确的密码"
                        };
                    game.vc.close( that );
                    if ( map[res.code] ) {
                        that.setError( map[res.code], msg[res.code] );
                    } else if ( res.data === "safe_true" && ( res.code === -7 || res.code === -11 ) ) {
                        if ( that.isOpen ) {
                            that.setError( that.$codeInput, "验证码错误" );
                            game.vc.refreshImg( that );
                        } else {
                            game.vc.open( that );
                        }
                    } else {
                        that.isOpen && game.vc.refreshImg( that );
                        that.setMsg( "", res.msg || "登录出错，请重新尝试！" );
                    }
                }
            }, options ) );
        },
        setError: function( $dom, msg ) {
            this.$logMsg.html( msg );//.focus();
            //不是验证码时，才聚集到错误消息的dom
            if($dom[0].name !== "safe_code"){
                this.$logMsg.focus();
            }
            $dom && game.inputStatus( $dom, "w" );
        },
        setMsg: function( $dom, msg ) {
            this.$logMsg.html( msg );
            if ( $dom ) {
                game.inputStatus( $dom, "" );
            } else {
                game.inputStatus( $( "#log-form" ).find( ".input" ), "" );
            }
        },
        vcOpen: function( $this ) {
            $this.$codeTip.removeClass("hide");
            $("#log-verify-code").val("").focus();
            $( "#log-checkbox, #log-link" ).hide();
            $( "#log-verify-close" ).show().find( "a" ).on( "click", function(event) {
                event.preventDefault();
                event.stopPropagation();
                game.vc.close( $this );
            });
            $( "#btn-log" ).addClass( "vc-btn-log" );
            $( "#input-alert" ).hide();
            $("#ascrail2000").hide();
        },
        vcClose: function( $this ) {
            $( "#log-checkbox, #log-link" ).show();
            $( "#log-verify-close" ).hide().find( "a" ).off;
            $( "#btn-log" ).removeClass( "vc-btn-log" );
        }
    },

    /**
     * 第三方登录按钮url填充
     */
    thirdLogBtn: function() {
        var callbackUrl = encodeURIComponent('http://landers.37.com/index.php?c=hz-redirect&a=login'),
        	uId = SQ.getParam('uid'),
        	refer = SQ.getParam('refer'),
        	currentVersion = SQ.getParam('version') ? "gb_"+SQ.getParam('version') : SQ.getParam('version'),
        	abrefer = refer + "|" + ( uId || "" ) + "|" + ( currentVersion || "" );

        $('.hz_log_methods').css('display', 'block');
        $('.forget-pw-btn').css('float', 'left');
        $('.hz_log_methods').each(function(index, el) {
            if ($(this).attr('data-type') === "wx") {
                $(this).attr('href', game.thirdLogUrl+'&tj_from=106&tj_way=13&otype=wechat&from='+callbackUrl+'&ltype=4&abrefer='+abrefer+'&wd_thirdlogin=wechat');
            } else if ($(this).attr('data-type') === "qq") {
                $(this).attr('href', game.thirdLogUrl+'&tj_from=106&tj_way=11&otype=qq&from='+callbackUrl+'&ltype=4&abrefer='+abrefer+'&wd_thirdlogin=qq');
            } else if ($(this).attr('data-type') === "wb") {
                $(this).attr('href', game.thirdLogUrl+'&tj_from=106&tj_way=12&otype=weibo&from='+callbackUrl+'&ltype=4&abrefer='+abrefer+'&wd_thirdlogin=weibo');
            }
        });
        //console.log(this.register.setRegData());
    },

    /**
     * 注册
     * @namespace game.register
     */
    register: {
        //isOpen:false,
        /**
         * @function init
         * @memberof game.register
         */
        init: function() {
            var _this = this;
            this.$div = $( "#reg-form" );
            // 统一获取input
            this.realRegInput = $( ".reg-input" );
            this.placeholderRegInput = this.$div.find(".placeholder");
            this.realRegInput_account = $( "#form-account .reg-input" );
            this.realRegInput_phone = $( "#form-phone .reg-input" );

            game.accountRegister.init();
            game.phoneRegister.init();

            this.$anthForm = $("#reg-anth-form");
            this.$regMsg = $( "#reg-msg");
            this.$anthMsg = $("#anth-msg");
            this.$realName = $("#reg-real-name");
            this.$idNumber = $("#reg-id");
            this.$codeTip = $( "#reg-verify");
            this.$verifyCode = $("#reg-verify-code");
            this.validateAnth = new SQ.Validate({
                form: this.$anthForm,
                error:{
                    fieldClass: "input-w",
                    errorTipPosition: function( $tip, $field ) {
                        _this.$anthMsg.empty();
                        return $tip.appendTo( _this.$anthMsg );   // 将提示信息放到表单父元素的末尾
                    },
                    eachItem: false
                }
            });
            game.isAlternate = this.$div.data("alternate");
            this.events();
            if ( game.isAlternate ) {
                /*请求盒子的118接口放在Box.Client中进行，这里不用再做调用
                client.DoSuperCall( 118, {
                    clientinfo: "alternate"
                });*/
            }else{
                this.setRegData();
            }
            this.setPlaceholder();
        },
        setPlaceholder:function(){
            //this.$username.placeholder();
            //this.$password.placeholder();
            //this.$password1.placeholder();
            this.$realName.placeholder();
            this.$idNumber.placeholder();
        },
        events:function(){
            var _this = this;
            this.$div.off("click").off("keyup");
            // 返回登录
            this.$div.on( "click.change", "#btn-log-form, #p-btn-log-form", function( event ) {
                event.preventDefault();
                event.stopPropagation();
                $( "#recom-alert" ).hide();
                game.changeForm( "log-form","1" );
            })

            .on( "click.alternate", "#btn-alter-close", function( e ) {
                e.preventDefault();
                client.DoSuperCall( 101, {
                    logintype: "",
                    account: "",
                    password: "",
                    accountstate: 0,
                    source: 3
                });
            });
            // 统一去绑事件
            this.unbindEvs(this.realRegInput);
            this.unbindEvs(this.placeholderRegInput);
            this.unbindEvs(this.$idNumber);
            this.unbindEvs(this.$realName);

            //绑定所有的placeholder输入框的获取焦点的事件
            this.placeholderRegInput.focus(function(){
                if ( game.regStep == 0 ) {
                    // if ( game.sRecom == 2 ) {
                    //     var $dom = $( "#" + inputDom ).next(),
                    //         rule = $dom.attr( "data-rule" );
                    //     if ( rule ) {
                    //         game.accountRegister.$regMsg.html( "" );
                    //         game._validate.checkField( $dom[0], rule, game.accountRegister );
                    //     }
                    // }
                }
                _this.inputFocus( this );
                inputDom = this.id;
            });

            //绑定所有真实的input的获取焦点的事件
            this.realRegInput.focus(function(){
                if ( this.id !== "reg-username" && game.regStep == 0 ) {
                    game.sRecom = 2;
                }
                if ( this.id === "reg-username" ) {
                    inputDom = $( this ).prev().attr( "id" );
                }
                $( this ).addClass( "input-focus" );
            });

            //绑定所有真实的input的失去焦点的事件
            this.realRegInput_account.blur(function(){
                if ( this.id === "reg-username" ) {
                    if ( game.checking ) {
                        game.sRecom = 2;
                        game.checking = false;
                    } else {
                        game.sRecom = 1;
                    }
                }
                _this.inputBlur( this, game.accountRegister );
            });
            //绑定所有真实的input的失去焦点的事件
            this.realRegInput_phone.blur(function(){
                _this.inputBlur( this, game.phoneRegister );
            });

            this.$realName.blur(function(){
                _this.removeError(this);
            });
            this.$idNumber.blur(function(){
                _this.removeError(this);
            });

            this.$anthForm.off("click").off("keyup");
            this.$anthForm.on("keyup","input",function(event){
                if(event.keyCode === 13){
                    _this.submitAnth();
                }
            }).on("click","#btnAnth",function(){
                _this.submitAnth();
            }).on("click.prev","#btnPrev",function(){
                game.changeForm( "reg-form" );
            }).on("click.backlog","#btnBacklog",function(){
                game.changeForm( "log-form","1" );
            });
        },

        unbindEvs:function($el){
            $el.off("blur").off("focus").off("click");
        },

        submitAnth:function($this){
            var _this = this;
            if(_this.doing === true){
                return;
            }
            _this.doing = true;
            //如果验证开关关闭，则不再验证实名信息表单
            if ( game.switchAnth !== false && !_this.validateAnth.check() ) {   // 验证通过
                _this.doing = false;
                return;
            }

            var data = $.extend({
                login_account: $.trim($this.$username.val()),
                password: $this.$password.val(),
                password1: $this.$password1 ? $this.$password1.val() : ""
            }, $this.key === "phone" ? {
                verify_code: $this.$p_verifyCode.val(),
                phone: $.trim($this.$username.val()),
                name: $.trim($this.$regName.val()),
                id_card_number: $this.$regCard.val()
            } : {
                name: $.trim($this.$regName.val()),
                id_card_number: $this.$regCard.val(),
                safe_code: $this.$verifyCode.val()
            });

            if ( $this.key === "account" ||$this.key === "phone" ) {
                //防止id_Card_number参数被获取成默认的中文字符
                var idCard = parseInt(data.id_card_number,10);
                if(!(idCard === idCard)){
                    data.id_card_number = "";
                }
            }

            _this.toReg(data, $this);
        },

        submitReg:function($this){
            var _this = this;
            //return _this.showError("游戏停服中 愿祖国昌盛", $this);
            if(!game._validate.check( $this.$div, $this )){
                return;
            }
            //如果验证开关关闭，则直接执行submitAnth函数注册
            if(game.switchAnth === false){
                _this.submitAnth($this);
                return;
            }
            if ( $this.key === "account" ) {
                if($this.regVC.isOpen === true){
                    $this.regVC.check() && game.changeForm("reg-anth-form");
                } else{
                    game.changeForm("reg-anth-form");
                }
            }
        },

        removeError:function(el){
            var $this = $(el);
            if(!$this.val()){
                $this.removeClass("input-w");
            }
        },

        /**
         * 注册操作
         * @param data {json} 注册的信息
         * @function toReg
         * @memberof game.register
         */
        toReg: function ( data, $this ) {
            var isPost = 1;

            if ( $this.$checkbox.length > 0 ) {
                isPost = $this.$checkbox.hasClass( "checked" ) ? 1 : 0;
            }
            if ( isPost ) {
                this[ "toRegPost" + game.regType ]( $.extend( data, game.data, {
                    tj_from: game.regType == "Ad" ? TJFROM_BOX_AD : TJFROM_BOX,
                    tj_way: $this.key === "phone" ? TJWAY_PHONE : TJWAY_PLATFROM
                } ), $this );
            }else{
                $this.$regMsg.html("请阅读注册协议并勾选同意");
                this.doing = false;
            }
        },
        /**
         * 平台接口注册
         * @param options {json} 注册的信息
         * @function toRegPost
         * @memberof game.register
         */
        toRegPost: function( options, $this ) {
            var that = this,
                suc;
            options.abrefer = options.refer + "|" + ( options.uid || "" ) + "|" + ( options.version || "" );
            options.ltype = 4;  //注册类型(1,网页[平台,官网]注册;2,登录器注册;3,小号注册;4,盒子注册)
            if ( game.isAlternate ) {
                options.ltype = 3;
                options.no_cookie = 1;
                suc = function() {
                    that.doing = false;
                    client.DoSuperCall( 101, {
                        logintype: "0",
                        account: options.login_account,
                        password: options.password.replace( /"/g, "“" ).replace( /\\/g, '、' ),
                        accountstate: 0,
                        source: 3
                    });
                };
            } else {
                suc = function() {
                    that.doing = false;
                    client.DoSuperCall( 101, {
                        logintype: "0",
                        account: options.login_account,
                        password: options.password.replace( /"/g, "“" ).replace( /\\/g, '、' ),
                        accountstate: 0,
                        source: 0
                    });
                    location.href = "http://landers.37.com/index.php?c=hz-main&a=index&gameid=" + game.data.game_id + "&refer=" + game.data.refer + "&uid=" + game.data.uid + "&wd_username=" + options.login_account;
                };
            }
            if ( $this.key === "account" && $this.regVC.isOpen && $this.regVC.currentState !== "right" ) {
                that.doing = false;
                return;
            }
            SQ.Login.toReg( $.extend( {
                success: suc,
                fail: function( res ) {
                    that.doing = false;
                    if ( !res ) {
                        return;
                    }
                    if ( +res.code === -10 ) {
                        !$this.regVC.isOpen && $this.regVC.open();
                        $this.$regMsg.html(res.msg);
                    } else if ( +res.code == -25) {
                        game.phoneRegister.$p_verifyCode.prev().focus();
                        game.login.cursorPosition( game.phoneRegister.$p_verifyCode );
                    } else {
                        $this.regVC.isOpen && $this.regVC.refreshImg();
                        //that.$anthMsg.html( res.msg );
                    }
                    that.showError(res.msg, $this);
                }
            }, options ) );

        },
        /**
         * 广告接口注册
         * @param options {json} 注册的信息
         * @function toRegPostAd
         * @memberof game.register
         */
        toRegPostAd: function( options ) {
            //改为统一调用Box.User下的方法
            var that = this, url = location.href;
            options.source = url.indexOf("a=register") > 0 ? 3 : url.indexOf("a=index") > 0 ? 1 : url.indexOf("a=login") > 0 ? 0 : 2;
            options.fail = function(res, options){
                that.doing = false;
                that.showError(res.message);
            }
            return Box.User.toRegPostAd(options);
        },
        /**
         * 注册输入框焦点获取时的处理
         * @param dom {object} 将要获取焦点的输入框的jquery对象
         * @param ipt {string} 在上一个输入框的id值
         * @function inputFocus
         * @memberof game.register
         */
        inputFocus: function( dom, ipt ) {
            $( dom ).hide().next().addClass( "input-focus" ).show().focus();
            if ( dom.id === "reg-username-s" || dom.id === "reg-phone-s" ) {
                game.login.cursorPosition( $( dom ).next() );
            }
        },
        /**
         * 注册输入框焦点失去时的处理
         * @param dom {object} 输入框的jquery对象
         * @function inputBlur
         * @memberof game.register
         */
        inputBlur: function( dom, $this ) {
            var rule = dom.getAttribute( "data-rule" );
            if ( rule && !game.noCheckPwd ) { // 如果已经显示推荐账号，不重复验证
                $this.$regMsg && $this.$regMsg.html( "" );
                game._validate.checkField( dom, rule, $this );
            }
            game.noCheckPwd = false;
            if( dom.value == "" ) {
                $( dom ).hide().prev().show();
            }
            $( dom ).removeClass( "input-focus" );
        },

        setRegData: function( param ) {
            param = param || {};
            game.data = $.extend( DefaultDataMeta, param );
            if("gameid" in param && +param.gameid > 0){
                game.data.game_id = param.gameid;
            }
            game.data.version = game.data.version.toString().indexOf("gb_") > -1 ? game.data.version : "gb_"+game.data.version;
            game.initSwitchAnth(param.refer);
        },
        showError:function(msg, $this){
            var $msg = this.$div.hasClass("hide") ? this.$anthMsg : $this.$regMsg;
            $msg.html(msg);
        }
    },
    accountRegister: {
        key: "account",
        init: function() {
            var _this = this;
            this.$div = $( "#form-account" );
            if(!this.$div.parent().hasClass("hide") && game.regStep === 0){
                this.isNeedVerifyCode();
            }

            // 缓存DOM
            this.$username = $( "#reg-username" ); //用户名
            this.$password = $( "#reg-password" ); //密码
            this.$password1 = $( "#reg-password2" ); //确认密码
            this.$regName = $( "#reg-name" );// 姓名
            this.$regCard = $( "#reg-card" );// 身份证
            this.$codeTip = $( "#reg-verify"); //验证码
            this.$verifyCode = $("#reg-verify-code"); //验证码input
            this.$regMsg = $( "#reg-msg"); //提示
            this.$checkbox = $( "#checkbox-agreement" ); // 用户协议
            this.$recomAlert = $("#recom-alert");

            // 验证码初始化
            this.regVC = new SQ.Login.NewVerify({
                type: "reg",
                state: {
                    normal: "",
                    right: "",
                    error: "input-w",
                    pending: "input-w"
                },
                showVC: function() {
                    return _this.$codeTip;
                },
                open: function(opts) {
                    this.codeTip.removeClass("hide");
                    this.codeInput = _this.$verifyCode;
                    this.$state = _this.$codeTip.find("input");
                }
            });

            this.event();
        },
        event: function () {
            var _this = this;
            this.$div.off("click").off("keyup");

            this.$div
                // 回车键注册
                .on("keyup.reg",function(event){
                    if(event.keyCode === 13){
                        game.register.submitReg(game.accountRegister);
                    }
                })
                // 点击注册
                .on( "click.game", "#btn-reg", function()  {
                    game.register.submitReg(game.accountRegister);
                })
                //隐藏帐号处理
                .on( "click.account-close", "span.input-alert-close", function() {
                    $( "#recom-alert" ).hide();
                })
                //帐号列表，选择帐号后的处理
                .on( "click.account", "#recom-alert-ul a", function() {
                    var account = $( this ).html(),
                        $regDom = _this.$username,
                        rule = $regDom.attr( "data-rule" );
                    $regDom.val( account ).focusin();
                    //game._validate.showRight( $regDom[0] );
                    game.accountRegister.$regMsg.html( "" );
                    game._validate.checkField( $regDom[0], rule, game.accountRegister );
                    $( "#recom-alert" ).hide();
                    $( "#ascrail2001" ).hide();
                });
        },
        /**
         * 检查是否需要输入验证码
         */
        isNeedVerifyCode:function(){
            var _this = this;
            var $recomAlert = $( "#recom-alert");

            if(!Box.Client.isOfficial){
                _this.regVC.close();
                return ;
            }
            $.ajax({
                url: 'http://my.37.com/api/register.php?action=isOpenVerify',
                type: 'GET',
                dataType: 'jsonp'
            })
            .done(function(data) {
                if(data.code === 1){
                    _this.regVC.open();
                    $recomAlert.addClass("reg-recom-alert");
                    game.accountRegister.$regMsg.addClass("msg-2");
                }else{
                    _this.regVC.close();
                    $recomAlert.removeClass("reg-recom-alert");
                    game.accountRegister.$regMsg.removeClass("msg-2");
                }
            })
            .fail(function() {

            });
        },
        /**
         * 推荐帐号下拉框的处理
         * @function recomAccount
         * @memberof game.register
         */
        recomAccount: function() {
            /*if ( game.sRecom != 2 ) {
                return;
            }*/
            var temp = [],
                $recomAlert = $( "#recom-alert"),
                $recomAlertUl = $( "#recom-alert-ul"),
                account_list = game.remote.list;
            if ( account_list.length <= 0 ) {
                return;
            }
            game.noCheckPwd = true;
            game.sRecom = 0;
            temp.push( "<li class='input-alert-txt'><span class='input-alert-close ico ico-3'></span>推荐您使用：</li>" );
            for ( var a = 0; a < account_list.length; a++ ) {
                temp.push( "<li class='input-alert-li'><a class='reg-account'>" + account_list[ a ] + "</a><span class='input-alert-radio'></span></li>" );
            }
            $recomAlertUl.html( temp.join("") );
            if( account_list.length > 4 ) {
                $recomAlertUl.height(100).niceScroll({
                    cursorcolor:"#cbd0d5",horizrailenabled:false,cursorwidth:"8px"
                });
            }
            $recomAlert.show();
            game.accountRegister.$regMsg.blur().focus();
        }
    },
    phoneRegister: {
        key: "phone",
        init: function() {
            var _this = this;
            this.$div = $( "#form-phone" );
            // 缓存DOM
            this.$username = this.$phonename = $( "#reg-phone" );
            this.$password = $( "#p-reg-password" ); //密码
            // this.$password1 = $( "#p-reg-password2" ); //确认密码
            this.$checkbox = $( "#p-checkbox-agreement" ); // 用户协议
            this.$regMsg = $( "#p-reg-msg"); //提示
            this.$codeTip = $( "#p-reg-verify"); //验证码
            this.$verifyCode = $( "#p-reg-verify-code" ); //验证码input
            this.$sendCodeBtn = $( "#r-sendcode" ); //发送短信按钮
            this.$p_verifyCode = $( "#r-p-verify-code" ); //短信input

            this.$regName = $( "#p-reg-name" );// 姓名
            this.$regCard = $( "#p-reg-card" );// 身份证


            // 验证码初始化
            this.regVC = new SQ.Login.NewVerify({
                type: "p-box-reg",
                state: {
                    normal: "",
                    right: "",
                    error: "input-w",
                    pending: "input-w"
                },
                showVC: function() {
                    return _this.$codeTip;
                },
                open: function(opts) {
                    this.codeTip.removeClass("hide");
                    this.codeInput = _this.$verifyCode;
                    this.$state = _this.$codeTip.find("input");
                }
            });
            this.regVC.open();

            this.event();
        },
        event: function () {
            var _this = this;
            this.$div.off("click").off("keyup");

            this.$div
                // 回车键注册
                .on("keyup.reg",function(event){
                    if(event.keyCode === 13){
                        game.register.submitReg(game.phoneRegister);
                    }
                })
                // 点击注册
                .on( "click.game", "#p-btn-reg", function()  {
                    game.register.submitReg(game.phoneRegister);
                });

            this.$sendCodeBtn.on("click", function(e){
                _this.sendCode( $(this) );
            });
        },
        sendCode: function( $m ) {
            var _this = this;
            if ( $m.hasClass( "pending" ) ) {
                return;
            }
            //验证手机
            if ( game._validate.checkField( this.$phonename[0], "phone", game.phoneRegister, false ) !== true ) {
                this.$phonename.focus();
                return;
            }
            //验证验证码
            if ( game._validate.checkField( this.$verifyCode[0], "code", game.phoneRegister, false ) !== true ) {
                this.$verifyCode.focus();
                return;
            }
            $m.addClass( "pending" ).html( "处理中.." );
            SQ.Login.sendCode({
                button: $m,
                data: {
                    phone: this.$phonename.val(),
                    save_code: this.$verifyCode.val()
                },
                suc: function(res, count){
                    _this.sendCodeSucc($m, res, count );
                },
                fal: function(res){
                    var msg = "获取失败，请稍后尝试";
                    if ( res ) {
                        if ( +res.code === -1 || +res.success === -1 ) {
                            // game.phoneRegister.$verifyCode.val( "" ).focus();
                        }
                        if ( res.msg || res.message ) {
                            msg = res.msg || res.message;
                        }
                    }

                    game.phoneRegister.$regMsg.html(msg);
                    $m.removeClass( "pending" ).html( "发送短信" );
                    game.phoneRegister.regVC.refreshImg();
                },
                countEnd: function($m) {
                    $m.removeAttr( "disabled" );
                    $m.removeClass( "pending" ).html( "发送短信" );
                }
            });
        },
        sendCodeSucc: function($m, res, count) {
            $m.attr( "disabled", "disabled" );
            count && count.start();
        }
    },

    /**
     * 验证
     * @namespace game._validate
     */
    _validate: {
        /**
         * 所有符号条件的输入框逐一检查
         * @param c {object} 注册页的jquery对象
         * @function check
         * @memberof game._validate
         */
        check: function( c, $this ) {
            var that = this,
                data = {},
                prevent = false;

            c.find( "input[data-rule]" ).each(function() {
                var rule = this.getAttribute( "data-rule" );

                if ( rule && that[rule] ) {
                    if ( rule === "code" && !$this.regVC.isOpen ) {
                        prevent = false;
                    } else {
                        if ( !prevent ) {
                            var result = that.checkField( this, rule, $this, this.id != "reg-username" );
                            prevent = (result !== true);
                            if ( this.type !== "checkbox" ) {
                                data[ this.name ] = $.trim( this.value );
                            }
                            return !prevent;
                        }
                    }
                }
            });

            if ( !prevent && !game.pending && !game.pendingN && !game.pendingW ) {
                return true;
            }else{
                return false;
            }
        },
        /**
         * 单独输入框的检查处理
         * @param field {object} 输入框的对象
         * @param rule {string} 需要验证的类型
         * @param isRecom {boolean} 可选，是否显示推荐帐号
         * @returns {boolean/string} 验证后的返回值，正确返回true，错误返回提示信息
         * @function checkField
         * @memberof game._validate
         */
        checkField: function( field, rule, $this, isRecom ) {
            isRecom = isRecom || true;
            var ret = this[ rule ].call( field, field.value, field.id == "reg-username", $this );
            if ( ret !== true ) {
                this.showError.call($this, field, ret );
            } else {
                // '用户名'要额外验证
                if ( field.id === "reg-username" || field.id === "reg-phone" ) {

                    if ( field.id === "reg-phone" ) {
                        isRecom = false;
                    }

                    //官方端需要验证账号是否重复，推广端不需要
                    if(Box.Client.isOfficial){
                        ret = this.checkAccount( field, isRecom, $this );
                    }else{
                        this.showRight.call($this, field );
                    }
                } else if ( field.id === "reg-name" ) {
                    // '真实姓名'要额外验证
                    ret = this.checkRealname( field, this );
                } else if ( field.id === "reg-password" ) {
                    // 验证弱密码
                    ret = this.checkWeakPassword( field, this );
                } else if ( field.id === "p-reg-password" ) {
                    // 验证弱密码
                    ret = this.checkWeakPassword( field, this );
                } else {
                    this.showRight.call($this, field );
                }
            }

            return ret;
        },
        /**
         * 验证真实姓名的处理
         * @param  {[type]} field [description]
         * @param  {[type]} that  [description]
         * @return {[type]}       [description]
         */
        checkRealname: function( field ) {
            var that = this,
                v = field.value,
                callback = false,
                valid = $.data( field, "validN" ),
                inValid = $.data( field, "invalidN" );

            // 当前方法作用的对象
            var $this = game.accountRegister;

            if ( !game.remoteN ) {
                game.remoteN = {};
            }

            game.remoteN.inValid = inValid;
            game.remoteN.valid = valid;

            that.pendingN = true;

            if ( valid === v  ) {
                game.pendingN = false;
                that.showRight.call( $this, field );
                return true;
            }

            if ( inValid === v ) {
                that.showError.call( $this, field, game.remoteN.msg );
                return false;
            }

            that.showPending.call( $this, field, "正在验证姓名是否可用……" );

            SQ.Login.checkWords( v, "name" ).done(function( data ) {
                if ( data ) {
                    if ( data.code === -1 ) {
                        that.showError.call( $this, field, (game.remoteN.msg = data.msg) );
                        $.data( field, "invalidN", v );
                        callback = true;
                    } else {
                        that.showRight.call( $this, field );
                        $.data( field, "validN", v );
                        game.pendingN = false;
                    }
                }
            }).fail(function() {
                that.showFail.call($this, field, "网络出现异常，请稍后再试！" );
            });

            return callback;
        },
        checkWeakPassword: function( field ) {
            var that = this,
                v = field.value,
                callback = false,
                valid = $.data( field, "validW" ),
                inValid = $.data( field, "invalidW" ),
                acc = "";

            if ( field.getAttribute( "data-target" ) && $( field.getAttribute( "data-target" ) ).length > 0 && $( field.getAttribute( "data-target" ) ).val() ) {
                acc = $( field.getAttribute( "data-target" ) ).val();
            }
            // 当前方法作用的对象
            var $this = game.accountRegister;
            if ( field.id === "p-reg-password" ) {
                $this = game.phoneRegister;
            }

            if ( !game.remoteW ) {
                game.remoteW = {};
            }

            game.remoteW.inValid = inValid;
            game.remoteW.valid = valid;

            that.pendingW = true;

            if ( valid === v ) {
                game.pendingW = false;
                that.showRight.call( $this, field );
                return true;
            }

            if ( inValid === v ) {
                that.showError.call( $this, field, game.remoteW.msg );
                return false;
            }

            that.showPending.call( $this, field, "正在验证密码是否可用……" );

            SQ.Login.weakPasswords( {
                login_account: acc,
                password: v
            } ).done( function( data ) {
                if ( data ) {
                    if ( data.code !== 1 ) {
                        that.showError.call( $this, field, ( game.remoteW.msg = data.msg ) );
                        $.data( field, "invalidW", v );
                        callback = true;
                    } else {
                        that.showRight.call( $this, field );
                        $.data( field, "validW", v );
                        game.pendingW = false;
                    }
                }
            } ).fail( function() {
                that.showFail.call( $this, field, "网络出现异常，请稍后再试！" );
            } );

            return callback;
        },
        /**
         * 验证帐号的处理
         * @param field {object} 输入框的对象
         * @param isRecom {boolean} 是否显示推荐帐号，true：显示；false：不显示
         * @returns {boolean} 处理后的值
         * @function checkAccount
         * @memberof game._validate
         */
        checkAccount: function( field, isRecom, $this ) {
            var that = this,
                v = field.value,
                callback = false,
                valid = $.data( field, "valid" ),
                inValid = $.data( field, "invalid" );

            if ( !game.remote ) {
                game.remote = {};
            }

            game.remote.inValid = inValid;
            game.remote.valid = valid;

            game.pending = true;
            that.showPending.call( $this, field, "正在验证用户名是否可用……" );

            if ( valid === v  ) {
                game.pending = false;
                if ( isRecom ) {
                    game.accountRegister.$recomAlert.hide();
                }
                that.showRight.call( $this, field );
                return true;
            }

            if ( inValid === v ) {
                that.showError.call( $this, field, game.remote.msg );
                if ( isRecom && game.remote.list ) {
                    game.accountRegister.recomAccount();
                }
                return false;
            }

            that.checkAjax( "word", {
                words: v,
                field: "account"
            }).done(function( data ) {
                if ( data ) {
                    if ( data.code === -1 ) {
                        that.showError.call( $this, field, (game.remote.msg = data.msg) );
                        $.data( field, "invalid", v );
                    } else {
                        that.checkAjax( "user", {
                            login_account: v,
                            mode: "1"
                        }).done(function( res ) {
                            if ( res ) {
                                if ( res.code === -1 ) {
                                    that.showError.call( $this, field, (game.remote.msg = res.msg) );
                                    game.remote.list = res.data.list;
                                    $.data( field, "invalid", v );
                                    if ( isRecom && game.remote.list ) {
                                        game.accountRegister.recomAccount();
                                    }
                                    callback = true;
                                } else {
                                    if ( isRecom ) {
                                        game.accountRegister.$recomAlert.hide();
                                    }
                                    that.showRight.call( $this, field );
                                    $.data( field, "valid", v );
                                    game.pending = false;
                                }
                            }
                        }).fail(function() {
                            that.showFail.call($this, field, "网络出现异常，请稍后再试！" );
                        });
                    }
                }
            }).fail(function() {
                that.showFail.call($this, field, "网络出现异常，请稍后再试！" );
            });
            return callback;
        },
        /**
         * 验证帐号的ajax
         * @param checkType {string} 接口类型，值为user：是否已注册；值为其他：是否有敏感词
         * @param data {json} 接口传入的参数
         * @returns {*} ajax对象
         * @function checkAjax
         * @memberof game._validate
         */
        checkAjax: function( checkType, data ) {
            return $.ajax({
                url: ( checkType == "user" ) ? game.checkUserUrl : game.checkWordsUrl,
                dataType: "jsonp",
                data: data,
                async: false,
                timeout: 1000
            });
        },
        /**
         * 调用接口时等待时的信息提示
         * @param field {object} 输入框的对象
         * @param mess {string} 提示的信息
         * @function showPending
         * @memberof game._validate
         */
        showPending: function( field, mess ) {
            this.$regMsg && this.$regMsg.html( mess );
            $.data( field, "res", "pending" );
        },
        /**
         * 正确时的提示
         * @param field {object} 输入框的对象
         * @function showRight
         * @memberof game._validate
         */
        showRight: function( field ) {
            game.inputStatus( $( field ), "r" );
            this.$regMsg && this.$regMsg.html( "　" );
            $.data( field, "res", "right" );
        },
        /**
         * 错误时的信息提示
         * @param field {object} 输入框的对象
         * @param mess {string} 提示的信息
         * @function showError
         * @memberof game._validate
         */
        showError: function( field, mess ) {
            game.inputStatus( $( field ), "w" );
            this.$regMsg && this.$regMsg.html( mess );
            $.data( field, "res", "error" );
        },
        /**
         * 初始状态的信息提示
         * @param field {object} 输入框的对象
         * @param mess {string} 提示的信息
         * @function showFail
         * @memberof game._validate
         */
        showFail: function( field, mess ) {
            game.inputStatus( $( field ), "" );
            this.$regMsg && this.$regMsg.html( mess );
        },
        /**
         * 验证帐号是否合法
         * @param value {string} 帐号
         * @param regFlag {boolean} 是否严格验证
         * @returns {*} 验证后的返回值，正确返回true，错误返回提示信息
         * @function username
         * @memberof game._validate
         */
        username: function( value, regFlag ) {
            if ( SQ.Login.Validate.phone(value) === true ) {
                // 设置标识
                game.regStep = 1;
                // 切换内容
                $(".form-content").hide().eq(1).show();
                game.phoneRegister.regVC.refreshImg();
                game.phoneRegister.regVC.codeTip.find("input").removeClass("input-w");

                game.phoneRegister.$phonename.val(value).prev().focus();
                game.phoneRegister.$regMsg.html("您填写的是手机号，已为您切换到手机注册");

                return "您填写的是手机号，建议您使用手机注册";
            }
            return  SQ.Login.checkUsername( value, regFlag );
        },
        /**
         * 验证姓名是否合法
         * @param  {string} value 姓名
         * @return {*}      验证后的返回值，正确返回true，错误返回提示信息
         */
        realname: function( value ) {
            return SQ.Login.Validate.realname(value);
        },
        /**
         * 身份证验证
         * @param  {string} idcard 身份证号
         * @return {*}       验证后的返回值，正确返回true，错误返回提示信息
         */
        card: function( idcard ) {
            return SQ.Login.Validate.card(idcard);
        },
        /**
         * 验证手机号码是否合法
         * @param  {string} phoneNumber 手机号
         * @return {*}       验证后的返回值，正确返回true，错误返回提示信息
         */
        phone: function( phoneNumber ) {
            return SQ.Login.Validate.phone(phoneNumber);
        },
        /**
         * 验证密码是否合法
         * @param value {string} 密码
         * @returns {*} 验证后的返回值，正确返回true，错误返回提示信息
         * @function password
         * @memberof game._validate
         */
        password: function( value ) {
            var ret = SQ.Login.checkPassword( value ),
                methods = {
                    same: function( value ) {
                        return /^([0-9a-zA-Z])\1{5,19}$/.test( value ) ? "密码不能全为相同字符" : true;
                    },
                    continual: function( value ) {
                        var c, p,
                            inc = true,
                            dec = true;
                        for ( var i = 1, n = value.length; i < n; i++ ) {
                            c = value.charAt( i - 1 );
                            p = value.charAt( i );
                            if ( inc && String.fromCharCode( c.charCodeAt() + 1 ) != p ) {
                                inc = false;
                            }
                            if ( dec && String.fromCharCode( c.charCodeAt() - 1 ) != p ) {
                                dec = false;
                            }
                        }
                        return ( inc || dec ) ? "密码不能为连续字符" : true;
                    },
                    noeq: function( value ) {
                        if ( this.getAttribute( "data-target" ) && $( this.getAttribute( "data-target" ) ).length > 0 && $( this.getAttribute( "data-target" ) ).val() === value ) {
                            return "密码和帐号不能完全相同";
                        }
                        return true;
                    },
                    samenum: function( value ) {
                        return /^[0-9]+$/.test( value ) ? "密码过于简单，请尝试“字母+数字”的组合" : true;
                    },
                    samestr: function( value ) {
                        return /^[a-zA-Z]+$/.test( value ) ? "密码过于简单，请尝试“字母+数字”的组合" : true;
                    }
                };
            if ( ret === true ) {
                var strict = this.getAttribute("data-strict"); //data-strict="same,continual"
                //20210616增加弱密码判断
                strict = strict ? ( strict + ",noeq,samenum,samestr" ) : "noeq,samenum,samestr";
                if ( strict ) {
                    var stricts = strict.split( "," );
                    for (var i = 0; i < stricts.length; i++ ) {
                        var m = methods[ stricts[ i ] ];
                        if ( m ) {
                            ret = m.call( this, value );
                        }

                        if ( ret !== true ) {
                            return ret;
                        }
                    }
                }
            }
            return ret;
        },
        /**
         * 二次密码是否合法
         * @param value {string} 密码
         * @returns {string} 验证后的返回值，正确返回true，错误返回提示信息
         * @function eq
         * @memberof game._validate
         */
        eq: function( value ) {
            return value === "" ? "请确认密码" : ( $( this.getAttribute("data-target") ).val() !== value ? "输入的密码不一致" : true );
        },
        /**
         * 验证码是否合法
         * @param value {string} 验证码
         * @returns {*} 验证后的返回值，正确返回true，错误返回提示信息
         * @function code
         * @memberof game._validate
         */
        code: function( value, regFlag, $this ) {

            if ( value === "" ) {
                return "验证码不能为空";
            }

            if ( !/^[A-Za-z0-9]{4}$/.test(value) ) {
                return "请输入正确的验证码";
            }

            if ( $this && $this.regVC && !$this.regVC.check() ) {
                return "请输入正确的验证码";
            }

            return true;
        },
        /**
         * 手机短信验证码6位数字验证
         * @param value {string} 验证码
         * @returns {*} 验证后的返回值，正确返回true，错误返回提示信息
         * @function vcode
         * @memberof game._validate
         */
        vcode: function( value ) {
            return SQ.Login.Validate.vcode(value);
        },
        /**
         * 密码等级的分数
         * @param pwd {string} 密码
         * @returns {number} 处理后的分数
         * @function passwordGrade
         * @memberof game._validate
         */
        passwordGrade: function( pwd ) {
            var score = 0,
                regexArr = ['[0-9]', '[a-z]', '[A-Z]', '[\\W_]'],
                repeatCount = 0,
                prevChar = '',
                i, num;

            //check length
            var len = pwd.length;
            score += len > 20 ? 20 : len;

            //check type
            for ( i = 0, num = regexArr.length; i < num; i++) {
                if (eval('/' + regexArr[i] + '/').test(pwd)) score += 4;
            }

            //bonus point
            for ( i = 0, num = regexArr.length; i < num; i++) {
                if (pwd.match(eval('/' + regexArr[i] + '/g')) && pwd.match(eval('/' + regexArr[i] + '/g')).length >= 2) score += 2;
                if (pwd.match(eval('/' + regexArr[i] + '/g')) && pwd.match(eval('/' + regexArr[i] + '/g')).length >= 5) score += 2;
            }

            //deduction
            for ( i = 0, num = pwd.length; i < num; i++) {
                if (pwd.charAt(i) == prevChar) repeatCount++;
                else prevChar = pwd.charAt(i);
            }
            score -= repeatCount;

            return score;
        }
    },

    /**
     * jsonp的ajax调用
     * @param url {string} 地址
     * @param options {json} 传入参数
     * @function Jsonp
     * @memberof game
     */
    Jsonp: function( url, options ) {
        var s = options.success || $.noop,
            f = options.fail || $.noop;

        delete options.success;
        delete options.fail;

        $.get( url, options, function( res ) {
            s.call( game, res );
        }, "jsonp" )
            .fail(function( res ) {
                f.apply( game, arguments );
            });
    }
};

window.game = game;

$(document).ready(function($) {
    if ($('.accredit-container').length > 0) {
        game.initThirdLog();//第三方登录的回调页面初始化
    } else {
        game.init();//账号密码登录框页面初始化
    }

    //TOKEN登录初始化
    game.initTokenLog();
});

});
