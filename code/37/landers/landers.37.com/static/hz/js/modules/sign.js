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
        }
    }
});


require( 
    [
    "sq.core",
    "box",
    "client",
    "sq.dialog"
    ], 
    function( SQ, Box, client ) {

var WIN = window;
var SignIn = new SQ.Class();
SignIn.include( $.extend({
    init: function( opts ) {
        /**
         * @param isLogin function 必填 判断是否登录的方法，已登录返回true，未登录返回false
         * @param backLogin function 必填 未登录的处理
         * @param refreshPoint function 必填 获取到新的积分的处理
         * @param clickButton 可选 点击签到的按钮，当为空时一调用立即签到
         * @param isPlatform 可选 是否使用平台的签到框，默认true
         * @param handler 当isPlatform为true时可选、为false时必填 签到后的处理包括：unLogin，success，signed，fail四个方法，可以任意组合
         */
        SignIn.options = this.options = $.extend( true, {}, {
            isLogin: null,
            backLogin: null,
            refreshPoint: null,
            clickButton: "",
            isPlatform: true,
            handler: null,
            lastFun: null
        }, opts );

        if ( this.options.handler ) {
            $.extend( this.options.handler, this.defaults );
        }

        if ( !this.options.isPlatform && !this.options.handler ) {
            SQ.log( "缺少handler处理方法！" );
            return;
        }

        if ( !this.options.isPlatform ) {
            return;
        }

        if ( typeof this.options.isLogin !== "function" && typeof this.options.backLogin !== "function" && typeof this.options.refreshPoint !== "function") {
            SQ.log( "缺少处理方法！" );
            return;
        }

        if ( this.options.clickButton ) {
            this.events();
        } else {
            this.signNow();
        }
    },

    isSign: false,

    opts: {
        win: $( "#dialog-sign" ),
        notice_tip: "您已签到成功！"
    },

    defaults: {
        unLogin: function() {
            this.options.backLogin();
        },
        success: function( res ) {
            this.el.show();
            var nowdate = this.calendar.today( "" );
            $( ".sign-date" ).find( "td[date="+nowdate+"]" ).addClass( "have-signed" );
            this.notice();
            if ( res.data[ "point_change" ] ) {
                this.options.refreshPoint( res.data[ "point_change" ] );
            }
        },
        signed: function() {
            this.notice();
            this.el.show();        //打开日历窗口
        },
        fail: function () {
            WIN.alert( "签到失败，请您稍后重试！" );
        }
    },

    events: function() {
        var that = this;
        $( document.body ).on( "click" , this.options.clickButton , function(e){    //登陆框签到点击
            e.preventDefault();
            that.signNow();
        });
    },

    signNow: function() {
        if ( !this.el ) {
            this.el = new SQ.Dialog({
                title: "玩家签到",  // 标题
                width: 410,         // 宽度
                height: 350,        // 高度
                autoShow: false,    //初始化时就显示
                content: this.opts.win         // 弹窗内容的 jQuery 对象
            });
        }
        this.signLogs();
        this.sign();
    },

    sign: function(){  //签到处理
        var s = this.options.isLogin();
        if ( !s ) {
            this.options.backLogin();
            return;
        }
        if ( this.isSign === true ) {
            this.el.show();        //打开日历窗口
            this.notice( 2 );
            return;
        }
        this.apiCall( "http://shop.37.com/sign/index.php?action=sign", this.getSignCall );
    },

    getSignCall: function ( res ) {
        switch( res.code ){
            case -1:
                this.isSign = false;
                this.defaults.unLogin.call( this, res );
                break;
            case 1:
                this.isSign = true;
                this.defaults.success.call( this, res );
                break;
            case 2:
                this.isSign = true;
                this.defaults.signed.call( this, res );
                break;
            case 3:
                this.isSign = false;
                this.defaults.fail.call( this, res );
                break;
        }
        this.options.lastFun();
    },

    notice: function(){
        var notice_el = $( "#sign-notice" );
        if ( !notice_el.length ) return;
        notice_el.html( this.opts.notice_tip );
    },

    signLogs: function() {   //获取历史签到记录
        var s = this.options.isLogin();
        if ( !s ) return;
        var that = this;

        this.getSignLogs(function( res ){
            that.calendar.init( res.data[ "sign_days" ] );   //日历模块
        });
    },

    getSignLogs: function( callback ) {
        var url = "http://shop.37.com/sign/index.php?action=get_my_sign";
        this.apiCall( url, callback, "signlogs" );
    },

    getSign: function( callObj ) {
        $.extend( callObj, this.defaults );
        this.apiCall( "http://shop.37.com/sign/index.php?action=sign", this.getSignCall );
    },

    apiCall: function( url, callback, func ) {
        if ( !url || !callback || typeof callback !== "function" ) return;
        url = url +"&r=" + Math.random();
        var that = this;
        $.ajax({
            url: url,
            dataType: "jsonp"
        }).done(function( res ) {
                if ( func && func == "signlogs" && res.data && res.data[ "sign_days" ] ) {
                    var today = that.calendar.today( "" ),
                        dayObj = res.data[ "sign_days" ];
                    for ( var i = 0; i < dayObj.length; i++ ) {
                        if ( dayObj[i] == today ) {
                            that.isSign = true;
                            break;
                        }
                    }
                }
                callback.call( that, res );
            });
    },

    calendar: {

        init: function( dayObj ) {
            this.events( $("#sign-date") , $("#sign-date-show") , dayObj ); //  [日期标题，日历表格，服务端返回来的签到日期]
        },

        opts: {
            weeks:[ "周日", "周一", "周二", "周三", "周四", "周五", "周六" ],
            month:[ "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月" ]
        },

        events: function( $date , $table , dayObj ) {
            var con = this.eventsHandler();
            $date.html( con.nowY + "年" + con.nowM + "月" );
            if ( 'undefined' == typeof(document.body.style.maxHeight) ) {
                $table.hide();
                $table.html( con.html );
                setTimeout(function(){
                    $table.show();
                }, 100);
            } else {
                $table.html( con.html );
            }
            var today = this.today( "" );
            for ( var i = 0; i < dayObj.length; i++ ) {
                var t = $( ".sign-date" ).find( "td[date=" + dayObj[i] + "]" );
                if ( t ) {
                    t.addClass( "yes" );
                }
                if ( dayObj[i] == today ) {
                    $( "#sign-now" ).addClass( "signed" );
                }
            }
        },

        today: function( mode ) {
            var now = new Date(),
                year = now.getFullYear(),
                month = now.getMonth(),
                day = now.getDate(),
                tempM = parseInt( month , 10 ) + 1;
            if ( tempM > 0 && tempM < 10 ) {
                tempM = "0" + tempM.toString();
            } else {
                tempM = tempM.toString();
            }
            var tempD = day;
            if ( tempD > 0 && tempD < 10 ) {
                tempD = "0" + tempD.toString();
            } else {
                tempD = tempD.toString();
            }
            var temp = year.toString() + tempM + tempD;
            if ( mode == "d" ) {
                return tempD;
            } else if ( mode == "m" ) {
                return tempM;
            } else {
                return temp;
            }
        },

        eventsHandler: function() {
            var now = new Date(),
                year = now.getFullYear(),
                month = now.getMonth();
            var firstday = this.getFirstDate( year, month ).getDay(),
                lastday = this.getLastDate( year, month ).getDay(),
                lastdate = this.getLastDate( year, month ).getDate(),
                html = '<table border="0" cellpadding="0" cellspacing="1"><tbody><tr>';
            for ( var i = 0; i < this.opts.weeks.length; i++ ) {
                html += "<th>" + this.opts.weeks[i] + "</th>";
            }
            html += "</tr>";
            html += "<tr>";
            var d = 0;
            if ( firstday != 0 ) { //如果第一天不是星期天，补上上个月日期
                var last_month_lastdate = this.getLastDate( year, month - 1 ).getDate();
                var last_month_last_sunday = last_month_lastdate - firstday + 1;
                for(var j = last_month_last_sunday; j <= last_month_lastdate; j++){
                    html += '<td class="no"></td>';
                    d++;
                }
            }
            var tempM = parseInt( month , 10 ) + 1;
            if ( tempM > 0 && tempM < 10 ) {
                tempM = "0" + tempM.toString();
            }
            var now_day = this.today( "d" );
            for( var k = 1; k <= lastdate; k++ ){
                var tempDate = "";
                var tempK = k;
                if ( tempK > 0 && tempK < 10 ) {
                    tempK = "0" + tempK.toString();
                }
                tempDate = year.toString() + tempM + tempK;
                html += '<td class="date-td';
                if ( k == now_day ) {
                    html += ' today';
                }
                html += '" date="' + tempDate + '">' + k + '</td>';
                d++;
                if( d == 7 ) {
                    d = 0;
                    html += "</tr>";
                    if ( lastday != 6 ){
                        html += "<tr>";
                    }
                }
            }
            if ( lastday != 6 ) { //如果最后一天不是周六，补上下个月日期
                var last_month_saturday = 6 - lastday;
                for ( var l = 1; l <= last_month_saturday; l++ ) {
                    html += '<td class="no"></td>';
                }
                html += "</tr>";
            }
            html += "</tbody></table>";
            return {
                html: html,
                nowY: year,
                nowM: month + 1,
                nowD: now.getDate()
            };

        },

        getFirstDate: function( year, month ) {
            return new Date( year, month , 1 );
        },

        getLastDate: function( year, month ) {
            return new Date( year , month + 1, 0 );
        }
    }

}, SQ.Events) );

SQ.Sign = SignIn;

jQuery(document).ready(function($) {
    var $el = $( "#dialog-sign" );
    if ( !$el || !$el.length ) return;
    Box.User.checkLogin( function() {
        var userPoint = +Box.User.info.POINT,
            vipDeep = +Box.User.info.VIP_DEEP;
        new SQ.Sign({
            isLogin: function() {
                return !$.isEmptyObject(Box.User.info);
            },
            backLogin: function() {

            },
            refreshPoint: function( point ) {
                userPoint += point;
                client.DoSuperCall( 112, {
                    score: userPoint,
                    vip: vipDeep
                });
            },
            clickButton: "",
            lastFun: function() {
                $( ".sq-dialog" ).css({
                    top: 0,
                    left: 0
                });
            }
        });
    }, null);

    window.setTimeout(function() {
        $( ".sq-dialog" ).css({
            top: 0
        });
    }, 1500);

});

});

