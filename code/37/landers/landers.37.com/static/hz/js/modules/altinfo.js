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

require( ["sq.core", "box", "client"], function( SQ, Box ) {

var altInfo = {
    init: function( num ) {
        var $el = $( "#altNum" ),
            vipDeep = 0;
        if ( !$el || !$el.length ) return;
        this.events();

        Box.User.checkLogin( function() {
            $el.html( num[ +Box.User.info.VIP_DEEP ] );
        }, function() {
            $el.html("0");
        });
    },
    events: function() {
        $( document )
            .on( "click.close", "#btn-altInfo-close", function()  {
                that.search();
            });
    }
}

$(document).ready(function() {
    altInfo.init([ 3, 4, 5, 5, 6, 6, 7, 7, 8 ]);
});

});