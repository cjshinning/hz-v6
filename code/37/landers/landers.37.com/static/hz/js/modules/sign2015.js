require.config({
    baseUrl: "/static/hz/js",
    paths: {
        "jQuery": "lib/landers.core",
        "sq.core": "lib/sq.core",
        "sq.tab": "http://ptres.37.com/js/sq/widget/sq.tab",
        "sq.statis": "http://ptres.37.com/js/sq/widget/sq.statis",
        "sq.tooltip": "http://ptres.37.com/js/sq/widget/sq.tooltip",
        "jQuery.nicescroll": "http://ptres.37.com/js/sq/plugin/jquery.nicescroll.min",
        "sq.dialog": "http://ptres.37.com/js/sq/widget/sq.dialog",
        "sq.login": "http://ptres.37.com/js/sq/widget/sq.login2",
        "signin": "http://ptres.37.com/js/sq/widget/sq.signin2015",
        "sign": "http://ptres.37.com/js/sq/modules/sign2015",
        "fes.sign": "modules/sign.festive",
        "box": "modules/box",
        "client": "client",
        "util":"util"
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
        'jQuery.nicescroll': {
            deps: ['sq.core']
        },
        "sq.login": {
            deps: ['sq.core']
        },
        'sq.dialog': {
            deps: ['sq.core']
        },
        "signin": {
            deps: ['sq.core', "sq.login"]
        },
        'sign': {
            deps: ['signin']
        },
        'fes.sign': {
            deps: ['sq.core', "sq.login"]
        }
    },
    urlArgs:"t=201802051225VER&c=c"
});


require(
    [
        "sq.core",
        "box",
        "client",
        "util",
        "sq.login",
        "sign",
        "jQuery.nicescroll",
        "sq.dialog",
        "fes.sign"
    ],
    function(SQ, Box, client ,Util) {

        $(document).ready(function() {
            var setSignType = SQ.getParam('setsign'),//由盒子通过URI传setsign参数来决定是开启新春签到还是每日签到
                check = {
                festiveMarks: function() {
                    return new SQ.Login({
                        dialog: false,
                        lr: function(data) {
                            // SQ.FestiveSign.init({
                            //     "signPanelId": "#festiveSignPanel",
                            //     "signBoxId": "#fesSignBox",
                            //     "signLiClass": ".fes-sign-btn",
                            //     "fesBackToSignBtnId": "#fesBackToSignBtn",
                            //     "fesPointsRecordId": "#fesPointsRecord",
                            //     "fesSignSerialId": "#fesSignSerial",
                            //     "fesSignGoldenEggId": "#fesSignGoldenEgg",
                            //     "fesShowSignTipsId": "#fesShowSignTips",
                            //     "fesShowPresentIntegralId": "#fesShowPresentIntegral",
                            //     "type": 1 //1为新春签到活动
                            // },data, client);
                            SQ.FestiveSign.init({
                                "signPanelId": "#sqFestiveSignPanel",
                                "signBoxId": "#sqfesSignBox",
                                "signLiClass": ".sqfes-sign-btn",
                                "fesBackToSignBtnId": "#sqfesBackToSignBtn",
                                "fesPointsRecordId": "#sqfesPointsRecord",
                                "fesSignSerialId": "#sqfesSignSerial",
                                "fesSignGoldenEggId": "#sqfesSignGoldenEgg",
                                "fesShowSignTipsId": "#sqfesShowSignTips",
                                "fesShowPresentIntegralId": "#sqfesShowPresentIntegral",
                                "type": 2 //2为37网游节活动
                            },data, client);
                            //埋点统计初始化
                            Util.statistics.init(SQ.Login.userInfo.LOGIN_ACCOUNT);
                        }
                    }).getUserInfo();
                },
                dailyMarks: function() {
                    return new SQ.Login({
                        dialog: false, //统一登录弹窗？
                        //gameid: "",
                        lr: function(data) { //由于新版签到插件必须使用用户的登录信息，所以必须是有登录状态的时候才能调用
                            SQ.Signapp.init({
                                "menu": ".sq-sign", //签到按钮的dom结构
                                "pos": { //签到浮框的坐标
                                    x: "0",
                                    y: "0"
                                },
                                handler: {
                                    signed: null,
                                    signSucc: function(res) { //alert(data.POINT);alert(res.data.point_change);
                                        var newVal = data.POINT + res.data.point_change;
                                        client.DoSuperCall(112, {
                                            score: newVal,
                                            vip: data.VIP_DEEP
                                        });
                                        SQ.Login.userInfo.POINT = newVal;
                                    }
                                }
                            }, SQ.Login.userInfo);
                            SQ.Signapp.doSign();
                        }
                    }).getUserInfo();
                }
            };

            //判断是开启新春签到还是每日签到
            if (setSignType*1 === 1) {
                check.festiveMarks();
            } else {
                check.dailyMarks();
            }
        });
    });
