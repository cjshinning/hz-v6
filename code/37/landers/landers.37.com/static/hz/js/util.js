/**
 * Author: denghuafeng
 * Date: 2017/4/6
 * Plugin Name: util
 * Description: 盒子公共工具方法.
 */
define([],function(){
    /**
     * 盒子公共工具方法添加在此
     */
    var util = {
        /**
         @description	点击埋点统计
         @return		undefined
         */
        statistics: {
            init: function( la ) {
                var _this = this;
                _this.la = la || "";

                _this.statisUrl = "http://pt.clickdata.37wan.com/ps.gif";

                /**
                 @description	37新平台的点击数据参数介绍
                 @param
                 - id	    必选，默认值17,37平台点击数据采集
                 - la	    必选，用户帐号
                 - e1	    必选，点击当前页面名称，如www
                 - e2	    必选，点击当前页面地址，如www.37.com
                 - e3	    必选，具体跳转地址（有可能是触发的javascript）,如dts.37.com
                 - e4	    必选，标题
                 - e5	    必选，区域位置
                 - e6	    必选，访客唯一标识（tg_uv）
                 - e7	    必选，基础传输变量（tg_fdata）
                 - e8	    必选，document_referer(进入当前页面的前一页面地址)
                 - e9	    必选，游戏ID（game_id）
                 - e10	    必选，时间戳
                 - e11      选填，站内信标识
                 @return		undefined
                 */
                _this.opts = {
                    "id": 17,
                    "la": "",
                    "e1": _this.getHostFirst(),
                    "e2": _this.getDoc(),
                    "e3": "",
                    "e4": "",
                    "e5": "",
                    "e6": SQ.cookie( "tg_uv" ) || "",
                    "e7": SQ.cookie( "tg_fdata" ) || "",
                    "e8": document.referrer && _this.getDoc( document.referrer ),
                    "e9": 0,
                    "e11": "",
                    "e10": ( new Date() ).getTime(),
                    "e13": ""
                };

                _this.events();

            },

            /**
             @description	获取域名第一个值，比如：获取 www.37.com 的 www
             */
            getHostFirst: function() {
                var hostFirst = "",
                    url = window.location.href;

                if ( url && url.indexOf( "http" ) > -1 && url.split( "://" ).length > 0 ) {
                    hostFirst = url.split( "://" )[ 1 ].split( "/" )[ 0 ].split( "." )[ 0 ];
                }
                return hostFirst;
            },

            /**
             @description	获取域名
             如果是37.com域名下的，就获取整个链接，比如：获取 http://vip.37.com/?c=vip&a=privilege 的 vip.37.com/?c=vip&a=privilege
             如果是外部链接，比如：获取 http://www.baidu.com/xxx/yyyy/ 的 www.baidu.com
             */
            getDoc: function( url ) {
                var hostName = "",
                    url = url || window.location.href;

                if ( url && url.indexOf( "http" ) > -1 && url.split( "://" ).length > 0 ) {
                    hostName = url.split( "://" )[ 1 ].split( "/" )[ 0 ];
                    if ( url.indexOf( ".37.com" ) > -1 ) {
                        hostName = url.split( "://" )[ 1 ];
                    }
                }
                return encodeURIComponent( hostName );
            },

            tj: function() {
                var _this = this,
                    img = new Image(),
                    url = _this.statisUrl +
                        "?id=" + _this.opts.id +
                        "&la=" + _this.la  +
                        "&e1=" + _this.opts.e1 +
                        "&e2=" + _this.opts.e2 +
                        "&e3=" + _this.opts.e3 +
                        "&e4=" + _this.opts.e4 +
                        "&e5=" + _this.opts.e5 +
                        "&e6=" + _this.opts.e6 +
                        "&e7=" + _this.opts.e7 +
                        "&e8=" + _this.opts.e8 +
                        "&e9=" + _this.opts.e9 +
                        "&e11=" + _this.opts.e11 +
                        "&e12=box" +
                        "&e10=" + ( new Date() ).getTime() +
                        "&e13=" + _this.opts.e13;

                img.src = url;
            },

            events: function() {
                var _this = this,
                    opt = {};

                $( document )
                    .on( "click", "*[data-position]", function() {
                        opt = {
                            "e3": _this.getDoc( $( this ).attr( "href" ) ),
                            "e4": $( this ).attr( "title" ) ? encodeURIComponent( $( this ).attr( "title" ) ) : "",
                            "e5": $( this ).data( "position" ).e5,
                            "e9": $( this ).data( "position" ).e9 ? $( this ).data( "position" ).e9 : 0,
                            "e11": $( this ).data( "position" ).e11 ? $( this ).data( "position" ).e11 : "",
                            "e13": $( this ).data( "position" ).e13 ? $( this ).data( "position" ).e13 : ""
                        };

                        _this.opts = $.extend( _this.opts, opt );
                        _this.tj();
                    } );

            }
        }
    };

    return util;
});