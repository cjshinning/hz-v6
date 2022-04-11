;
(function($, SQ, undefined) {
    var FestiveSign = {
        //新春签到活动接口
        api: {
            //web签到接口
            "signForWeb": "http://shop.37.com/sign/index.php?action=sign",
            //盒子活动签到接口
            "signForBox": "http://hdapi.37.com/?c=c_sign&a=sign&alias_info=ptcj20180125&feature_key=sign_1&f=auto",
            //获取用户在盒子签到的信息
            "getSignInfo": "http://hdapi.37.com/?c=api&a=box_default_info&alias_info=ptcj20180125&f=d201801/ptcj20180125"
            //"getGoldenEgg": "http://hdapi.37.com/?c=c_lottery_normal&a=get_chance_times&alias_info=springfestival20170104&feature_key=lottery&f=auto"
        },
        //37网游节活动接口
        api37: {
            //web签到接口
            "signForWeb": "http://shop.37.com/sign/index.php?action=sign",
            //盒子活动签到接口
            "signForBox": "http://hdapi.37.com/?c=c_sign&a=sign&alias_info=game37main20180206&feature_key=sign_1&f=auto",
            //获取用户在盒子签到的信息
            "getSignInfo": "http://hdapi.37.com/?c=api&a=box_default_info&alias_info=game37main20180206&f=d201802/game37main20180206",
            "getGoldenEgg": "http://hdapi.37.com/?c=api&a=get_group_free_times&alias_info=sanqijie20180122&f=d201801/sanqijie20180122"
        },
        //新春签到样式
        css: '<style>' +
            '.fes-dialog{width:100%;height:100%;text-align:center;}.festive-sign{width:100%;height:450px;float:left;background:url("./festive_sign/festive_sign_bg.jpg") no-repeat left top;}.fes-main{width:100%;height:130px;float:left;margin-top:138px;}.fes-left{width:370px;height:130px;float:left;overflow:hidden;}' +
            '.fes-left ul{width:342px;height:130px;float:left;position:relative;left:20px;}.fes-sign-btn{width:62px;height:60px;float:left;position:relative;margin-right:6px;margin-bottom:10px;background:url("./festive_sign/nosign_day.png") no-repeat center top;_background-image:url("./festive_sign/nosign_day_p8.png");}' +
            '.fes-sign-yes{background:url("./festive_sign/sign_day.png") no-repeat center top;_background-image:url("./festive_sign/sign_day_p8.png");}.fes-day-num{width:62px;height:30px;line-height:30px;text-align:center;font-size:22px;color:#a54b48;display:block;float:left;position:absolute;top:9px;left:0;z-index:1;}' +
            '.fes-get-point{width:62px;height:20px;line-height:20px;*_line-height:22px;text-align:center;color:#fa4226;font-size:12px;display:block;float:left;position:absolute;top:40px;left:0;z-index:3;}.fes-sign-yes .fes-day-num{color:#ffec5e;}' +
            '.fes-sign-yes .fes-get-point{color:#fff;}.fes-right{width:140px;height:100px;float:left;margin-left:5px;margin-top:28px;overflow:hidden;}.fes-right ul{width:140px;height:100px;overflow-y:scroll;overflow-x:hidden;float:left;}' +
            '.fes-right ul li{width:100%;height:28px;float:left;color:#ec9696;overflow:hidden;}.fes-right ul li p span{color:#ff6e6a;}.fes-get-point-count{width:82px;height:12px;*_height:14px;line-height:12px;*_line-height:14px;text-align:left;display:block;float:left;}' +
            '.fes-get-golden-egg{width:40px;height:12px;*_height:14px;line-height:12px;*_line-height:14px;display:block;float:left;overflow:hidden;}.fes-middle{width:100%;height:50px;float:left;overflow:hidden;}' +
            '.fes-continue-sign{width:280px;height:50px;line-height:50px;text-align:left;position:relative;left:20px;font-size:14px;color:#fff;float:left;}.fes-continue-sign p{margin-top:10px;}.fes-continue-sign p span{color:#ffec5e;}' +
            '.fes-link-btn{width:230px;height:50px;float:left;position:relative;left:18px;overflow:hidden;}.fes-link-btn a{width:100px;height:30px;line-height:30px;*_line-height:32px;text-align:center;font-size:12px;font-weight:bold;color:#fffa7d;display:block;margin-top:20px;float:left;}' +
            '.fes-back-to-sign{margin-left:20px;}.fes-tips{width:480px;height:86px;float:left;overflow:hidden;margin-top:28px;position:relative;left:35px;display:none;}.fes-tips-main{font-size:12px;color:#4d080b;line-height:16px;}.fes-tips-main span{color:#8e00ad;}' +
            '.fes-show-sign-tips{width:240px;height:32px;line-height:32px;text-align:center;left:50%;margin-left:-120px;top:45%;position:absolute;display:none;font-size:14px;font-weight:bold;color:#c04643;z-index:999;background:#fffeb4;border:1px solid #c04643;}.fes-integral{top:53%;}' +
            '.fes-mgr{margin-right:14px;}.fes-sign-anim{position:absolute;top:0;left:0;z-index:2;}a.sq-dialog-close:hover{background-position:0 -30px}.fes-dialog-alert{height:auto;float:left;line-height:22px;}' +
            '.fes-dialog-masking{background-color:#000;left:0;opacity:.4;filter:alpha(opacity=40);position:absolute;top:0;z-index:1000;width:100%;height:100%;*_height:450px;}.fes-dialog-main{position:absolute;z-index:1001;padding:0;width:420px;color:#6c6c6c;left:50%;margin-left:-210px;top:50%;margin-top:-113px;}' +
            '.fes-dialog-avatar{display:none;z-index:1;width:22px;height:23px;position:absolute;top:7px;left:12px;background:url(http://img1.37wanimg.com/www/css/images/common/dialog2/bg-dialog-avatar.png) no-repeat;_background-image:url(http://img1.37wanimg.com/www/css/images/common/dialog2/bg-dialog-avatar-8.png);}' +
            '.fes-dialog-body{word-break:break-all;background-color:#fff;border:1px solid transparent;_border-color:#fff;border-radius:3px;box-shadow:inset 0 0 2px 1px #fff;}' +
            '.fes-dialog-titlebar{background-image:url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2YyZjJmMiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2U5ZTllOSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==);background-size:100%;background-image:-webkit-gradient(linear,50% 0,50% 100%,color-stop(0,#f2f2f2),color-stop(100%,#e9e9e9));background-image:-moz-linear-gradient(#f2f2f2,#e9e9e9);background-image:-webkit-linear-gradient(#f2f2f2,#e9e9e9);background-image:linear-gradient(#f2f2f2,#e9e9e9);background-color:#e9e9e9;position:relative;height:20px;color:#3c3c3c;padding:10px 0 10px 15px;}' +
            '.fes-dialog-client{background-color:#fff;padding:24px 14px 0;font-size:14px;*_line-height:20px;}.fes-dialog-client,.fes-dialog-content{margin-left:10px;margin-right:10px;}.fes-dialog-buttons{margin:0 10px 10px;background-color:#fff;padding-bottom:15px;text-align:center;}' +
            '.fes-dialog-titlebar-text{color:#3c3c3c;font-size:14px;}.fes-dialog-close{position:absolute;width:14px;height:13px;top:10px;right:15px;text-indent:-9999px;background:url(http://img1.37wanimg.com/www/css/images/common/dialog2/bg-dialog-close.png) no-repeat;_background-image:url(http://img1.37wanimg.com/www/css/images/common/dialog2/bg-dialog-close-8.png);}' +
            '.fes-dialog .btn-s-140{background:#ffab16;border-radius:4px;color:#fff;display:inline-block;text-align:center;overflow:hidden;}.fes-dialog .btn-s-140,.fes-dialog .btn-s-w{width:140px;height:36px;line-height:36px;font-size:16px;vertical-align: middle;}.fes-dialog-buttons a{margin-left:10px;margin-right:10px;}' +
            '</style>',
        //37网游节样式
        css37: '<style>' +
            '.fes-dialog{width:100%;height:100%;text-align:center;}'+
            '.sqfes-sign{font-family:"Microsoft Yahei";width:540px;height:452px;background:url("./festive_sign/gs_festive_sign_bg.jpg") no-repeat left top;overflow:hidden;}.sqfes-top{width:100%;height:50px;margin-top:66px;float:left;}.sqfes-top-title{width:100%;height:24px;line-height:24px;text-align:center;color:#ffe70a;font-size:16px;}.sqfes-top-time{width:100%;height:18px;line-height:18px;text-align:center;color:#c9e0ff;font-size:12px;}'+
            '.sqfes-main{width:100%;height:140px;float:left;}.sqfes-main ul{position:relative;left:6px;}.sqfes-sign-btn{width:130px;height:130px;float:left;position:relative;margin-top:5px;background:url("./festive_sign/sqfes_sign_btn.png") no-repeat 15px center;_background:url("./festive_sign/sqfes_sign_btn_8.png") no-repeat 15px center;}.sqfes-sign-no{background:url("./festive_sign/sqfes_sign_btn.png") no-repeat 15px center}.sqfes-sign-yes{background:url("./festive_sign/sqfes_sign_yes_btn.png") no-repeat 15px center;_background:url("./festive_sign/sqfes_sign_yes_btn_8.png") no-repeat 15px center;}.sqfes-sign-item-day{width:130px;height:40px;line-height:40px;text-align:center;color:#fff;font-size:30px;font-weight:bold;margin-top:32px;display:block;float:left;position:relative;z-index:2;}'+
            '.sqfes-sign-item-point{width:130px;height:26px;line-height:26px;text-align:center;color:#ffe70a;font-size:12px;margin-top:1px;display:block;float:left;position:relative;z-index:2;}.sqfes-middle{width:100%;height:42px;line-height:42px;_height:44px;_line-height:44px;float:left;margin-top:1px;}.sqfes-continue-sign{width:280px;height:42px;float:left;color:#fff;font-size:14px;font-weight:bold;position:relative;left:20px;}.sqfes-continue-sign span{margin-right:25px;color:#fff84c;}'+
            '.sqfes-link-btn{width:228px;height:42px;line-height:42px;float:left;position:relative;left:20px;}.sqfes-link-btn a{width:112px;height:42px;line-height:42px;_height:44px;_line-height:44px;color:#fffa7d;font-size:12px;font-weight:bold;text-align:center;display:block;float:left;}.sqfes-back-to-sign{margin-left:0px;}.sqfes-tips{width:100%;height:auto;float:left;margin-top:40px;}.sqfes-tips-main{width:285px;height:95px;overflow:hidden;position:relative;left:28px;line-height:16px;color:#9480c7;float:left;}'+
            '.sqfes-right{width:170px;height:90px;float:left;overflow:hidden;position:relative;left:64px;}.sqfes-right ul{width:168px;height:86px;overflow:hidden;margin-top:4px}.sqfes-sign-item{width:100%;height:auto;float:left;margin-bottom:5px;color:#e54d92;}.sqfes-sign-item .fes-date{color:#9480c7;}.sqfes-sign-item-date{width:100%;height:12px;float:left;color:#c9e0ff;}.sqfes-sign-item-record{width:155px;height:auto;line-height:14px;float:left;color:#5520b8;}'+
            '.sqfes-show-sign-tips{width:345px;height:30px;line-height:30px;text-align:center;left:50%;margin-left:-172px;top:45%;position:absolute;display:none;font-size:12px;color:#fff84c;z-index:999;background:url("./festive_sign/show_sign_tips_bg.png") repeat-x;_background:url("./festive_sign/show_sign_tips_bg_8.png") repeat-x;}'+
            '.fes-dialog-masking{background-color:#000;left:0;opacity:.4;filter:alpha(opacity=40);position:absolute;top:0;z-index:1000;width:100%;height:100%;*_height:450px;}.fes-dialog-main{position:absolute;z-index:1001;padding:0;width:420px;color:#6c6c6c;left:50%;margin-left:-210px;top:50%;margin-top:-113px;}' +
            '.fes-dialog-avatar{display:none;z-index:1;width:22px;height:23px;position:absolute;top:7px;left:12px;background:url(http://img1.37wanimg.com/www/css/images/common/dialog2/bg-dialog-avatar.png) no-repeat;_background-image:url(http://img1.37wanimg.com/www/css/images/common/dialog2/bg-dialog-avatar-8.png);}' +
            '.fes-dialog-body{word-break:break-all;background-color:#fff;border:1px solid transparent;_border-color:#fff;border-radius:3px;box-shadow:inset 0 0 2px 1px #fff;}.sqfes-sign-anim{position:absolute;top:5px;left:5px;z-index:1;}' +
            '.fes-dialog-titlebar{background-image:url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2YyZjJmMiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2U5ZTllOSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==);background-size:100%;background-image:-webkit-gradient(linear,50% 0,50% 100%,color-stop(0,#f2f2f2),color-stop(100%,#e9e9e9));background-image:-moz-linear-gradient(#f2f2f2,#e9e9e9);background-image:-webkit-linear-gradient(#f2f2f2,#e9e9e9);background-image:linear-gradient(#f2f2f2,#e9e9e9);background-color:#e9e9e9;position:relative;height:20px;color:#3c3c3c;padding:10px 0 10px 15px;}' +
            '.fes-dialog-client{background-color:#fff;padding:24px 14px 0;font-size:14px;*_line-height:20px;}.fes-dialog-client,.fes-dialog-content{margin-left:10px;margin-right:10px;}.fes-dialog-buttons{margin:0 10px 10px;background-color:#fff;padding-bottom:15px;text-align:center;}' +
            '.fes-dialog-titlebar-text{color:#3c3c3c;font-size:14px;}.fes-dialog-close{position:absolute;width:14px;height:13px;top:10px;right:15px;text-indent:-9999px;background:url(http://img1.37wanimg.com/www/css/images/common/dialog2/bg-dialog-close.png) no-repeat;_background-image:url(http://img1.37wanimg.com/www/css/images/common/dialog2/bg-dialog-close-8.png);}' +
            '.fes-dialog .btn-s-140{background:#ffab16;border-radius:4px;color:#fff;display:inline-block;text-align:center;overflow:hidden;}.fes-dialog .btn-s-140,.fes-dialog .btn-s-w{width:140px;height:36px;line-height:36px;font-size:16px;vertical-align: middle;}.fes-dialog-buttons a{margin-left:10px;margin-right:10px;}' +
            '</style>',
        /**
        @description     init方法
        @param u        传入的用户登录信息
        @param client   传入用于与盒子交互的client对象
        @return         undefined
        */
        init: function(opts, u, client) {
            //css载入页面
            if (opts.type === 1) {
                $('head').append(this.css);
                this.api = FestiveSign.api;
            } else if (opts.type === 2) {
                $('head').append(this.css37);
                this.api = FestiveSign.api37;
            }

            this.user = u;
            this.client = client;
            this.opts = opts;

            //实例化按钮事件
            this._event(opts);
            //实例化获取用户签到信息的方法
            this._getSign(opts);
        },

        /**
        @description    按钮点击事件
        @return         undefined
        */
        _event: function(opts) {
            var $backToSign = $(opts.fesBackToSignBtnId),
                $festiveSignPanel = $(opts.signPanelId),
                that = this;

            //“返回每日签到”按钮点击跳转事件
            $backToSign.on('click', function(event) {
                event.preventDefault();
                //隐藏新春签到面板
                $festiveSignPanel.hide();
                //实例化每日签到面板
                that._dailyMark();
                //移除美化滚动条
                $(opts.fesPointsRecordId).getNiceScroll().remove();
            });

            //消息提示框的“确定”、“关闭”按钮绑定remove事件
            $("body").on('click', '.fes-dialog-close', function(event) {
                event.preventDefault();
                $(".fes-dialog").remove();
            }).on('click', '.fes-dialog-btn', function(event) {
                event.preventDefault();
                $(".fes-dialog").remove();
            }).on('click','#toLottery',function(event){
                event.preventDefault();
                if( new Date().getTime() > 1520351999000 ){//1520351999000
                    window.open("http://huodong.37.com/dist/platform/37festival2018-center/?hd_referer=boxactivity&wd_SID=hdonline&wd_openingamebox=1");
                }else{
                    that._showMsg("抽奖活动将于3月7日开启，敬请期待！");
                }
            });


        },

        /**
        @description    获取新春签到信息
        @return         undefined
        */
        _getSign: function(opts) {
            var signInfoApi = this.api.getSignInfo,
                goldenEggApi = this.api.getGoldenEgg,
                $signLi = $(opts.signLiClass),
                $signRecord = $(opts.fesPointsRecordId),
                $signBox = $(opts.signBoxId),
                $signSerial = $(opts.fesSignSerialId),
                $signGoldenEgg = $(opts.fesSignGoldenEggId),
                that = this;

            //获取用户的活动签到信息
            that._ajaxCall(signInfoApi, function(res) {
                if (res.result * 1 === 1) {
                    var liArr = [],
                        signArr = [],
                        toDoSign = true,
                        td = res.list.today + "";


                    if (res.list.basic_data) {
                        $.each(res.list.basic_data, function(index, val) {
                            //若当天的签到日期存在列表当中，则设toDoSign为false（下面将不执行签到请求）
                            if (val.date === td && val.has_sign*1 === 1) {
                                toDoSign = false;
                            }
                            //“获得明细”列表
                            if( val.has_sign * 1 !== 0 ){
                                var lotterySpan = "";
                                if( val.add_info.type ){
                                    lotterySpan = val.add_info.type === 'lottery' ? '<span class="fes-get-golden-egg">抽奖+'+ val.add_info.times +'</span>' :'<span class="fes-get-golden-egg">团购+'+ val.add_info.times +'</span>';
                                }
                                liArr.push('<li class="sqfes-sign-item"><p class="fes-date">' + val.date+ '</p><p><span class="fes-get-point-count">签到积分+'+ val.point +'</span> '+ lotterySpan +'</p></li>');
                            }

                            //“获得签到”列表
                            if (opts.type === 1) {
                                val.has_sign = val.has_sign * 1 !== 0 ? "fes-sign-yes" : "";
                                signArr.push('<li class="fes-sign-btn ' + val.has_sign + '" data-days="' + val.date + '"><span class="fes-day-num">' + val.date.substr(val.date.length - 2) * 1 + '</span><span class="fes-get-point">积分+' + val.point + '</span></li>');
                            } else {
                                if (val.date === td && val.has_sign*1 === 1) {
                                        toDoSign = false;
                                }
                                val.has_sign = val.has_sign * 1 === 1 ? "sqfes-sign-yes" : "";
                                signArr.push('<li class="sqfes-sign-btn ' + val.has_sign + '" data-days="' + val.date + '"><span class="sqfes-sign-item-day">' + val.date.substr(val.date.length - 2) * 1 + '</span><span class="sqfes-sign-item-point">积分+' + val.point + '</span></li>');
                            }
                        });
                        $signRecord.html(liArr.join(""));
                        $signBox.html(signArr.join(""));
                        $signRecord.niceScroll({
                            cursorcolor: "#e54d92",
                            cursoropacitymax: 1,
                            touchbehavior: false,
                            cursorwidth: "4px",
                            cursorborder: "0",
                            cursorborderradius: "0px",
                            zindex: 20,
                            autohidemode: false
                        });

                    }

                    //连续签到次数
                    $signSerial.text(res.list.lottery_times);
                    //剩余抽奖机会
                    $signGoldenEgg.text(res.list.group_times);
                    if( opts.type === 1 ){
                        $(".fes-tips").show();
                        $(".fes-top").show();
                        $(".fes-middle").show();
                    }else{
                        $(".sqfes-top").show();
                        $(".sqfes-middle").show();
                        $(".sqfes-tips").show();
                    }

                    $(opts.signPanelId).show();

                    //判断是否需要执行签到方法
                    if (toDoSign) {
                        that._doSign(opts);
                    }

                } else if (res.result * 1 === -2 || res.result * 1 === -3 || res.result * 1 === -90021) { //活动未开启则跳转到“每日签到”面板
                    that._dailyMark();
                } else {
                    if (res.msg) {
                        that._showMsg(res.msg);
                    }
                }
            }, false, that._dailyMark);

            // //团购次数
            // if (opts.type === 2) {
            //     //获取用户的剩余金蛋信息
            //     that._ajaxCall(goldenEggApi, function(res) {
            //         if (res.result * 1 === 1) {
            //             $signGoldenEgg.text(res.val);
            //         }
            //     }, "请求团购信息失败，请重试！");
            // }
        },

        /**
        @description    执行签到操作
        @return         undefined
        */
        _doSign: function(opts) {
            var webApi = this.api.signForWeb,
                boxApi = this.api.signForBox,
                $signLi = $(opts.signLiClass),
                $signSerial = $(opts.fesSignSerialId),
                $signGoldenEgg = $(opts.fesSignGoldenEggId),
                $signRecord = $(opts.fesPointsRecordId),
                totalPoints = 0,
                that = this;

            //活动签到
            that._ajaxCall(boxApi, function(res) {
                if (res.result * 1 === 1) {
                    var signDays = res.list.TIME,
                        points = res.list.POINT,
                        times = res.list.TIMES,
                        type = res.list.TYPE,
                        lottery = res.list.ADD_LOTTERY_TIMES,
                        presentIntegral = 0,
                        sourceTips = "",
                        showMsg = {};

                    //遍历签到按钮的节点
                    $signLi.filter(function(index) {
                        //找到属于今天日期的节点
                        if ($(this).data('days') == signDays) {
                            // if (opts.type === 1) {
                            //     //符合连续签到天数则奖励额外积分
                            //     if (res.list.has_sign_award * 1 === 1 && res.list.serial_gift_log) {
                            //         presentIntegral = res.list.serial_gift_log.CARD_NUM * 1;
                            //         sourceTips = res.list.serial_gift_log.SOURCE;
                            //     }
                            //     showMsg.integral = presentIntegral;
                            //     showMsg.sourceTips = sourceTips;
                            // }

                            showMsg.msg = res.msg;
                            showMsg.points = points;
                            showMsg.lottery = lottery;
                            showMsg.times = times;
                            showMsg.type = type;
                            //显示签到打勾动画
                            that._showSignImg($(this), showMsg);
                        }
                    });

                    //移除美化滚动条
                    $signRecord.getNiceScroll().remove();

                    if (opts.type === 1) {
                        //“已连续签到”框数值更新+1
                        $signSerial.text($signSerial.text() * 1 + 1);
                        //“抽奖次数”框数值+1更新
                        $signGoldenEgg.text($signGoldenEgg.text() * 1 + lottery); //抽奖次数+
                        //获得积分append进“获得明细”框里
                        var lotterySpan = lottery*1 !== 0 ? '<span class="fes-get-golden-egg">抽奖+'+ lottery +'</span>' :"";
                        $signRecord.append('<li class="fes-sign-item"><p class="fes-date">' + signDays + '</p><p><span class="fes-get-point-count">签到积分+'+ points +'</span> '+ lotterySpan +'</p></li>');
                        //若有额外积分则append进“获得明细”框里
                        // if (presentIntegral > 0) {
                        //     $signRecord.append('<li class="fes-sign-item"><p class="fes-date">' + signDays + '</p><p><span class="fes-get-point-count">额外积分+' + presentIntegral + '</span><span class="fes-get-golden-egg"></span></p></li>');
                        // }
                    } else {
                        var historyArr = [];
                        //获得积分append进“获得明细”框里
                        var lotterySpan = "";
                        if( +times !== 0 ){
                            if( type === 'lottery' ){
                                //“已连续签到”框数值更新+1
                                $signSerial.text($signSerial.text() * 1 + times);
                            }else{
                                //“抽奖次数”框数值+1更新
                                $signGoldenEgg.text($signGoldenEgg.text() * 1 + times); //抽奖次数+
                            }

                            lotterySpan = type === 'lottery' ? '<span class="fes-get-golden-egg">抽奖+'+ times +'</span>' :'<span class="fes-get-golden-egg">团购+'+ times +'</span>';
                        }
                        $signRecord.append('<li class="sqfes-sign-item"><p class="fes-date">' + signDays + '</p><p><span class="fes-get-point-count">签到积分+'+ points +'</span> '+ lotterySpan +'</p></li>');

                    }

                    //滚动条美化
                    $signRecord.niceScroll({
                        cursorcolor: "#e54d92",
                        cursoropacitymax: 1,
                        touchbehavior: false,
                        cursorwidth: "4px",
                        cursorborder: "0",
                        cursorborderradius: "0px",
                        zindex: 20,
                        autohidemode: false
                    });
                    //累加今天签到获得的总积分
                    totalPoints = points * 1 + presentIntegral * 1;

                    //“每日签到”进行签到
                    that._ajaxCall(webApi, function(res) {
                        if (res.code * 1 === 1) { //正常签到
                            var newVal = that.user.POINT * 1 + res.data.point_change * 1 + totalPoints; //累加：用户已有积分+每日签到积分+活动签到积分，用于通知盒子更新积分

                            that.client.DoSuperCall(112, {
                                score: newVal,
                                vip: that.user.VIP_DEEP
                            });
                            SQ.Login.userInfo.POINT = newVal;

                        } else if (res.code * 1 === 2) { //已签到过
                            var newVal = that.user.POINT * 1 + totalPoints * 1; //累加：用户已有积分+活动签到积分，用于通知盒子更新

                            that.client.DoSuperCall(112, {
                                score: newVal,
                                vip: that.user.VIP_DEEP
                            });
                            SQ.Login.userInfo.POINT = newVal;

                        } else {
                            if (res.msg) {
                                that._showMsg(res.msg);
                            }
                        }
                    }, "每日签到失败，请重试！");
                } else if (res.result == -90021) {
                    that._dailyMark();
                } else {
                    if (res.msg) {
                        that._showMsg(res.msg);
                    }
                }
            }, "活动签到失败，请重试！");
        },

        /**
        @description    每日签到面板
        @return         undefined
        */
        _dailyMark: function() {
            var that = this;
            SQ.Signapp.init({
                "menu": ".sq-sign", //签到按钮的dom结构
                "pos": { //签到浮框的坐标
                    x: "0",
                    y: "0"
                },
                handler: {
                    signed: null,
                    signSucc: function(res) {
                        var newVal = that.user.POINT * 1 + res.data.point_change * 1;

                        that.client.DoSuperCall(112, {
                            score: newVal,
                            vip: that.user.VIP_DEEP
                        });
                        SQ.Login.userInfo.POINT = newVal;
                    }
                }
            }, SQ.Login.userInfo);
            SQ.Signapp.doSign();
        },

        /**
        @description    签到后，当天的签到框里展示签到动画效果
        @param  liNode  {selector}    当前节点对象
        @param  res     {boject}      传入该节点的签到信息
        @return         undefined
        */
        _showSignImg: function(liNode, res) {
            var that = this,
                $img1 = $('<img class="fes-sign-anim" src="./festive_sign/fes_sign_animate.gif?' + (new Date()).getTime() + '" width="62" height="60" />'),
                $img2 = $('<img class="sqfes-sign-anim" src="./festive_sign/sqfes_sign_animate.gif" width="120" height="120" />');

            if (that.opts.type === 1) {
                //等待gif图片加载完成后执行显示积分信息
                $img1.load(function() {
                    liNode.children('.fes-get-point').css('color', '#fff');
                    liNode.append($img1);
                    festimer = setTimeout(function() {
                        $img1.animate({
                            opacity: 0
                        }, 2000, function() {
                            $img1.hide();
                        });
                        liNode.addClass("fes-sign-yes");
                        //显示当天获得积分、金蛋信息
                        that._showSignTip(res, that.opts);
                        //显示当天获得额外奖励积分
                        that._showPresentExpTip(res);
                        clearTimeout(festimer);
                    }, 2000);
                });
            } else {
                //等待gif图片加载完成后执行显示积分信息
                $img2.load(function() {
                    //liNode.children('.fes-get-point').css('color', '#fff');
                    liNode.append($img2);
                    festimer = setTimeout(function() {
                        $img2.animate({
                            opacity: 0
                        }, 2000, function() {
                            $img2.hide();
                        });
                        liNode.addClass("sqfes-sign-yes");
                        //显示当天获得积分、金蛋信息
                        that._showSignTip(res, that.opts);
                        clearTimeout(festimer);
                    }, 2000);
                });
            }
        },

        /**
        @description    签到后，已签到等提示
        @param  res     {object}   当前签到成功后返回的信息
        @return         undefined
        */
        _showSignTip: function(res, opts) {
            if (!res) return;
            var $signTip = $(opts.fesShowSignTipsId);
            var lotteryTip = +res.lottery !== 0 ?  ' 抽奖+' + res.lottery : '';
            if (opts.type === 1) {
                $signTip.html(res.msg + " 积分+"+ res.points + lotteryTip ).show().animate({
                    top: "35%",
                    opacity: 0
                }, 4000, function() {
                    $signTip.removeAttr("style");
                });
            } else {
                var tips = "";
                if( +res.times !== 0 ){
                    tips = res.type === "lottery" ? "、抽奖次数+"+res.times : "、团购次数+"+res.times;
                }
                $signTip.html('签到完成！积分+'+res.points+ tips ).show().animate({
                    top: "35%",
                    opacity: 0
                }, 4000, function() {
                    $signTip.removeAttr("style");
                });
            }
        },

        /**
        @description    获得连续签到额外奖励提示框
        @param  res     {object}  当前签到成功后获得额外的奖励积分信息
        @return         undefined
        */
        _showPresentExpTip: function(res, opts) {
            if (res.integral && res.integral * 1 > 0) {
                var $signTip = $(opts.fesShowPresentIntegralId);

                $signTip.html(res.sourceTips + '额外积分+' + res.integral).show().animate({
                    top: "35%",
                    opacity: 0
                }, 6000, function() {
                    $signTip.removeAttr("style");
                });
            }
        },

        /**
        @description          封装私有ajax方法
        @param  url           {string}   必填    接口地址
        @param  sucCallBack   {function} 必填    请求成功的回调方法
        @param  failMsg       {string}   选填    请求失败的提示信息
        @param  failCallBack  {function} 选填    请求失败的回调方法
        @return         undefined
        */
        _ajaxCall: function(url, sucCallBack, failMsg, failCallBack) {
            if (!url || !$.isFunction(sucCallBack)) return;

            var that = this;
            $.ajax({
                    url: url,
                    type: 'post',
                    dataType: 'jsonp',
                    cache: false,
                    async: false
                })
                .done(function(res) {
                    if ($.isFunction(sucCallBack)) {
                        sucCallBack(res);
                    }
                })
                .fail(function() {
                    if (failMsg) {
                        that._showMsg(failMsg);
                    }
                    if ($.isFunction(failCallBack)) {
                        failCallBack();
                    }
                });
        },

        /**
        @description   私有信息提示框
        @param  msg    {string}  必填  提示字符串
        @return        undefined
        */
        _showMsg: function(msg) {
            if (!msg) return;
            $("body").append('<div class="fes-dialog"><div class="fes-dialog-masking"></div><div class="fes-dialog-main"><div class="fes-dialog-body"><div class="fes-dialog-titlebar "><span class="fes-dialog-titlebar-text">提示信息</span><a href="javascript:void(0);" title="关闭" class="fes-dialog-close">关闭</a></div><div class="fes-dialog-client"><div class="fes-dialog-content" style="height:100px;"><div class="fes-dialog-alert">' + msg + '</div></div></div><div class="fes-dialog-buttons "><a class="fes-dialog-btn btn btn-s-1 btn-s-140" href="javascript:;" data-name="确定">确定</a></div></div></div></div>');
        }
    };

    SQ.FestiveSign = FestiveSign;
})(jQuery, SQ);
