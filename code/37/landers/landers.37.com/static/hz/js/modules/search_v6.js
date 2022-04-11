require.config({
    baseUrl:"/static/hz/js",
    urlArgs:"t=2018042703VER&c=c",
    paths: {
        "jQuery":"lib/landers.core",
        "sq.core": "lib/sq.core",
        "sq.tab": "http://ptres.37.com/js/sq/widget/sq.tab",
        "sq.statis": "http://ptres.37.com/js/sq/widget/sq.statis",
        "sq.tooltip":"http://ptres.37.com/js/sq/widget/sq.tooltip",
        "sq.login":"http://ptres.37.com/js/sq/widget/sq.login",
        "placeholder":"http://ptres.37.com/js/jquery.placeholder.min",
        "sq.fixed":"http://ptres.37.com/js/sq/widget/sq.fixed",
        "jQuery.nicescroll":"http://ptres.37.com/js/sq/plugin/jquery.nicescroll.min",
        "box":"modules/box_v6",
        "client":"client",
        "util":"util"
    },
    shim:{
        "sq.core" :{
            deps:["jQuery"],
            exports:"SQ"
        },
        'sq.statis':{
            deps:['sq.core']
        },
        'sq.fixed':{
            deps:['sq.core']
        },
        "sq.tab":{
            deps:["sq.core"],
            exports:"SQ.Tab"
        },
        'sq.tooltip':{
            deps:['sq.core']
        },
        "sq.login":{
            deps:['sq.core']
        },
        'jQuery.nicescroll':{
            deps:['sq.core']
        },
        'placeholder':{
            deps:['sq.core']
        }
    }
});

require( ["client", "box","util", "sq.tab","jQuery.nicescroll","placeholder","sq.fixed"], function( client, Box, Util ) {



var searchTop={
    //urlTab:"http://ptres.37.com/content/s_www/gb_find_games.js",
    //urlRdm:"http://ptres.37.com/content/s_www/gb_income_games.js",
    urlTab:'http://ptres.37.com/content/s_www/gb_find_games_v2.js',
    urlRdm:'http://ptres.37.com/content/s_www/gb_income_games_v2.js',
	data:[],
	groupData:[],//二维数组
	rdmData:[],
    statCode:[[167,168,169,170],[171,172,173,174],[175,176,177,178],[179,180,181,182],[183,183,183,183]],
	init:function(){
        var _this = this;
        this.game = Box.Game;
        this.data = this.game.data;

        Box.Client.init();//如果要让Box.Client里的setInfo执行就要调一下，靠box里的new client是没用的
        Box.User.checkLogin(function( data ) {
            Box.Played.init();
            new Box.Servers();
            _this.loadGroup();
            new Box.Jumps();
            //埋点统计初始化
            Util.statistics.init( data.LOGIN_ACCOUNT );
        }, function() {
            new Box.Servers();
            _this.loadGroup();
            new Box.Jumps();
            //埋点统计初始化
            Util.statistics.init();
        });

		this.$searchTab = $("#searchTab");
		this.contentHtml = $("#searchTopItem").html();

		this.events();
	},
    /**
     * 绑定事件
     */
	events:function(){
		var _this = this;
		this.$searchTab.on('click', 'a.rdm', function(event) {
        	event.preventDefault();
        	_this.createRdmGame();
        }).on('click', 'a.icon-praise', function(event) {
            event.preventDefault();
            _this.praise($(this));
        });
	},
	/**
	 * 根据tab数据中的id，获取对应的游戏信息
	 * @return {[type]} [description]
	 */
	setGameData:function(){
		var _this = this,obj = {},newGame = null;
		$.each(_this.groupList.data, function(index, val) {
			newGame = {};
			obj = {};
			obj.index = index;
			obj.group_name = val.group_name;
			obj.games = [];
			for(var i=0,len=val.list.length;i<len;i++){
				newGame = _this.game.getGameById(val.list[i].game_id);
				if($.isEmptyObject(newGame)){
					continue;
				}
				$.extend(newGame, val.list[i]);

				obj.games.push(newGame);
				if(obj.games.length >= 4){
					break;
				}
			}
			_this.groupData.push(obj);
		});
	},
    /**
     * 加载随机数据池
     */
    loadRdmGame:function(){
        var _this = this;
        $.ajax({
            url: _this.urlRdm,
            type: 'GET',
            dataType: 'script'
        }).done(function() {
            _this.createRdmGame();
            _this.initTab();
        }).fail(function() {
            _this.$searchTab.children(".m-tab-main-v2:last").html("数据加载出错！");
        });
    },
    /**
     * 创建随机游戏列表
     */
	createRdmGame:function(){
        var _this = this,game=null,arr = [];
        _this.rdmList = sq_content_s_www_gb_income_games_v2 || [];
        if(!_this.rdmData || _this.rdmData.length===0){
            $.each(_this.rdmList.data, function(index, val) {
                game = _this.game.getGameById(val.game_id);
                if(!$.isEmptyObject(game)){
                    $.extend(game, val);
                    _this.rdmData.push(game);
                }
            });
        }
        arr = _this.getRdmData();
        _this.createGroupContent(_this.groupList.data.length,arr);
	},
    /**
     * 从数据中随机抽取数据
     * @returns {Array}
     */
	getRdmData:function(){
		var tmpIndex=0,arr = [], poolLen = this.rdmData.length,maxLen = poolLen > 4 ? 4 : poolLen;
        this.resetIndexArr(poolLen);
		for(var i=0;i<maxLen;i++){
            tmpIndex = this.getUniqueIndex();
			arr.push(this.rdmData[tmpIndex]);
		}
		return arr;
	},

    /**
     * 重置索引数组
     */
    resetIndexArr:function(maxLength){
        if(this.indexArr.length > 0){
            this.indexArr.splice(0,this.indexArr.length);
        }
        for(var i= 0;i<maxLength;i++){
            this.indexArr.push(i);
        }
    },
    indexArr:[],
    /**
     * 随机抽取一数组中的一个索引
     * @returns {*}
     */
    getUniqueIndex:function(){
        var tmpIndex = Box.getRdm(this.indexArr.length-1);
        return this.indexArr.splice(tmpIndex,1)[0];
    },
    /**
     * 加载推荐区的主要数据
     */
    loadGroup:function(){
        var _this = this;
        $.ajax({
            url: _this.urlTab,
            type: 'GET',
            dataType: 'script'
        }).done(function() {
            _this.createGroup();
        }).fail(function() {
            _this.$searchTab.html("数据加载出错！");
        });
    },
    /**
     * 创建除随机数据之外的几个组
     */
	createGroup:function(){
        var _this = this,arr = [];
        _this.groupList = sq_content_s_www_gb_find_games_v2 || {};
        _this.setGameData();
        $.each(_this.groupData, function(index, val) {
            arr.push('<a href="javascript:;">',val.group_name,'</a>');
            _this.createGroupContent(index,val.games);
        });
        // arr.push('<a href="javascript:;" class="rdm"><span>随机召唤</span> <em class="icon-sync"><i>&nbsp;</i></em></a>');
        _this.$searchTab.children(".m-tab-menu-v2").html(arr.join(""));
        _this.loadRdmGame();
	},
    /**
     * 创建内容
     * @param index
     * @param games
     * @returns {boolean}
     */
	createGroupContent:function(index, games){
		var _this = this,
            $ul = this.$searchTab.children("ul").eq(index);
        $.each(games, function(idx, val) {
            if($.isEmptyObject(val)){
                return true;
            }
            //当盒子不支持H5游戏时跳过
            if ( !Box.Client.ish5 && val.CATEGORY && +val.CATEGORY !== 1 ) {
                //return true;
            }
            //当是H5游戏时添加内容
            if ( +val.CATEGORY === 2 ) {
                var account = "";
                if ( Box.User.info ){
                    account = Box.User.info.LOGIN_ACCOUNT
                }
                val.account = account;
                val.SNAME = encodeURIComponent( "H5游戏" );
                val.refer = "ha_pt_37yyhz";
                val.uid = "searchhot";
            }
            val.actionid = !_this.statCode[index][idx] ? 0 : _this.statCode[index][idx];
            val.NAME_URL = encodeURIComponent(val.NAME);
            val.HOSTS = Box.HOSTS;
            val.photo_bid = typeof val.photo_bid != "undefined" ? val.photo_bid : '';
        });
		$ul.html(SQ.T(this.contentHtml,games));
        _this._loadImgs($ul);
	},

    _loadImgs:function($el){
        $el.find("img").each(function(index,val){
            var $this = $(this);
            $this.prop("src",$this.data("src"));
        });
    },
    /**
     * 初始化标签
     */
	initTab:function(){
		this.tab1 = new SQ.Tab({
		    el: "#searchTab",
		    tabs: ".m-tab-menu-v2 a",
		    panels: ".m-tab-main-v2",
		    eventType: "mouseenter",
		    index: 0,
		    auto: false,
		    interval: 5000,
		    currentClass: "hover"
		});
		this.tab1.bind("change",function(index){
		    //this 指向SQ.Tab实例化对象，this = tab
		    this.panels.eq(index).find("img").each(function(index, val) {
		    	 /* iterate through array or object */
		    	var $this = $(this);
		    	$this.prop("src",$this.data("src"));
		    });
		});
	},
    /**
     * 点赞
     * @return {[type]} [description]
     */
    praise:function($a){
        var _this = this,
            game_id = $a.data("id"),
            isPraise = $a.data("praise");
        if(isPraise === true){
            // alert("您已经赞过了，休息一下哦！");
            return;
        }
        $.ajax({
            url: 'http://game.37.com/index.php?action=act_good_click',
            type: 'GET',
            dataType: 'jsonp',
            data: {gameid: game_id}
        })
        .done(function(data) {
            var $span = $a.next("span"),
                num = parseInt($span.text(),10);
            if(data.code != 1){
                alert("点赞失败");
                return;
            }
            $span.text(++num + "赞");
            $a.data("praise",true);
        })
        .fail(function() {
            alert("点赞失败！");
        });
    },
    /**
     * 获取url中的统计参数
     * @param url
     * @param code
     * @returns {string}
     */
    getStatUrl:function(url,code){
        if(!code){
            return url;
        }
        var sign = url.indexOf('?')>-1 ? '&' : '?';
        return url + sign + 'wd_actionid=' + code;
    }
}

$(document).ready(function($) {
    Box.init();
    //当盒子不支持H5游戏时隐藏游戏类别
    if ( !Box.Client.ish5 ) {
        //$( "#searchGameCate" ).hide();
    }
    new Box.Search();
    searchTop.init();
});


});
