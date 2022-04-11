require.config({
    baseUrl:"/static/hz/js",
    urlArgs:"t=2016063001VER&c=c",
    paths: {
        "jQuery":"lib/landers.core",
        "sq.core": "lib/sq.core",
        "client":"client",
        "box":"modules/box",
        "sq.login":"http://ptres.37.com/js/sq/widget/sq.login"
    },  
    shim:{
        "sq.core" :{
            deps:["jQuery"],
            exports:"SQ"
        },
        'jQuery.nicescroll':{
            deps:['sq.core']
        },
        'jQuery.login':{
            deps:["sq.core"],
            exports:"SQ.Login"
        }
    }
});

require( ["box","client", "sq.login"], function( Box, client ) {
    var url = SQ.getParam( "backUrl" ),
        account = SQ.getParam( "a" ),
        password = SQ.getParam( "p" ),
        gameid = SQ.getParam( "g" ),
        options = {
            gameid: gameid || 0,
            remember_me: 0,
            save_state: 1,
            ltype: 2,
            ajax: 0
        };
    if ( account && password ) {
        options.login_account = account;
        options.password = password;
        SQ.Login.checkUsername(account);
        SQ.Login.toLog( $.extend({
            success: function() {
                location.href = decodeURIComponent( url );
                return;
            },
            fail: function( res ) {
                $( ".error-div" ).show();
            }
        }, options ) );
    } else {
        $( ".error-div" ).show();
    }
    $( document )
    .on( "click.login", "#toLogin", function() {
        client.DoSuperCall( 105, {
            relogin: 0,
            url: url
        });
    });
});