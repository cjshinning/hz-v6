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
        "SQ.ServerData":"http://ptres.37.com/js/sq/widget/sq.serverdata",
        "SQ.ServerSelect":"http://ptres.37.com/js/sq/widget/sq.serverselect",
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
        },
        'SQ.ServerData':{
            deps:['sq.core']
        },
        'SQ.ServerSelect':{
            deps:['SQ.ServerData'],
            exports:"SQ.ServerSelect"
        }
    },
    urlArgs:"t=20180313155000VER&c=c"
});
