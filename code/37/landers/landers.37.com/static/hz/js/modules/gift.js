require.config({
    baseUrl:"/static/hz/js",
    urlArgs:"t=2018042501VER&c=c",
    paths: {
        "jQuery":"lib/landers.core",
        "sq.core": "lib/sq.core",
        "sq.tab": "//ptres.37.com/js/sq/widget/sq.tab",
        "sq.statis": "//ptres.37.com/js/sq/widget/sq.statis",
        "sq.tooltip":"//ptres.37.com/js/sq/widget/sq.tooltip",
        "jQuery.nicescroll":"//ptres.37.com/js/sq/plugin/jquery.nicescroll.min",
        "sq.dialog":"//ptres.37.com/js/sq/widget/sq.dialog",
        "sq.login":"//ptres.37.com/js/sq/widget/sq.login",
        "box":"modules/box",
        "ZeroClipboard":"//ptres.37.com/js/sq/plugin/ZeroClipboard.min",
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
    "box",
        "ZeroClipboard",
    "sq.core",
    "jQuery.nicescroll"
    ], 
    function( Box, ZeroClipboard ) {

var Gift = new SQ.Class();
Gift.include({
    url_gc:"//gift.37.com/?c=box&a=get_game_gift_list",
    url_gs:"http://shop.37.com/controller/api/goods_api.php?action=get_goods_list",
    //url_nb: "//gameapp.37.com/controller/card.php",
    url_nb:"//gift.37.com/?c=card&a=get&type=5&format=jsonp",
    url_h5g: "//gift.37.com/h5/?c=h5-main&a=get_game_gifts&format=jsonp",
    init:function(){
        var _this = this;
        this.game_id = SQ.getParam("game_id");
        this.server_id = SQ.getParam("server_id");
        this.wd_subaccount = SQ.getParam("wd_subaccount");
        this.ish5 = SQ.getParam("wd_IsH5Game");
        if(!this.game_id){
            return;
        }
        this.$el = $("#giftList");
        Box.User.checkLogin(function(){
            if ( +_this.ish5 === 1 ) {
                _this.h5event();
                _this.getH5GiftList().always( function() {
                    _this.initScroll();
                } );
            } else {
                if(_this.wd_subaccount === "1"){
                    $("#newbie").html("高额礼包 免费领取 增强实力 加速升级");
                    _this.$el.find("a.copy").html("领取").attr({"href":"//game.37.com/getcard_"+_this.game_id+".html","target":"_blank"});
                }else{
                    _this.getNewbieData();
                }
                _this.getGiftCenter().always(function(){
                    _this.getGiftShop().always(function(){
                        _this.initScroll();
                    });
                });
                _this.$el.show();
            }
        },null);

        window.focus();
    },
    h5event: function() {
        var _this = this;
        $( document )
            .on( 'click', '.getgift', function() {
                var $this = $( this );
                if ( $this.hasClass( 'getgift-no' ) || $this.hasClass( 'getgift-xh' ) ) {
                    //礼包已领完
                    return;
                } else {
                    if ( $this.hasClass( 'hasget' ) ) {
                        var card = $( this ).data( 'card' );
                        $( '#gift-dialog-card' ).val( card );
                        $( '#mask' ).show();
                        $( '.c-gift-dialog' ).show();
                    } else if ( $this.hasClass( 'hascopy' ) ) {
                        return;
                    } else {
                        if ( $this.hasClass( 'h5pending' ) ) {
                            return;
                        }
                        $this.addClass( "h5pending" );
                        _this.getH5GiftCard( $this, $this.data( 'giftid' ) );
                    }
                }
            } );
    },
    getH5GiftList: function() {
        var _this = this;
        return $.ajax( {
            url: this.url_h5g,
            type: 'GET',
            dataType: 'jsonp',
            data: {
                game_id: this.game_id
            }
        })
        .done( function( res ) {
            if ( res && +res.code === 1 ) {
                if ( res.data.list.length > 0 ) {
                    _this._renderGiftList(res.data.list);
                    _this.$el.show();
                } else {
                    _this.$el.hide();
                    $( "#glNotGift" ).show();
                }
                _this.hasgetgift = true;
            }
        } );        
    },
    /**
     * 渲染礼包列表
     * @param  {Array} datalist 礼包对象数组
     */
    _renderGiftList: function( datalist ) {
        var _this = this,
            tpl = $("#tmpH5G").html(),
            html = '';
        for ( var i = 0; i < datalist.length; i++ ) {
            var data = datalist[i];
            html += _this._renderPerGiftList(data, tpl);
        }

        this.$el.html(html);
    },

    _renderPerGiftList: function(data, tpl) {
        var _this = this,
            html = '';
        html = tpl.replace(/{\$id}/g, data.id)
                   .replace(/{\$get_mode}/g, data.get_mode)
                   .replace(/{\$name}/g, data.name)
                   .replace(/{\$description}/g, data.description + "<br/><span class='h5cardline'>领取码：<span class='h5card'>" + ((data.stock > 0) ? '请领取' : '已领完') + "</span></span>")
                   .replace(/{\$game_id}/g, data.game_id)
                   .replace(/{\$text}/g, (data.stock > 0) ? '领取' : '已领完');
        if ( +_this.wd_subaccount === 1 && data.stock > 0 ) {
            html = html.replace( "{$view_url}", "//game.37.com/h5/detail.php?game_id=" + this.game_id )
                        .replace(/{\$class}/g, 'getgift-xh' )
                        .replace( "{$target}", "_blank" );
        } else {
            html = html.replace( "{$view_url}", "#" )
                        .replace(/{\$class}/g, (data.stock > 0) ? '' : 'getgift-no')
                        .replace( "{$target}", "_self" );
        }
       return html;
    },
    getH5GiftCard: function( $dom, giftid ) {
        var _this = this,
            $tar = $( '.m-gift[data-giftid="' + giftid + '"]' ),
            $msg = $tar.find( ".h5card" );
        $.ajax( {
            url: '//gift.37.com/h5/?c=card&a=get',
            dataType: 'jsonp',
            jsonp: 'callback',
            timeout: 10000,
            data: {
                type: 7,
                gift_id: giftid,
                format: 'jsonp'
            },
            success: function( res ) {
                $dom.removeClass( "h5pending" );
                if ( res && ( res.code == 0 || +res.code === 10 ) && res.data ) {
                    $tar.find( ".h5cardline" ).show();
                    $msg.html( res.data.card );
                    $dom.addClass( 'hasget' ).attr( 'data-clipboard-text', res.data.card ).text( '复制' );
                    _this.copyDom = $dom;
                    _this.initH5Clip( $dom ).on( "complete", function( client ) {
                        _this.copied();
                        _this.copyDom.addClass( 'hascopy' ).removeClass( 'hasget' );
                    });
                } else if ( +res.code === 10000 ) {
                    $msg.html( '当前登录信息已过期，请重新登录' );
                } else {
                    $msg.html( res.msg );
                }
            },
            error: function( e ) {
                $dom.removeClass( "h5pending" );
                $msg.html( '网络不畅，请您重新尝试' );
            }
        } );
    },

    initH5Clip:function( $copy ){
        var _this = this;
        ZeroClipboard.setDefaults({
            trustedOrigins: [window.location.protocol + "//" + window.location.host],
            allowScriptAccess: "always"
        });
        var clip = new ZeroClipboard( $copy, {
            moviePath: "//ptres.37.com/js/sq/plugin/ZeroClipboard.swf",
            el: $copy
        });
        return clip;
    },
    getGiftCenter:function(){
        var _this = this;
        return $.ajax({
            url: this.url_gc,
            type: 'GET',
            dataType: 'jsonp',
            data: {game_id: this.game_id}
        })
        .done(function(data) {
            _this.render(data,"tmpGC");
        });        
    },
    getGiftShop:function(){
        var _this = this;
        return $.ajax({
            url: this.url_gs,
            type: 'GET',
            dataType: 'jsonp',
            data: {"virturl_count": 10,"physical_count":0,"bbs_count":0,"gameid":this.game_id}
        })
        .done(function(data) {
            _this.render(data,"tmpGS");
        });        
    },
    render:function(data,tmpId){
        var _this = this;
        if(data.code != 1 || !data.data.length){
            return;
        }
        $.each(data.data, function(index, val) {
            var arr = [];
            if(val.hasOwnProperty("GOODS_DESCRIPT")){
                _this.formatDesc(val,"GOODS_DESCRIPT");
            }else if(val.hasOwnProperty("decription")){
                _this.formatDesc(val,"decription");
            }
        });
        var html = $("#"+tmpId).html();
        html = SQ.T(html,data.data);
        this.$el.append(html);
    },
    formatDesc:function(val,prop){
        val[prop] = SQ.decodeHTML(val[prop]);
        if(val[prop].indexOf("领取方式") > -1){
            arr = val[prop].split("领取方式");
            val[prop] = arr[0].replace("<br/>","").replace("<br />","").replace("<br>","");
        }
        val[prop] = val[prop].replace("<br/>","").replace("<br />","").replace("<br>","").replace('<br/>','');
        val[prop] = val[prop].replace(/<img(.*?)>/ig,'');
    },
    initScroll:function(){
        this.$el.niceScroll({cursorcolor:"#cbd0d5",autohidemode: false,horizrailenabled:false,cursorwidth:"8px"});
    },

    initClip:function($copy){
        var _this = this;
        ZeroClipboard.setDefaults({
            trustedOrigins: [window.location.protocol + "//" + window.location.host],
            allowScriptAccess: "always"
        });
        var clip = new ZeroClipboard( $copy, {
            moviePath: "//ptres.37.com/js/sq/plugin/ZeroClipboard.swf"
        });
        clip.on( "complete", function() {
            _this.copied($copy);
        });
    },

    copied:function($this){
        var _this = this,
            $msgCopied = $("#msgCopied");
        $this && $this.html( "已复制" );

        $msgCopied.show().css({"position":"absolute",top:"1px",left:"300px"});
        if(_this.timer){
            clearTimeout(_this.timer);
        }
        _this.timer = setTimeout(function(){
            $msgCopied.hide("slow");
        },3000);
    },

    /**
     * 显示处理后的html
     */
    getNewbieData: function() {
        var _this = this;
        this.getCard( function( res ) {
            $( "#newbie" ).html( '激活码：<span class="card" id="showCard">' + res.data.card + '</span><br/>服务器：双线' + _this.server_id + '服' );
            var $copy = $("#btnCopy").show();
            _this.initClip($copy);
        }, function( msg ) {
            $( "#newbie" ).html( msg );
            _this.$el.find("a.copy").hide();
        })
    },
    /**
     * 获取新手卡
     * @param suc {function} 获取成功的处理
     * @param fai {function} 获取失败的处理
     */
    getCard: function( suc, fai ) {
        $.ajax({
            url : this.url_nb,
            type:"GET",
            dataType : "jsonp",
            data:{"game_id":this.game_id,"sid":this.server_id}
        }).done(function( res ) {
            if($.isEmptyObject(res)) {
                fai.call(this,"网络异常，未收到返回数据，请刷新重试或联系客服");
                return;
            }
            switch( res.code ) {
                case 1:
                    suc.call( this, res ); //领取成功
                    break;
                case 2:
                    suc.call( this, res ); //已经领过
                    break;
                 /*case 3:
                    fai.call( this, "领取失败，新手卡已领空！" );
                    break;
                case -1:
                    fai.call( this, "请您先登录！" );
                    break;
                case -2:
                    fai.call( this, "领取失败，该服尚未开启" );
                    break;
                case -3:
                    fai.call( this, "领取失败，参数错误" );
                    break;*/
                default :
                    fai.call( this, res.msg);
            }
        }).fail(function(){
            fai.call(this,"网络异常，请刷新重试或联系客服");
        });
    }

});
$(document).ready(function($) {
    $(document.body).trigger('click');
    new Gift();
});

});