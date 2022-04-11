require.config({
    baseUrl: '/static/hz/js',
    paths: {
        'jQuery': 'lib/landers.core',
        'sq.core': 'lib/sq.core',
        'sq.tab': '//ptres.37.com/js/sq/widget/sq.tab',
        'sq.statis': '//ptres.37.com/js/sq/widget/sq.statis',
        'jQuery.nicescroll': '//ptres.37.com/js/sq/plugin/jquery.nicescroll.min',
        'sq.dialog': '//ptres.37.com/js/sq/widget/sq.dialog',
        'sq.login': '//ptres.37.com/js/sq/widget/sq.login',
        'sq.count': '//ptres.37.com/js/sq/widget/sq.count',
        'Clipboard': '//ptres.37.com/js/sq/plugin/clipboard.min',
        'client': 'client'
    },  
    shim: {
        'sq.core': {
            deps: ['jQuery'],
            exports: 'SQ'
        },
        'sq.statis': {
            deps: ['sq.core']
        },
        'sq.tab': {
            deps: ['sq.core'],
            exports: 'SQ.Tab'
        },
        'jQuery.nicescroll': {
            deps: ['sq.core']
        },
        'sq.login': {
            deps: ['sq.core']
        },
        'sq.count': {
            deps: ['sq.core']
        },
        'sq.dialog': {
            deps: ['sq.core']
        }
    }
});


require(['sq.core', 'client', 'Clipboard', 'sq.dialog', 'sq.tab', 'sq.count'], function( SQ, client, Clipboard ) {
    var WIN = window;
    var GM = new SQ.Class();
    GM.include({
        init: function() {
            this.game_id = SQ.getParam('game_id');
            this.server_id = SQ.getParam('server_id');

            this.ajaxReceiveIndex();
            this.events();
            this.countDown();
        },

        payCoin: 0,     // 当前充值

        API: {
            indexPage: '//hdapi.37.com/?c=api&a=index_page&alias_info=gmtool20210518&f=d202105/gmtool20210518',     // 首页gm推荐
            giftList: '//hdapi.37.com/?c=api&a=gift_list&alias_info=gmtool20210518&f=d202105/gmtool20210518',     // 礼包列表
            recomList: '//hdapi.37.com/?c=api&a=default_recommend&alias_info=gmtool20210518&f=d202105/gmtool20210518',      // 首页暂无福利的时候推荐游戏
            recomGameList: '//hdapi.37.com/?c=api&a=game_recommend&alias_info=gmtool20210518&f=d202105/gmtool20210518',      // 领取礼包的时候推荐游戏
            payStatus: '//hdapi.37.com/?c=api&a=pay_status&alias_info=gmtool20210518&f=d202105/gmtool20210518',      // 用户充值情况
            getGift: '//hdapi.37.com/?c=api&a=get_gift&alias_info=gmtool20210518&f=d202105/gmtool20210518',      // 领取礼包
            myGift: '//hdapi.37.com/?c=api&a=my_gifts&alias_info=gmtool20210518&f=d202105/gmtool20210518',      // 我的奖励
        },

        events: function() {
            var _this = this;
            $(document)
                .on('click', '.btn-rule', function() {
                    _this.gmContainerState('rule');     // 显示规则页面
                })
                .on('click', '.btn-record', function(e) {
                    e.preventDefault();                 // 阻止默认行为。不然显示不了我的记录
                    _this.ajaxReceiveMyGift();          // 用户领取记录
                })
                .on('click', '.btn-back', function() {
                    _this.gmContainerState('gift');     // 显示礼包页面
                })
                .on('click', '.btn-receive', function() {
                    if($(this).hasClass('disabled')) return;

                    var giftName = $(this).prev('p.gift-name').html() || '礼包';
                    var giftId = $(this).data('giftid');
                    var type = $(this).data('type');        // 礼包类型
                    var consume = $(this).data('consume');  // 消耗的钱
                    var currentMoney = _this.payCoin;       // 当前充值的钱
                    var diffMoney = 0;                      // 差多少钱进入下一个档次
                    var nextLevel = 0;                      // 下一个档次的钱          

                    // 直接领取
                    if(+type ===1 || +type === 2 || +type === 7) {
                        return _this.ajaxReceiveGetGift(giftId, $(this));
                    }

                    var giftLevel = [
                        ['0', '1000'],
                        ['1001', '2000'],
                        ['2001', '5000'],
                        ['5001', '10000']
                    ];
        
                    $.each(giftLevel, function( index, val ) {
                        if(currentMoney >= +val[0] && currentMoney <= +val[1]) {
                            diffMoney = val[1] - currentMoney;
                            nextLevel = val[1];
                        }
                    });

                    // 如果差额<=500，提示差多少钱到下一档
                    if(diffMoney && diffMoney <= 500) {
                        new SQ.Dialog({
                            title: '温馨提示',
                            width: 360,
                            height: 120,
                            autoShow: true,
                            content: '<div class="gm-gift-obtain"><h3>领取<span>'+ giftName +'</span>将消耗<br/><span>'+ consume +'元</span>充值</h3><p>温馨提示：您还差<span>'+ diffMoney +'元</span>即可领取<span>'+ nextLevel +'元</span>充值礼包</p></div>',
                            classStyle: 'gm-dialog',
                            buttons: {
                                '去充值': {
                                    cls: 'btn-s-140',
                                    href: '//pay.37.com/?game_id=' + _this.game_id,
                                    target: 'target="_blank"'
                                },
                                '立即领取': {
                                    cls: 'btn-s-140',
                                    fn: function( name, obj ) {
                                        obj.destroy();
                                        _this.ajaxReceiveGetGift(giftId);
                                    }
                                }
                            }
                        });
                    } else {
                        new SQ.Dialog({
                            title: '温馨提示',
                            width: 360,
                            height: 80,
                            autoShow: true,
                            content: '<div class="gm-gift-obtain"><h3>领取<span>'+ giftName +'</span>将消耗<br/><span>'+ consume +'元</span>充值</h3></div>',
                            classStyle: 'gm-dialog',
                            buttons: {
                                '立即领取': {
                                    cls: 'btn-s-140',
                                    fn: function( name, obj ) {
                                        obj.destroy();
                                        _this.ajaxReceiveGetGift(giftId);
                                    }
                                }
                            }
                        });
                    }
                });
        },

        handlerIndex: function(res) {
            var _this = this;

            $('.gm-welfare')
                .on('click', '.btn-receive-tips', function() {
                    if(+res.result === 1) {
                        new SQ.Dialog({
                            title: '温馨提示',
                            width: 360,
                            height: 130,
                            autoShow: true,
                            content: '<div class="gm-gift-obtain"><p><img class="qrcode" src="'+ res.list.kf_info.qrcode +'"></p><p>请扫一扫添加GM小妹解锁</p></div>',
                            classStyle: 'gm-dialog',
                            buttons: {
                                '确定': {
                                    cls: 'btn-s-140',
                                    fn: function( name, obj ) {
                                        obj.destroy();
                                    }
                                }
                            }
                        });
                    } else {    // -30005，充值不足，提示差多少元
                        new SQ.Dialog({
                            title: '温馨提示',
                            width: 360,
                            height: 100,
                            autoShow: true,
                            content: '<div class="gm-gift-obtain"><h3>未开通GM特权</h3><p>温馨提示：您还差<span>'+ res.val +'元</span>即可添加GM小妹开通权限</p></div>',
                            classStyle: 'gm-dialog',
                            buttons: {
                                '去充值': {
                                    cls: 'btn-s-140',
                                    href: '//pay.37.com/?game_id=' + _this.game_id,
                                    target: 'target="_blank"'
                                }
                            }
                        });
                    }
                });
        },

        /**
         * 首页gm福利添加
         * @param  null
         */
        ajaxReceiveIndex: function() {
            var _this = this;

            $.ajax({
                url: _this.API.indexPage,
                type: 'get',
                dataType: 'jsonp',
                data: {
                    game_id: _this.game_id,
                    sid: _this.server_id
                }
            })
            .done(function(res) {
                if(+res.result === 1 || +res.result === -30005) {   // -30005，充值不足，只显示头像与名字
                    var renderData = {};
                    renderData.result = res.result;
                    renderData.val = res.val;
    
                    renderData.nick_name = res.list.kf_info.nick_name;
                    renderData.head_img = res.list.kf_info.head_img;
                    renderData.wechat = res.list.kf_info.wechat;
                    renderData.qrcode = res.list.kf_info.qrcode;
                    
                    $('.wf-gm').html(SQ.T($('#tplWelfare').html(), renderData));
                    $('.wf-gift-con ul').html(SQ.T($('#tplGiftLi').html(), res.list.index_img_info['gift_detail']));        // 获取【GM福利】中的礼包列表展示

                    _this.handlerIndex(res);

                    if(res.list.kf_info.wechat) {
                        _this.copy({
                            elem: '#btnCopy_' + res.list.kf_info.wechat
                        });
                    }

                    _this.gmContainerState('welfare');                          // 显示GM福利页面
                } else if(+res.result === -30000 || +res.result === -30001) {   // 没游戏礼包game_id和sid，显示推荐游戏
                    _this.ajaxReceiveRecom();
                    $('.noth-nogm').hide();
                    $('.noth-game').show();
                } else if(+res.result === -30002) {                             // -30002，特权用户，跳到礼包页面
                    _this.ajaxReceivePayStatus(function() {     // 获取用户充值情况，加载成功后再去显示游戏礼包列表
                        _this.ajaxReceiveGift();                // 获取游戏礼包列表
                    }); 
                    _this.ajaxReceiveRecomGame();               // 推荐游戏栏目
                } else {                                        // -30003，礼包信息缺失；-30004，没有客服
                    _this.ajaxReceiveRecom();
                }
            });
        },

        /**
         * 获取游戏礼包列表
         * @param  null
         */
        ajaxReceiveGift: function() {
            var _this = this;

            $.ajax({
                url: _this.API.giftList,
                type: 'get',
                dataType: 'jsonp',
                data: {
                    game_id: _this.game_id,
                    sid: _this.server_id
                }
            })
            .done(function(res) {
                if(+res.result === 1) {
                    $('.game-tab-1 em').html(res.list.game_name);
                    $('.server-name').html(res.list.server_name);

                    var giftList = res.list.gift_list;
                    if(giftList.length > 0) {
                        for(var i = 0; i < giftList.length; i++) {
                            var giftArr = giftList[i]['gift_arr'];
                            for(var j = 0; j < giftArr.length; j++) {
                                giftArr[j]['consume'] = res.list.arr_type_pay_limit[giftArr[j]['type']] || 0;
                                giftArr[j]['gift_list'] = SQ.T($('#tplGiftLi').html(), giftArr[j]['gift_detail']);
                            }
                            $('.gift-content-' + (i+1)).html(SQ.T($('#tplGift').html(), giftArr));
                        }
    
                        $('.gift-tab ul').html(SQ.T($('#tplGiftTab').html(), giftList));
                        $('.gift-tab ul').find('li a').eq(0).addClass('focus');

                        _this.handlerTab();
                    } else {
                        $('.gift-content-1').html($('#tplGiftNo').html());
                    }

                    _this.gmContainerState('gift');             // 显示礼包页面
                } else {
                    _this.ajaxReceiveRecom();
                }
            });
        },

        /**
         * 暂无福利的时候推荐游戏
         * @param  null
         */
        ajaxReceiveRecom: function() {
            var _this = this;

            $.ajax({
                url: _this.API.recomList,
                type: 'get',
                cache: false,
                dataType: 'jsonp'
            })
            .done(function(res) {
                if(+res.result === 1) {
                    var txt = SQ.T($('#tplRecom').html(), res.list);
                    $('.noth-rec').html(txt);
                    _this.gmContainerState('noth');             // 暂无GM福利的时候，显示GM特权游戏推荐
                }
            });
        },

        /**
         * 用户充值情况
         * @param  null
         */
        ajaxReceivePayStatus: function(callback) {
            var _this = this;

            $.ajax({
                url: _this.API.payStatus,
                type: 'get',
                cache: false,
                dataType: 'jsonp',
                data: {
                    game_id: _this.game_id,
                    sid: _this.server_id
                }
            })
            .done(function(res) {
                if(+res.result === 1) {
                    _this.payCoin = res.list.pay_coin;
                    $('.pay-coin').html(res.list.pay_coin + '元');
                    $('.consume-coin').html(res.list.consume_coin + '元');
                }

                typeof callback === 'function' && callback();
            });
        },

        /**
         * 领取礼包
         * @param  null
         */
        ajaxReceiveGetGift: function(giftId, $dom) {
            var _this = this;

            $.ajax({
                url: _this.API.getGift,
                type: 'get',
                cache: false,
                dataType: 'jsonp',
                data: {
                    game_id: _this.game_id,
                    sid: _this.server_id,
                    gift_id: giftId
                }
            })
            .done(function(res) {
                if(+res.result === 1) {
                    $dom && $dom.addClass('disabled').html('已领取');

                    var temp = '<div class="gm-gift-success"> \
                            <h3><span class="icon-success"></span>领取成功！</h3> \
                            <p class="gm-gift-box"><span \
                                class="gm-gift-num">'+ res.list.CARD_NUM +'</span><a href="javascript:;" title="复制" data-clipboard-text="'+ res.list.CARD_NUM +'" \
                                class="gm-gift-copy" id="btnCopy_'+ res.list.CARD_NUM +'">复制</a></p> \
                            <p class="gm-gift-tips">兑换码仅限使用一次，请勿泄露</p> \
                        </div>';

                    new SQ.Dialog({
                        title: '温馨提示',
                        width: 360,
                        height: 160,
                        autoShow: true,
                        content: temp,
                        classStyle: 'gm-dialog'
                    });
                    _this.copy({
                        elem: '#btnCopy_' + res.list.CARD_NUM
                    });

                    _this.ajaxReceivePayStatus();       // 用户领取完礼包后刷新充值情况
                } else if(+res.result === -30015) {
                    _this.gmAlert('礼包库存不足，请联系专属客服~');
                } else if(+res.result === -30018) {     // 请勿重复领取
                    _this.gmAlert('您已领过礼包，请到我的领取记录查看~');
                } else {
                    _this.gmAlert(res.msg);
                }
            });
        },

        /**
         * 获取推荐游戏栏目，有就显示栏目tab
         * @param  null
         */
        ajaxReceiveRecomGame: function() {
            var _this = this;

            $.ajax({
                url: _this.API.recomGameList,
                type: 'get',
                dataType: 'jsonp',
                data: {
                    game_id: _this.game_id,
                    sid: _this.server_id
                }
            })
            .done(function(res) {
                if(+res.result === 1) {
                    $('.game-tab-2').show();
                    $('.game-tab-2 em').html(res.list.game_name);
                    $('.game-desc span').html(res.list.game_description);
                    $('.game-desc a').attr('href', '//game.37.com/redirect.php?action=enter_game_newest&game_id='+ res.list.game_id +'&gamebox=1&wd_openingamebox=1&wd_entergame=1&wd_GAME_KEY='+ res.list.game_key +'&wd_GAME_ID=' + res.list.game_id);
                    $('.game-intro img').attr('src', res.list.game_description_img);

                    res.list['gift_list'] = SQ.T($('#tplGiftLi').html(), res.list['gift_detail']);
                    res.list['stime'] = res.list['stime'].split(' ')[0];
                    res.list['etime'] = res.list['etime'].split(' ')[0];
                    $('.gift-list-rec').html(SQ.T($('#tplGiftRec').html(), res.list));
                }
            });
        },

        /**
         * 领取礼包记录
         * @param  null
         */
        ajaxReceiveMyGift: function() {
            var _this = this;

            _this.gmContainerState('record');   // 显示领取记录页面

            $.ajax({
                url: _this.API.myGift,
                type: 'get',
                cache: false,
                dataType: 'jsonp',
                timeout: 5000,
                data: {
                    game_id: _this.game_id,
                    sid: _this.server_id
                }
            })
            .done(function(res) {
                if(+res.result === 1) {
                    if(res.list.length > 0) {
                        // var recordList = SQ.T($('#tplRecordTr').html(), res.list);

                        for(var i = 0; i < res.list.length; i++) {
                            res.list[i]['time_date'] = res.list[i]['time'].split(' ')[0];
                            res.list[i]['time_mins'] = res.list[i]['time'].split(' ')[1];

                            _this.copy({
                                elem: '#btnCopy_' + res.list[i]['card_num']
                            });
                        }
    
                        $('.r-content').html(SQ.T($('#tplRecordTable').html(), {
                            record_list: SQ.T($('#tplRecordTr').html(), res.list)
                        }));
                    } else {
                        $('.r-content').html($('#tplRecordNo').html());
                    }
                } else {
                    $('.r-content').html($('#tplRecordNo').html());
                }
            })
            .fail(function() {
                $('.r-content').html($('#tplRecordNo').html());
            });
        },

        setTime: function( time ) {
            var d,
                h,
                m,
                s,
                left = time - Date.parse( new Date() );

            if( left > 0 ) {
                d = Math.floor(left / (24*3600*1000));
                h = Math.floor((left % (24*3600*1000))/(3600*1000)) + d*24;
                m = Math.floor(((left % (24*3600*1000))%(3600*1000))/(60*1000));
                s = Math.floor(((left % (24*3600*1000))%(3600*1000)%(60*1000))/1000);
            } else {
                h = m = s = '00';
            }

            return h +':'+ m +':'+ s;
        },

        /**
         @description	抢卡时间倒计时
         */
        countDown: function() {
            var _this = this,
                h = new Date().getHours(),
                eTime = ''; 

            // 每天的凌晨5点清空
            if(h >= 5) {
                eTime = Date.parse(new Date(new Date().setHours(24, 0, 0, 5*60*60*1000)));
            } else {
                eTime = Date.parse(new Date(new Date().setHours(0, 0, 0, 5*60*60*1000)));
            }

            new SQ.Count({
                time: _this.setTime( eTime ),
                content: '{h}:{m}:{s}',
                auto: true,
                element: $('.count-time'),
                type: 'time',
                method: 'text'
            }).bind( 'finish', function() {
                _this.countDown();
            });
        },

        handlerTab: function() {
            $('.game-tab').length > 0 && SQ.Tab && new SQ.Tab({
                tabs: '.game-tab li a',
                panels: '.game-list'
            });

            if($('.gift-tab').length > 0 && SQ.Tab) {
                var tab = new SQ.Tab({
                    tabs: '.gift-tab li a',
                    panels: '.gift-box .gift-list'
                });

                tab.bind( 'change', function( index ) {
                    var lock = tab.tabs[ index ].getAttribute( 'data-lock' );
                    var payLimit = tab.tabs[ index ].getAttribute( 'data-pay' );
                    if(JSON.parse(lock)) {
                        $('.gift-box-mask').html(SQ.T($('#tplGiftLock').html(), {
                            show_pay_limit: payLimit
                        })).show();
                    } else {
                        $('.gift-box-mask').hide();
                    }
                });
            }
        },

        gmContainerState: function(page) {
            var page = page || 'welfare';
            $('.gm-box').hide();
            $('.gm-' + page).show();
        },

        gmAlert: function( msg ) {
            var dia = new SQ.Dialog({
                title: '温馨提示',
                width: 360,
                height: 60,
                autoShow: true,
                content: '<p class="tc">'+ msg +'</p>',
                classStyle: 'gm-dialog',
                buttons: {
                    '确定': {
                        cls: 'btn-s-140',
                        fn: function( name, obj ) {
                            obj.destroy();
                        }
                    }
                }
            });

            dia.el.children().eq(0).css({
                'z-index': 10000
            });
            dia.el.children().eq(1).css({
                'z-index': 10001
            });
        },

        copyCache: {},
        /**
    	@description	复制
    	*/
        copy: function( o ) {
            if( typeof Clipboard == 'undefined' ) return;
            
            var _this = this;
            if( _this.copyCache[o.elem] ) return;

            _this.copyCache[o.elem] = new Clipboard( o.elem );

            _this.copyCache[o.elem].on( 'success', function( e ) {
                _this.gmAlert( '复制成功~' );
            } );
            _this.copyCache[o.elem].on( 'error', function( e ) {
                _this.gmAlert( '由于系统不支持，请手动复制礼包码~' );
                _this.copyCache[ o.elem ].destroy();
            } );
        }

    });

    $(document).ready(function($) {
        new GM();
    });
});

