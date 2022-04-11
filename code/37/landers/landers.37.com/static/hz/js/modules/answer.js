require.config({
    baseUrl:"/static/hz/js",
    urlArgs:"t=2016063001VER&c=c",
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
    "sq.core",
    "jQuery.nicescroll"
    ], 
    function() {

/**
 * 答题神器
 * @namespace main.answer
 */
var answer = {
    init: function( gameKey ) {
        this.gameKey = gameKey;
        this.input = $( "#answer-search" );
        this.defaultWord = "请输入您想查询问题的关键词";
        this.search();
        this.events();
        this.input.focus();
    },
    events: function() {
        var that = this;
        $( document )
            .on( "click.answer", "#to-search", function()  {
                that.search();
            })
            .on( "keypress.answer", "#answer-search", function( e ) {
                if ( e.keyCode === 13 ) {
                    that.search();
                }
            })
            .on( "focusin.searchInput", "#answer-search", function() {
                if ( $( this).val() == that.defaultWord ) {
                    $( this).val( "" );
                }
            })
            .on( "focusout.searchInput", "#answer-search", function() {
                if ( $( this).val() == "" ) {
                    $( this).val( that.defaultWord );
                }
            });
    },
    /**
     * 答案搜索的处理
     */
    search: function() {
        var val = this.input.val(),
            temp = ( val == this.defaultWord ) ? "|_|_|" : val,
            word = $( "#keyword").val() + temp;

        $.getJSON( '/index.php?c=hz-legacy&a=anwser&k=' + this.gameKey + '&keyword='+encodeURI( word ), function( data ) {
            var $con = $( "#answer-content" );
            if ( data.code == 1 ) {
                if ( typeof data.data == 'object' ) {
                    var _html = [],
                        _data = data.data,
                        i = 0;
                    for ( ; i < _data.length; i++ ) {
                        _html.push( "<li class='answer-li'><span class='answer-num'>" + ( i + 1 ) + ".</span><span class='answer-txt'>" + _data[i]['content'] + "<br/>答案：" + _data[i]['option'] + "</span></li>");
                    }
                    $con.removeClass( "relative" ).html( _html.join("") );
                    if ( i > 4 ){
                        $con.niceScroll({
                            horizrailenabled: false,
                            cursorcolor: "#cbd0d5",
                            cursorwidth:"8px"
                        });
                    }
                }
            } else if ( data.code == 2 ) {
                $con.addClass( "relative" ).html( "<li class='answer-ab'>未找到您想要的答案！</li>" );
            } else if ( data.code == -1) {
                $con.addClass( "relative" ).html( "<li class='answer-ab'>该游戏无答题活动！</li>" );
            }

        });
    }
}


$(document).ready(function($) { 
    answer.init(SQ.getParam("k"));
});

});