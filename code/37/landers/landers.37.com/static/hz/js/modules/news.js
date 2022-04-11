require.config({
    baseUrl:"/static/hz/js",
    paths: {
        "jQuery":"lib/landers.core",
        "sq.core": "lib/sq.core",
        "sq.tab": "http://ptres.37.com/js/sq/widget/sq.tab",
        "sq.statis": "http://ptres.37.com/js/sq/widget/sq.statis",
        "sq.tooltip":"http://ptres.37.com/js/sq/widget/sq.tooltip",
        "jQuery.nicescroll":"http://ptres.37.com/js/sq/plugin/jquery.nicescroll.min",
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
        }
    }
});

require( 
    [
    "sq.core"
    ], 
    function() {


/**
 * 新闻
 * @namespace main.news
 */
var news = {
    init: function( d ) {
        var type = SQ.getParam("t");
        this.config = d || {};
        this.gameId = SQ.getParam( "g" );
        this.url = "http://ptres.37.com/content/cache/gonggao/g_" + this.gameId + ".js";
        this.url2 = "http://ptres.37.com/content/cache/gonglue/g_" + this.gameId + ".js";

        if(!type){
            this.getNews();
        }else{
            this.getStrategy();
        }
    },
    /**
     * 获取新闻
     */
    getNews: function() {
        var that = this,
            emptyTxt = "暂无公告";
        that.showEmpty(emptyTxt);
        $.ajax({
            url : this.url,
            dataType : "jsonp",
            jsonpCallback: "content_callback_gonggao_g_" + this.gameId
        }).done(function( res ) {
            if( !res || !res.code ) return;
            var html = [],
                data = res.data,
                t_html = "",
                l = that.config.len || data.length;

            for( var i=0,len=data.length; i < len; i++ ){
                if( l === 0 || i >= l ){
                    break;
                }
                if ( that.config.isShowDate && i != 0 ) {
                    t_html = "<span class='news-date'>[{date}]</span>".replace( "{date}", data[ i ].stime );
                }
                if(i === 0){
                    html.push('<li class="red"><a target="_blank" href="',data[ i ].url,'">',data[ i ].title,'</a>',t_html,'</li>');    
                }else{
                    html.push('<li><a target="_blank" href="',data[ i ].url,'">',data[ i ].title,'</a>',t_html,'</li>');
                }
            }
            if(!html.length){
                that.showEmpty(emptyTxt);
            }else{
                $( "#news" ).html( html.join( "" ));
            }
        }).fail(function() {
            that.showEmpty(emptyTxt);
        });
    },
    /**
     * 攻略
     * @return {[type]} [description]
     */
    getStrategy:function(){
        var that = this,
            emptyTxt = "暂无攻略";
        that.showEmpty(emptyTxt);
        $.ajax({
            url : this.url2,
            dataType : "jsonp",
            jsonpCallback: "content_callback_gonglue_g_" + this.gameId
        }).done(function( res ) {
            if( !res || !res.code ) return;
            var html = [],
                data = res.data,
                t_html = "",
                l = that.config.len || data.length;

            for( var i=0,len=data.length; i < len; i++ ){
                if( l === 0 || i >= l ){
                    break;
                }
                if ( that.config.isShowDate && i != 0 ) {
                    t_html = "<span class='news-date'>[{date}]</span>".replace( "{date}", data[ i ].stime );
                }
                html.push('<li><a target="_blank" href="',data[ i ].url,'">',data[ i ].title,'</a>',t_html,'</li>');
            }
            if(!html.length){
                that.showEmpty(emptyTxt);
            }else{
                $( "#news" ).html( html.join( "" ));
            }
        }).fail(function() {
            that.showEmpty(emptyTxt);
        });        
    },
    showEmpty:function(text){
        $( "#news" ).html( '<li class="empty">^_^'+text+'^_^</li>' );
    }
}

$(document).ready(function($) {
    news.init({
        len: 5
    });
});

});