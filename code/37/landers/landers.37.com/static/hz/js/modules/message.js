require.config({
    baseUrl:"/static/hz/js",
    paths: {
        "jQuery":"lib/landers.core",
        "sq.core": "lib/sq.core",
        "sq.tab": "http://ptres.37.com/js/sq/widget/sq.tab",
        "sq.statis": "http://ptres.37.com/js/sq/widget/sq.statis",
        "sq.tooltip":"http://ptres.37.com/js/sq/widget/sq.tooltip",
        "jQuery.nicescroll":"http://ptres.37.com/js/sq/plugin/jquery.nicescroll.min",
        "sq.login":"http://ptres.37.com/js/sq/widget/sq.login",
        "box":"modules/box",
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
    "box", 
    "client",
    "util",
    "jQuery.nicescroll"
    ], 
    function( SQ, Box, client, Util ) {


var message = {
    focus: 1,
    unread: 0,
    msgCache: {},
    newMsgCache: {},
    msgUrl: 'http://my.37.com/user/message.php?action=lander_list',
    msgMoreList: 'http://my.37.com/user/message.php?action=getMsgList',
    init: function( d ) {
        this.config = d || {
            pageSize: 0,
            msgClass: [],
            nullMsg: ""
        };

        this.$msgHeader = $("#msgHeader");
        // this.$tabA = $( ".msg-panel-a" );
        this.$tabLi = this.$msgHeader.children("li");
        // this.$tabDel = this.$msgHeader.find( ".btn-close-p" );
        // this.$tabArrow = this.$tabLi.find( ".msg-arrow" );
        this.$msgLoading = $( ".msg-loading" );
        this.$msgList = $( ".msg-list" );
        this.tplhtml = $( "#template_list" ).html();
        Box.User.checkLogin( function( data ) {
            //埋点统计初始化
            Util.statistics.init( data.LOGIN_ACCOUNT );
        }, function() {
            //埋点统计初始化
            Util.statistics.init();
        } );

        this.events();
        this.parse();
    },
    events: function() {
        var that = this;
        this.$msgHeader.on('click.tab', '.menu', function(event) {
            event.preventDefault();
            
            var $li = $( this ).parent();
            that.$msgHeader.find(".btn-close-p").hide();
            $li.find( ".btn-close-p" ).show();
            that.showMsg( $li.data( "k" ), $li );
        }).on( "click.delete", "a.btn-close-p", function( e ) {
            e.preventDefault();
            that.deleteAll( $(this.parentNode) );
        });
        this.$msgList.on( "click.close", "a.msg-close", function( e ) {
            e.preventDefault();
            that.deleteOne( $(this.parentNode.parentNode) );
        }).on( "click", "a.msg-more", function( e ) {
            var $this = $( this ),
                index = $this.data( "index" ),
                count = $this.data( 'count' ),
                pageIndex = $this.data( "pageIndex" ) || 1,     //第几页信息
                pageCount = Math.ceil( count / that.config.pageSize );  //总页数
            if( pageIndex >= pageCount ) {
                return;
            }
            pageIndex++;

            that.getMsg( index, $this, pageIndex, count );

        });
    },
    parse: function() {
        var that = this,
            panelHtml = '<div class="msg-list-panel" id="panel-{id}">{list}</div>',
            moreHtml = '<a href="javascript:;" class="msg-more" data-index="{id}" data-count="{count}">加载更多</a>',
            nullHtml = '<div class="msg-null">{msg}</div>';

        $.ajax({
            url : this.msgUrl,
            dataType : "jsonp",
            data: {
                ajax: 0
            }
        }).done(function( res ) {
            if( !res || !res.code ) return;
            if ( res.code == 1 ) {
                var list = [],
                    data = res.data,
                    i = 0,
                    p = that.config.pageSize,
                    type = that.config.msgClass;
                    l = type.length,
                    readnum = 0;

                that.$msgLoading.hide();
                for( ; i < l; i++ ) {
                    var content = data[ type[i] ].list,
                        id = type[ i ],
                        panel = "";

                    that.msgCache[ id ] =  content;
                    that.newMsgCache[ id ] = data[ type[i] ].new_num;
                    that.unread += data[ type[i] ].new_num;
                    if ( content.length > 0 ) {
                        if ( content.length > p ) {
                            panel = that.getMsgHtml( content.slice( 0, p ));
                            panel += moreHtml.replace( "{id}", id ).replace( "{count}", data[ type[i] ].count );
                        } else {
                            panel = that.getMsgHtml( content );
                        }
                        list.push( panelHtml.replace( "{id}", id ).replace( "{list}", panel ));
                    } else {
                        list.push( panelHtml.replace( "{id}", id ).replace( "{list}", nullHtml.replace( "{msg}", that.config.nullMsg )));
                    }
                    if ( i > 0 && data[ type[i] ].new_num > 0 ) {
                        that.$tabLi.filter( "[data-k='" + id + "']" ).addClass( "msg-unread" );
                    }
                }
                that.$msgList.html( list.join( "" ));
                $( "#panel-" + type[ 0 ] ).fadeIn();
                readnum = that.unread - that.newMsgCache[ type[ 0 ]];
                that.unread = readnum;
                client.DoSuperCall( 121, {
                    msgtype: type[ 0 ],
                    msgnum: readnum
                });
                that.newMsgCache[ type[ 0 ]] = 0;
                //that.logReadStatus( type[ 0 ] );
                that.$msgList.niceScroll({
                    autohidemode: false,
                    cursorcolor:"#cbd0d5",horizrailenabled:false,cursorwidth:"8px",
                    cursorborder: "none"
                });
            }
        });

    },
    showMsg: function( index, $tabLi ) {
        var readnum = 0;
        this.$msgList.find( "div.msg-list-panel" )
            .filter( "#panel-" + this.focus ).hide()
            .end()
            .filter( "#panel-" + index ).fadeIn();

        this.$tabLi.removeClass( "focus" ).find( ".msg-arrow" ).hide();
        $tabLi.addClass( "focus" ).find( ".msg-arrow" ).show();
        if ( $tabLi.hasClass( "msg-unread" )) {
            //$tabLi.removeClass( "msg-unread" );
            readnum = this.unread - this.newMsgCache[ index ];
            this.unread = readnum;
            client.DoSuperCall( 121, {
                msgtype: index,
                msgnum: readnum
            });
            this.newMsgCache[ index ] = 0;
            $tabLi.removeClass( "msg-unread" );
            //this.logReadStatus( index );
        }

        this.focus = index;
    },
    getMsg: function( index, $this, pageIndex, count ) {
        var data = this.msgCache[ index ],
            p = this.config.pageSize,
            next = p * pageIndex,
            isHide = false;

        if ( next >= count ) {
            next = count;
            isHide = true;
        }
        $this.before( this.getMsgHtml( data.slice( p * ( pageIndex - 1 ), next )));
        $this.data( 'pageIndex', pageIndex );
        this.$msgList.niceScroll().resize();
        if( isHide ) {
            $this.hide();
        }
    },

    getMsgHtml:function( data ) {
        var harr = [];
        for( var i = 0, len = data.length; i < len; i++ ) {
            var td = data[i];
            harr.push( SQ.T( this.tplhtml, td ).replace( "{MESSAGE_CONTENT}", td.MESSAGE_CONTENT ));
        }
        return harr.join('');
    },

    deleteOne: function( $list ) {
        var id = $list.attr( "data-id" ),
            that = this,
            $parent = $list.parent();

        if ( id ) {
            $.ajax({
                url : "http://my.37.com/user/message.php?action=delete&id=" + id,
                dataType : "jsonp",
                data: {
                    ajax: 0
                }
            }).done(function( res ) {
                if ( res.code == 0 ) {
                    $list.remove();
                    if ( !$parent.find( "div.msg-content" ).length ) {
                        location.reload();
                    }
                } else {
                    alert( res.msg );
                }
            });
        }
    },

    deleteAll: function( $list ) {
        var ids = [];

        ids.push( $list.data( 'k' ));

        $.ajax({
            url : "http://my.37.com/user/message.php?action=delete&param=list",
            dataType : "jsonp",
            data: {
                type_ids: ids,
                ajax: 0
            }
        }).done(function( res ) {
            if ( res.code == 0 ) {
                location.reload();
            } else {
                SQ.alert( res.msg );
            }
        });
    },

    logReadStatus:function( id ){
        var url = 'http://my.37.com/user/message.php?action=logReadStatus&msg_type=' + id,
            that = this;
        /*
        $.ajax({
            url : url,
            dataType : "jsonp",
            data: {
                msg_type: id,
                ajax: 0
            },
            success: function( data ) {
                if ( data.code == 1 ) {
                    //alert("eee");
                }
            }
        });*/
        $.get( url );
    }
}


$(document).ready(function($) {
    message.init({
        pageSize: 3,
        msgClass: [ 1, 2, 4, 5],
        nullMsg: "^_^ 暂无消息 ^_^"
    });
});

});