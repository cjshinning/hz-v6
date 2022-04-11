/**
 * festival @VERSION@
 * @author hanzh
 * @date 2022-03-31
 *
 * @Depends
 *  jquery
 *  sq.core
 */

(function ($, SQ, undefined) {
    var hzFestival = function (options) {
        var that = this;
        /*
        options:{
            zIndex: 浮层的z-index
            wrap: 最外层包裹的html模板
            template: 可自定义显示的模板
            data: 可以是一个对象，也可以由对象为元素的数组，对象的结构看下面
        }
        data:{
            key: 浮层的唯一key，通常和接口的文件名对应
            storage: 保存数据的key
            exp: 保存天数
            val: 保存的数据
            count: 当为大于0的数字时，表示几秒后自动关闭，同时写数据；若是数字0，不自动关闭，打开即写数据；若是“close”时，不自动关闭，用户点击关闭才写数据；若为其他字符，不自动关闭，不写数据
            once: 是否只显示一次
            auto: 可以是boolean，也可以是数组。为true时就没有限制条件了，获取到资源就显示；为数组时则调用接口判断是否要显示。
            api: 可以是对象，对象的结构看下面；也可以是接口地址 "http://ptres.37.com/content/s_www/pt_2015_index_flash_popup.js"
            check: 验证cookie的方法
            fn: 接口返回数据后，对数据进行过滤的方法。
        }
        api:{
            api: 接口地址，如果接口地址为空，则可以用下面自定义的内容。如果接口地址和下面自定义的内容同时存在，以接口地址的内容为准
            src: 浮层素材的地址
            link: 跳转的链接
            text: a标签的title
            position: 埋点的标识
            .... 可以继续加内容
        }
        */
        this.options = $.extend(true, {}, {
            gameid: '',//平台类型：0-平台，gameid-官网，默认平台,平台不用传gameid。2者的不同之处在于调用不同的浮层顺序接口
            zIndex: 220,
            wrap: that.tpl.wrap,
            template: "",
            data: null
        }, options);

        that.init();
    }

    hzFestival.prototype = {

        css: '<style type="text/css">{shadow}.hd-dialog {{zIndex}position:fixed;left:50%;top:50%;width:800px;height:600px;margin:-300px 0 0 -400px;_position:absolute;_top:expression(eval(document.documentElement.scrollTop+400));display:none;}.hd-dialog-link {position:absolute;left:0;top:0;width:100%;height:100%;z-index:220;background:url(//img1.37wanimg.com/erweima/bg.png) repeat;}.hd-dialog-close {width:32px;height:32px;position:absolute;right:0;top:0;z-index:2000;background:#3c3c3c;font:28px/32px "Microsoft Yahei",SimSun;text-align:center;color:#fff;}.warpdiv{position: relative;width: 100%;height: 100%;overflow: hidden;z-index: 102;}</style>',
        cssShadow: '.hd-mark {position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden;background:#000;opacity:0.5;filter:alpha(opacity=50);z-index:220;display:none;}',
        tpl: {
            wrap: '<div id="hdMark" class="hd-mark"></div>{content}',
            tplimg: '<div id="hdDialog" class="hd-dialog" style="background: url({$src}) no-repeat;background-position: center center;"><div class="warpdiv">{$dom}<a href="{$link}" target="_blank" title="{$text}" class="hd-dialog-link" data-position=\'{"e5":"{$position}", "e9":"{$gameid}", "e13":"{$photo_bid}"}\'></a><a href="javascript:;" title="关闭" class="hd-dialog-close" id="hdDialogClose">X</a></div></div>',
            tplswf: '<div id="hdDialog" class="hd-dialog"><div class="warpdiv">{$dom}<embed style="background: none;"  wmode="transparent" width="800" height="600" src="{$src}" quality="high" pluginspage="//www.macromedia.com/go/getflashplayer"></embed><a href="{$link}" target="_blank" title="{$text}" class="hd-dialog-link" data-position=\'{"e5":"{$position}", "e9":"{$gameid}", "e13":"{$photo_bid}"}\'></a><a href="javascript:;" title="关闭" class="hd-dialog-close" id="hdDialogClose">X</a></div></div>',
            tplmp4: '<div id="hdDialog" class="hd-dialog"> \
                        <div class="warpdiv">{$dom} \
                            <video width="800" height="600" autoplay="autoplay" loop="loop" poster="{$src}"> \
                                <source src="{$mp_src}" type="video/mp4" /> \
                                <object width="800" height="600" type="application/x-shockwave-flash" data="{$flash_src}"> \
                                    <param name="movie" value="{$flash_src}" /> \
                                    <param name="wmode" value="transparent" /> \
                                    <img src="{$src}" width="800" height="600" /> \
                                </object> \
                            </video> \
                            <a href="{$link}" target="_blank" title="{$text}" class="hd-dialog-link" data-position=\'{"e5":"{$position}", "e9":"{$gameid}", "e13":"{$photo_bid}"}\'></a> \
                            <a href="javascript:;" title="关闭" class="hd-dialog-close" id="hdDialogClose">X</a> \
                        </div> \
                    </div>',
            tplmp4noswf: '<div id="hdDialog" class="hd-dialog"> \
                        <div class="warpdiv">{$dom} \
                            <video width="800" height="600" autoplay="autoplay" loop="loop" poster="{$src}"> \
                                <source src="{$mp_src}" type="video/mp4" /> \
                                <img src="{$src}" width="800" height="600" /> \
                            </video> \
                            <a href="{$link}" target="_blank" title="{$text}" class="hd-dialog-link" data-position=\'{"e5":"{$position}", "e9":"{$gameid}", "e13":"{$photo_bid}"}\'></a> \
                            <a href="javascript:;" title="关闭" class="hd-dialog-close" id="hdDialogClose">X</a> \
                        </div> \
                    </div>',
            tplflash: '<div id="hdDialog" class="hd-dialog"> \
                        <div class="warpdiv">{$dom} \
                            <object width="800" height="600" type="application/x-shockwave-flash" data="{$flash_src}"> \
                                <param name="movie" value="{$flash_src}" /> \
                                <param name="wmode" value="transparent" /> \
                                <img src="{$src}" width="800" height="600" /> \
                            </object> \
                            <a href="{$link}" target="_blank" title="{$text}" class="hd-dialog-link" data-position=\'{"e5":"{$position}", "e9":"{$gameid}", "e13":"{$photo_bid}"}\'></a> \
                            <a href="javascript:;" title="关闭" class="hd-dialog-close" id="hdDialogClose">X</a> \
                        </div> \
                    </div>'
        },

        dom: {
            hdDialogClose: "#hdDialogClose",
            hdMark: "#hdMark",
            hdDialog: "#hdDialog"
        },

        timer: null, //浮层倒计时
        isParse: false, //是否已经显示过了

        fc_data: [], //浮层的配置数组，也就是传入的options.data
        orderList: 0, //浮层的排序数组的数量，由接口返回
        tmpOrderList: [], //浮层的排序数组，由接口返回，和上面的不同处在于，在循环时数组元素会被删除
        p_data: {}, //当前在处理的浮层配置数据，由fc_data里取出
        break_data: [],

        init: function (opts) {
            var that = this;
            //当只有一个对象时就直接判断要不要显示了
            if (SQ.isObject(this.options.data)) {
                this.isDisplay(this.options.data);
                return;
            }

            this.fc_data = this.options.data;
            this.whichShow();
        },

        /**
         * 通过顺序判断要显示哪个浮层
         * @return {[type]} [description]
         */
        whichShow: function () {
            var that = this,
                j = 0,
                data, datas, list;

            //首先内容必须是一个数组
            if ($.isArray(that.fc_data)) {
                if (that.orderList === 0) {
                    //没有排列的顺序的话，就以浮层配置数组为准

                    //已经显示了就不再处理了
                    if (that.isParse) return;

                    //获取数组里的第一个值
                    data = that.fc_data.shift();
                    if (data) {
                        that.isDisplay(data);
                    }
                    return;
                }
                //有排列顺序的话，就排列为准，排列和浮层配置数组都存在时就会显示
                datas = that.fc_data;
                list = that.tmpOrderList.shift();
                if (list) {
                    //内容关闭的话就跳过
                    if (list["switch"] !== "1") {
                        that.whichShow();
                        return;
                    }
                    //已经显示了就不再处理了
                    if (that.isParse) return;

                    for (; j < datas.length; j++) {
                        if (list.link === datas[j].key) {
                            data = datas[j];
                            break;
                        }
                    }
                    if (data) {
                        that.isDisplay(data);
                    } else {
                        if (that.tmpOrderList.length > 0) {
                            that.whichShow();
                        }
                    }
                }
            }
        },

        /**
         * 通过浮层顺序的判断，获取浮层的配置数据后，再判断浮层是否要显示
         * @param  {object}  data 浮层的配置数据
         * @return {Boolean}      [description]
         */
        isDisplay: function (data) {
            //新版flash
            if (data.ver === "new") {
                this.p_data = data;
                this.hdShow();
                return;
            }
            if ($.inArray(data.storage, this.break_data) > -1) {
                return;
            }
            this.break_data.push(data.storage);
            //若记录存在则不再显示了
            if (data.storage && this.getStorage(data.storage, data.val, data.check)) {
                this.hdHide();
                this.whichShow();
                return;
            }

            this.p_data = data;
            //若data.auto为数组，则调用接口判断是否要显示，数组按[url,data,callback]顺序存放，url为必填
            if ($.isArray(data.auto)) {
                this.isDisplayByApi.apply(this, data.auto);
            } else if (data.auto === true) {
                this.hdShow();
            }
        },

        /**
         * 通过接口地址判断是否显示浮层
         * @param  {string}   url      必填，接口地址
         * @param  {object}   data     选填，提供给接口的参数
         * @param  {Function} callback 选填，接口调用成功后的回调函数
         * @return {object}           返回ajax对象
         */
        isDisplayByApi: function (url, data, callback) {
            var that = this;
            if (!url) {
                return SQ.log("接口地址有误！");
            }
            if (data) {
                if (typeof data === "function") {
                    callback = data;
                    data = {};
                }
            } else {
                callback = function (res) {
                    if (res && +res.code === 1) {
                        this.hdShow();
                    } else {
                        this.whichShow();
                    }
                };
                data = {};
            }

            return $.ajax($.extend({}, {
                url: url,
                dataType: "jsonp",
                success: function (res) {
                    callback.call(that, res);
                }
            }, {
                data: data
            }));
        },

        /**
         * 显示浮层
         * @return null
         */
        hdShow: function () {
            var that = this;

            this.getData();

        },

        /**
         * 如果this.options.api是对象，则处理数据；不然则调接口获取数据
         * @return  null
         */
        getData: function () {
            var that = this,
                o = this.p_data;

            if (typeof o.api == "object") {
                //对象里的接口地址不为空，调接口获取内容
                if (o.api.api) {
                    that.getScriptData(o.api.api);
                } else {
                    //为空，则用自定义的内容。
                    that._parse(that.extendData(o.api));
                }
            } else {
                if (!o.api) return SQ.log("资源接口地址有误！");
                that.getScriptData(o.api);
            }


        },

        /**
         * 根据获取的数据进行筛选，返回需要的数据
         */
        getScriptData: function (api) {
            var that = this,
                o = this.p_data,
                beginDatetime = "",
                endDatetime = "";
            $.getScript(api, function () {
                if (window["sq_content_s_www_" + o.key]) {
                    var res = window["sq_content_s_www_" + o.key];
                    if (!res) return;
                    var data = res.data;
                    if (!data) return;
                    $.each(data, function (i, val) {
                        // 假如是官网flash
                        //todo 修复没有判断时间的bug
                        beginDatetime = that.dateChange(data[i].begin_datetime);
                        endDatetime = that.dateChange(data[i].end_datetime);
                        if (o.key == "game_site_flash_popup" && data[i].games && $.isArray(data[i].games) && $.inArray(that.options.gameid + '', data[i].games || []) >= 0 && (endDatetime && (new Date(endDatetime).getTime() > new Date().getTime())) && (beginDatetime && (new Date(beginDatetime).getTime() < new Date().getTime()))) {
                            that._parse(that.extendData(o.api, $.isFunction(o.fn) ? o.fn.call(that, data[i]) : data[i]));
                            return;
                        } else if (o.key == "pt_2015_index_flash_popup") {
                            //判断用户帐号
                            var isRightAcc = $.inArray(SQ.MD5.hex_md5(SQ.MD5.hex_md5(o.account + data[i]['randstr']) + data[i]['randstr']), data[i]['acc']) !== -1;
                            //判断用户等级
                            var isRightVip;
                            if (data[i]['vip_level']) {
                                isRightVip = $.inArray(o.vip + "", data[i]['vip_level'].split(",")) !== -1;
                            }
                            //判断开启次数
                            var num = +SQ.cookie(data[i]['randstr']) || 0;
                            var isHasNum = num < +data[i]['number'];

                            var isShow = (isRightAcc || isRightVip) && isHasNum;
                            if (!isShow) {
                                return true;
                            } else {
                                num++;
                                SQ.cookie(data[i]['randstr'], num);
                                if ((endDatetime && (new Date(endDatetime).getTime() > new Date().getTime())) && (beginDatetime && (new Date(beginDatetime).getTime() < new Date().getTime()))) {
                                    that._parse(that.extendData(o.api, $.isFunction(o.fn) ? o.fn.call(that, data[i]) : data[i]));
                                    return false;
                                }
                                if (!endDatetime && !beginDatetime) {
                                    that._parse(that.extendData(o.api, $.isFunction(o.fn) ? o.fn.call(that, data[i]) : data[i]));
                                    return false;
                                }
                            }
                        } else {
                            if ((endDatetime && (new Date(endDatetime).getTime() > new Date().getTime())) && (beginDatetime && (new Date(beginDatetime).getTime() < new Date().getTime()))) {
                                that._parse(that.extendData(o.api, $.isFunction(o.fn) ? o.fn.call(that, data[i]) : data[i]));
                                return;
                            }
                            if (!endDatetime && !beginDatetime) {
                                that._parse(that.extendData(o.api, $.isFunction(o.fn) ? o.fn.call(that, data[i]) : data[i]));
                                return;
                            }
                        }
                    });
                    that.whichShow();
                }
            });
        },

        dateChange: function (date) {
            var reg = /^(\d{4})-(\d{2})-(\d{2})?/;
            if (date && reg.test(date)) {
                return date.replace(new RegExp(/-/gm), "/");
            }
        },

        /**
         * 整理获取回来的浮层数据
         * @param  {object} obj 要整理的数据
         * @param  {object} dat 要整理的数据2
         * @return {[type]}     [description]
         */
        extendData: function (obj, dat) {
            var param = [{}, {
                src: "",
                link: "",
                text: "",
                position: "",
                gameid: "",
                dom: ""
            }, obj];
            dat && param.push(dat);
            return $.extend.apply(this, param);
        },

        /**
         * 将获取的数据添加到网页
         * @param  {object} data 模板所需的数据
         * @return null
         */
        _parse: function (data) {
            var that = this,
                o = this.options,
                temp, temp_a;

            if (!o.template) {
                if (that.p_data.key === "pt_2015_index_flash_popup") {     // 如果是平台活动浮窗
                    if (data.mp_src && data.flash_src && data.src) {
                        o.template = that.tpl.tplmp4;
                    } else {
                        if (data.src) {
                            if (data.flash_src) {
                                o.template = that.tpl.tplflash;
                            } else if (data.mp_src) {
                                o.template = that.tpl.tplmp4noswf;
                            } else {
                                o.template = that.tpl.tplimg;
                            }
                        }
                    }
                } else {
                    if (data.src.indexOf(".swf") > 0) {
                        o.template = that.tpl.tplswf;
                    } else {
                        o.template = that.tpl.tplimg;
                    }
                }
            }

            temp = o.wrap.replace("{content}", o.template);
            for (var k in data) {
                if (k.indexOf("tpl_") > -1) {
                    temp_a = k.split("_");
                    temp = temp.replace("{$" + temp_a[1] + "}", data[k]);
                }
            }

            //增加游戏id的统计
            data = $.extend(data, { gameid: o.gameid });
            if (that.p_data.key === "pt_2015_index_flash_popup" && data.game_info && data.game_info.id) {
                data.gameid = data.game_info.id;
            }
            temp = SQ.T(temp, data);

            this.css = $(that.css.replace("{zIndex}", "z-index:" + o.zIndex + ";").replace("{shadow}", (data.shadow == 1 ? that.cssShadow : ""))).appendTo("head");
            this.element = $(temp).appendTo(document.body);

            this.element.on("click", this.dom.hdDialogClose, function (e) {
                e.preventDefault();
                that.hdHide();
                that.howSetStorage();
            });
            //that.trigger("f_show", data);
            $(window).load(function () {
                data.shadow == 1 && $(that.dom.hdMark)
                    .height($(document).height())
                    .show();
                $(that.dom.hdDialog).show();

                that.isShow = true;

                //原 that.p_data.count === 0 ,倒计时不能关闭
                that.p_data.count && that.howSetStorage();
            });

            window.onresize = that.throttle(function () {
                var screenWidth = window.innerWidth ? window.innerWidth :
                    document.documentElement.clientWidth;
                data.shadow == 1 && $(that.dom.hdMark).width(screenWidth);
            }, 100);
            this.isParse = true;
        },

        /**
         * 判断何时写数据，同时启动倒计时关闭
         * @return {[type]} [description]
         */
        howSetStorage: function () {
            var that = this,
                d = that.p_data,
                now = new Date(),
                year = now.getFullYear(),
                month = now.getMonth(),
                date = now.getDate(),
                exp = new Date(year, month, date + (d.exp || 1));

            if (d.count > 0) {
                that.countTemp = d.count;
                that._countStart();
            }
            //todo =0时 与 =close 时有什么区别，为什么=close时不是等用户点击关闭再写数据，如果用户不关闭而是刷新页面，下次是否会出现浮层。
            if (d.count === "close" || typeof d.count === "number") {
                d.storage && that.setStorage(d.storage, d.val || 1, {
                    expires: exp,
                    path: "/",
                    domain: "37.com"
                });
            }
        },

        /**
         * 处理倒计时
         * @return null
         */
        _countStart: function () {
            var that = this;
            if (!that.isShow) {
                clearTimeout(that.timer);
                that.timer = null;
                return;
            }
            that.timer = setTimeout(function () {
                if (that.countTemp < 0) {
                    that.hdHide();
                    return;
                }
                that.countTemp--;
                that._countStart();
            }, 1000);
        },

        /**
         * 隐藏浮层
         * @return {[type]} [description]
         */
        hdHide: function () {
            var that = this,
                o = that.p_data;
            if (that.isShow) {
                that.isShow = false;
                that.countTemp = -1;
                that.timer && clearTimeout(that.timer);
                $(that.dom.hdDialog).remove();
                $(that.dom.hdMark).remove();
            }
            clearTimeout(that.timer);
            that.timer = null;
        },

        /**
         * 移除浮层
         * @return null
         */
        _destroying: function () {
            this.css.remove();
            this.element.off().remove();
        },

        /**
         * 延迟处理
         * @param  {Function} fn    需要延迟处理的函数
         * @param  {int}   delay 延迟秒数
         * @return {[type]}         返回函数
         */
        throttle: function (fn, delay) {
            var that = this,
                timer = null;
            return function () {
                var context = that,
                    args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function () {
                    fn.apply(context, args);
                }, delay);
            };
        },

        /**
         * 获取保存的数据，判断是否存在
         * @param  {string}  storage 要获取的key
         * @param  {string}  val 和cookie作判断的值
         * @param  {function}  fn 验证
         * @return {Boolean}        判断结果
         */
        getStorage: function (storage, val, fn) {
            var v = SQ.cookie(storage);
            if ($.isFunction(fn)) {
                return fn.call(this, v, val);
            }
            return v === val;
        },

        /**
         * 数据保存
         * @param {string} key   key
         * @param {data} value 存储的数据
         * @param {object} obj   附加的记录
         */
        setStorage: function (key, value, obj) {
            SQ.cookie(key, value, obj);
        }
    };

    $.hzFestival = function (options) {
        return new hzFestival(options);
    }

})(jQuery, SQ);
