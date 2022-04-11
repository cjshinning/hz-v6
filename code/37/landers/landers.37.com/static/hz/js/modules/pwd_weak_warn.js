require.config({
    baseUrl:"/static/hz/js",
    urlArgs:"t=20160612103000VER&c=c",
    paths: {
        "jQuery":"lib/landers.core",
        "sq.core": "lib/sq.core",
        "util":"util"
    },  
    shim:{
        "sq.core" :{
            deps:["jQuery"],
            exports:"SQ"
        }
    }
});

require( 
    [
        "sq.core",
        "util"
    ], 
    function( SQ, Util) {
var app = {
    init: function() {
        this._getInfo();
    },
    la: "",
    _getInfo: function() {
        var currentUrl = location.href,
            infoStr = "",
            infoArr = [],
            $modifyPw = $("#lwModifyPw"),
            $lwLoginTime = $("#lwLoginTime"),
            $lwLoginArea = $("#lwLoginArea"),
            $lwLoginType = $("#lwLoginType"),
            $lwModifyPw = $("#lwModifyPw"),
            _this = this;

        if (currentUrl.indexOf("?") > -1) {
            infoStr = decodeURIComponent(currentUrl.split("?")[1]);
            infoArr = infoStr.split("|");

            if ($.isArray(infoArr)) {
                $lwLoginArea.text(infoArr[0]);
                $lwLoginTime.text(infoArr[1]);
                infoArr[2] = infoArr[2]*1 === 1 ? "平台登录" : "游戏登录";
                $lwLoginType.text(infoArr[2]);
                //用户名
                _this.la = infoArr[3];
            }
        }

    }
};

        $(document).ready(function () {
            setCookie("ie11", 1);
    app.init();
    //埋点统计初始化
    Util.statistics.init(app.la);

    $("#lwModifyPw").click(function () {
        localStorage.setItem("time",new Date().getDate())

    })
});

function getCookie(name) {
    var result;
    return (result = new RegExp("(?:^|; )" + name + "=([^;]*)").exec(document.cookie)) ? decodeURIComponent(result[1]) : null;
}
function setCookie(name,value){
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days*24*60*60*1000);
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
}

});