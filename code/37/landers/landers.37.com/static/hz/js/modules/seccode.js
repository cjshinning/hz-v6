/**
 * Created by Administrator on 2015/12/22.
 */
require.config({
    baseUrl: "../static/hz/js",
    urlArgs: "t=2017051701VER&c=c",
    paths: {
        "jQuery": "lib/landers.core",
        "sq.core": "lib/sq.core",
        "sq.tab": "http://ptres.37.com/js/sq/widget/sq.tab",
        "sq.statis": "http://ptres.37.com/js/sq/widget/sq.statis",
        "sq.tooltip": "http://ptres.37.com/js/sq/widget/sq.tooltip",
        "jQuery.nicescroll": "http://ptres.37.com/js/sq/plugin/jquery.nicescroll.min",
        "sq.login": "http://ptres.37.com/js/sq/widget/sq.login2015",
        "placeholder": "http://ptres.37.com/js/jquery.placeholder.min",
        "box": "modules/box",
        "tgreg":"modules/tgreg",
        "client": "client",
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
require(["sq.core", "client", "jQuery.nicescroll", "placeholder", "sq.login"], function(SQ, client) {
    var Seccode = new SQ.Class();
    Seccode.include({
        urlCode:'http://my.37.com/code.php?from=2&t=',
        urlCodeCheck:'http://my.37.com/code_check.php',
        urlLogin:'http://my.37.com/api/login.php?action=login',
        query:{},
        init:function(){
            //将url参数转换为json保存
            this.query = SQ.queryToJson(location.href);
            this.getDom();
            this.events();
        },
        /**
         * 初始化dom
         */
        getDom:function(){
            this.dom = {
                $form:$("form.form1"),
                $username:$("#username"),
                $pwd:$("#iptPwd"),
                $code:$("#iptCode"),
                $codeimg:$("#code_img"),
                $clear:$("a.icon-clear"),
                $err:$("p.error")
            };
            this.now = new Date().getTime();
            this.dom.$username.html(this.query.login_account);
            this.dom.$pwd.placeholder();
            this.dom.$code.placeholder();
            this.dom.$codeimg.attr("src",this.urlCode+this.now);
        },
        /**
         * 所有事件绑定
         */
        events:function(){
            var _this = this;
            this.dom.$form
                .focusin($.proxy(this.evtFocusIn,_this))
                .focusout($.proxy(this.evtFocusOut,_this))
                .on("click","#code_img", $.proxy(_this.refreshCode,_this))
                .on("click","a.bg-btn",$.proxy(this.evtSubmit,_this))
                .on("click","a.icon-clear",function(event){
                    event.preventDefault();
                    event.stopPropagation();
                    if(_this.dom.$pwd.val()){
                        _this.dom.$pwd.val("");
                        $(this).hide();
                    }
                })
                .on("keyup.submit",function(event){
                    if ( event.keyCode === 13 ) {
                        _this.evtSubmit(event);
                        return;
                    }
                })
                .on("keyup.code","#iptCode",function(event){
                    var $this = $(this);
                    if($this.val().length < 4) {
                        return;
                    }
                    _this.verifyCode();
                })
                .on("keyup.code","#iptPwd",function(event){
                    var $this = $(this);
                    if($this.val().length < 1) {
                        _this.dom.$clear.hide();
                    }else{
                        _this.dom.$clear.show();
                    }
                })
        },
        /**
         * form中的所有focusin事件
         * @param event
         */
        evtFocusIn:function(event){
            var $target = $(event.target),
                _this = this;
            if($target.prop("nodeName") !== "INPUT"){
                return;
            }
            if($target.is(_this.dom.$code)){
                _this.setCodeFocus($target);
            }else{
                _this.setPwdFocus();
            }
        },
        /**
         * form中的所有focusout事件
         * @param event
         */
        evtFocusOut:function(event){
            var $target = $(event.target),
                _this = this;
            event.preventDefault();
            event.stopPropagation();
            if($target.prop("nodeName") !== "INPUT"){
                return;
            }
            if($target.is(_this.dom.$code)){
                _this.setCodeDefault($target);
            }else{
                _this.verifyPwd();
            }
        },
        /**
         * 点击提交按钮的事件处理
         */
        evtSubmit:function(event){
            var _this = this;
            event.preventDefault();
            event.stopPropagation();
            if(_this.verifyPwd()){
                _this.verifyCode(true).done($.proxy(_this.toLogin,_this));
            };
        },
        setPwdDefault:function(){
            this.dom.$pwd.removeClass().addClass("form-control bg-input");
            this.clearErr();
        },
        setPwdFocus:function(){
            this.dom.$pwd.removeClass().addClass("form-control bg-input-focus");
        },
        setPwdErr:function(){
            this.dom.$pwd.removeClass().addClass("form-control bg-input-error");
        },
        setCodeDefault:function($target){
            $target.removeClass().addClass("form-control bg-input-sm");
            if($target.val() === $target.attr("placeholder")){
                $target.val('');
            }
        },
        setCodeFocus:function($target){
            $target.removeClass().addClass("form-control bg-input-sm-focus");
        },
        setCodeErr:function(){
            this.dom.$code.focus().removeClass().addClass("form-control bg-input-sm-error");
        },
        /**
         * 刷新验证码
         */
        refreshCode:function(){
            var _this = this;
            _this.now = new Date().getTime();
            _this.dom.$codeimg.attr("src",_this.urlCode+_this.now);
            _this.dom.$code.val("");
        },
        /**
         * 显示错误信息
         */
        showErrMsg:function(msg){
            this.dom.$err.html(msg);
        },
        /**
         * 清空错误信息
         */
        clearErr:function(){
            this.dom.$err.empty();
        },
        /**
         * 验证密码
         */
        verifyPwd:function(){
            //验证密码不能小于6位
            var _this = this, pwd = this.dom.$pwd.val();
            if(pwd.length<6){
                if(!pwd){
                    _this.showErrMsg("密码不能为空");
                }else{
                    _this.showErrMsg("密码由6~20位数字、字母或特殊字符组成")
                }
                _this.setPwdErr();
                return false;
            }else{
                _this.setPwdDefault();
                return true;
            }
        },
        /**
         * 检查验证码是否正确
         * @param justNumber 是否只检查验证码填入的字符数量
         * @returns {*}
         */
        verifyCode:function(justNumber){
            var _this = this,code = _this.dom.$code.val();
            var dtd = $.Deferred();
            //先判断验证码字符数量是否正确
            if(code.length < 4){
                setTimeout(function(){
                    _this.showErrMsg("请输入正确的验证码。");
                    _this.setCodeErr();
                    dtd.reject();
                },1);
                return dtd.promise();
            }
            //如果只验证填入的字符数量，则在字符数量验证成功后就返回正确信息
            if(justNumber){
                setTimeout(function(){
                    _this.clearErr();
                    _this.setCodeDefault(_this.dom.$code);
                    dtd.resolve();
                },1);
                return dtd.promise();
            }
            //再异步验证验证码是否正确
            $.ajax({
                url: _this.urlCodeCheck,
                type: 'GET',
                dataType: 'jsonp',
                data: {
                    save_code: code,
                    from: 2
                }
            })
            .done(function(result) {
                if(result.code === 0){
                    _this.clearErr();
                    _this.setCodeDefault(_this.dom.$code);
                    dtd.resolve();
                }else{
                    _this.showErrMsg(result.msg);
                    _this.setCodeErr();
                    dtd.reject();
                }
            })
            .fail(function() {
                _this.showErrMsg("数据连接出错，请重试");
                    dtd.reject();
            });

            return dtd.promise();
        },
        /**
         * 调用接口，登录
         * @returns {*}
         */
        toLogin:function(){
            var _this = this;
            this.query.password = this.dom.$pwd.val();
            this.query.save_code = this.dom.$code.val();
            this.query.xh_page_ajax = 1;

            /**登录来源统计**/
            this.query.tj_from = 106;
            this.query.tj_way = 1;

/*            SQ.Login.on("loged",function(){
                alert("loged");
            });
            SQ.Login.on("fail",function(){
                alert("fail");
            });
            SQ.Login.on("timeout",function(){
                alert("timeout");
            });*/
            SQ.Login.toLog(_this.query)
            .done(function(result) {
                if(result.code === 0){
                    if(!result.data.url){
                        _this.showErrMsg("登录成功，但服务器出错，请联系客服");
                        return;
                    }
                    //alert(result.data.url);
                    location.href=result.data.url;
                }else{
                    _this.showErrMsg(result.msg);
                    _this.refreshCode();
                    if(result.code === -2){
                        _this.setPwdErr();
                        _this.dom.$pwd.focus();
                    }else if(result.code === -7){
                        _this.setCodeErr();
                    }
                }
            })
            .fail(function() {
                _this.showErrMsg("数据连接出错，请重试")
            });
            /*return $.ajax({
                url: _this.urlLogin,
                type: 'GET',
                dataType: 'jsonp',
                data: _this.query
            })
                .done(function(result) {
                    if(result.code === 0){
                        if(!result.data.url){
                            _this.showErrMsg("登录成功，但服务器出错，请联系客服");
                            return;
                        }
                        //alert(result.data.url);
                        location.href=result.data.url;
                    }else{
                        _this.showErrMsg(result.msg);
                        _this.refreshCode();
                        if(result.code === -2){
                            _this.setPwdErr();
                            _this.dom.$pwd.focus();
                        }else if(result.code === -7){
                            _this.setCodeErr();
                        }
                    }
                })
                .fail(function() {
                    _this.showErrMsg("数据连接出错，请重试")
                });*/
        }
    });
    $(document).ready(function(){
        new Seccode();
    });
});
