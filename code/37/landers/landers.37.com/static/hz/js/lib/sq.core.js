/**
 * SQ核心类，与jQuery剥离，单独放在一个文件夹
 * @param  {[type]} $       [description]
 * @param  {[type]} exports [description]
 * @return {[type]}         [description]
 */
(function ($, exports) {
    
    //使用严格模式
    //"use strict";

    var KUI,

        version = '@VERSION@',

        _KEYWORDS = ['extended', 'included'], //类扩展回调关键字

     //html解码字典
     _htmlDecodeDict = {
         "quot": '"',
         "lt": "<",
         "gt": ">",
         "amp": "&",
         "nbsp": " "
     },

     //html转码字典
     _htmlEncodeDict = {
         '"': "quot",
         "<": "lt",
         ">": "gt",
         "&": "amp",
         " ": "nbsp"
     },

     //模板格式正则表达式
     _templateSettings = {
         evaluate: /{%([\s\S]+?)%}/g,
         interpolate: /{%=([\s\S]+?)%}/g,
         saveRegex: /\{\$(\w+)\}/g
     },

     //控制器事件定义格式
     _eventSplitter = /^(\w+)\s*(.*)$/;

    /**
     * 把一个对象的全部属性排除不需要的属性后，添加到目标对象
     * @param target
     * @param src
     * @param filters
     * @private
     */
    var _extend = function (target, src, filters) {
        var array = $.isArray(filters);
        for (var item in src) {
            if (array) {
                if ($.inArray(item, filters) === -1) {
                    target[item] = src[item];
                }
            } else {
                target[item] = src[item];
            }
        }
    };

    //定义基类
    var Class = function (parent) {

        //构建一个类
        var _class = function () {

            //执行底层初始化
            this.initializer.apply(this, arguments);
            //执行应用层初始化
            this.init.apply(this, arguments);
        };

        //底层初始化函数
        _class.prototype.initializer = function () { };

        //应用层初始化函数，实例化参数在此函数传入
        _class.prototype.init = function () { };

        //是否传入父类，如有即继承父类
        if (parent) {

            //定义一个临时父类，并把父类的属性和方法都复制到临时类，为了保持与父类的独立性
            var P = function () { };

            //把父类的静态属性复制到类
            $.extend(true, _class, parent);

            //把父类的实例属性复制到类的实例
            P.prototype = $.extend(true, {}, parent.prototype);

            //继承父类的实例
            _class.prototype = new P();
        }


        //定义prototype别名
        _class.fn = _class.prototype;

        //定义类的别名
        _class.fn.parent = _class;


        //给类添加属性
        _class.extend = function (obj) {
            if (obj) {

                //克隆参数obj，把指向obj的指针断开
                var object = $.extend(true, {}, obj);

                //把object的属性排除回调函数后，都添加到创建的类
                _extend(_class, object, _KEYWORDS);

                //如果存在回调函数，即运行回调函数
                var extended = object.extended;

                if (typeof extended === 'function') {
                    extended(_class);
                }
            }
            return _class;
        };

        //给实例添加属性
        _class.include = function (obj) {
            if (obj) {
                //克隆obj
                var object = $.extend(true, {}, obj);

                //把object的属性排除回调函数后，都添加到类的实例
                _extend(_class.fn, object, _KEYWORDS);

                //如果存在回调函数，即运行回调函数
                var included = object.included;

                if (typeof included === 'function') {
                    included(_class);
                }
            }
            return _class;
        };

        //类的作用域控制
        _class.proxy = function (func) {
            var thisObject = this;

            //截取附加参数
            var args = Array.prototype.slice.call(arguments, 1);
            return (function () {

                //把arguments转换成真正的数组
                var innerArgs = $.makeArray(arguments);

                //合并参数
                var fianlArgs = innerArgs.concat(args);
                return func.apply(thisObject, fianlArgs);
            });
        };

        //批量设置作用域
        _class.proxyAll = function () {
            var functions = $.makeArray(arguments);
            for (var i = 0; i < functions.length; i++) {
                this[functions[i]] = this.proxy(this[functions[i]]);
            }
        };

        //在实例也添加作用域控制
        _class.fn.proxy = _class.proxy;
        _class.fn.proxyAll = _class.proxyAll;

        return _class;

    };

    //类的创建方法
    Class.create = function (include, extend) {

        //实例化一个基类
        var object = new Class();

        //给类添加实例方法
        if (include) {
            object.include(include);
        }

        //给类添加静态方法
        if (extend) {
            object.extend(extend);
        }


        return object;
    };

    KUI = new Class();

    KUI.Class = Class;

    //事件模块
    KUI.Events = {
        //绑定事件
        bind: function (ev, callback) {

            //可以侦听多个事件，用空格隔开
            var evs = ev.split(" ");

            //创建_callbacks对象，除非它已经存在了
            var calls = this._callbacks || (this._callbacks = {});
            for (var i = 0; i < evs.length; i++) {

                //针对给定的事件key创建一个数组，除非这个数组已经存在
                //然后将回调函数追加到这个数组中
                (this._callbacks[evs[i]] || (this._callbacks[evs[i]] = [])).push(callback);
            }
            return this;
        },
        //触发事件
        trigger: function () {

            //将arguments对象转换成真正的数组
            var args = $.makeArray(arguments);

            //拿出第一个参数，即事件名称
            var ev = args.shift();
            var list, calls, i, l;

            //如果不存在_callbacks对象，则返回
            if (!(calls = this._callbacks)) {
                return false;
            };

            //如果不包含给定事件对应的数组，也返回
            if (!(list = this._callbacks[ev])) {
                return false;
            }

            //触发数组中的回调
            for (i = 0, l = list.length; i < l; i++) {
                if (list[i].apply(this, args) === false) {
                    break;
                }
            }
            return true;
        },
        //删除事件绑定
        unbind: function (ev, callback) {
            //如果不传入事件名称，即把所有事件都清除
            if (!ev) {
                this._callbacks = {};
                return this;
            }
            var list, calls, i, l;

            //如果不存在_callbacks对象，则返回
            if (!(calls = this._callbacks)) {
                return this;
            }

            //如果不包含给定事件对应的数组，也返回
            if (!(list = this._callbacks[ev])) {
                return this;
            }

            //如果不存入回调函数，即把该事件对应的数组全部清空
            if (!callback) {
                delete this._callbacks[ev];
                return this;
            }

            //删除指定事件名称和回调的事件
            for (i = 0, l = list.length; i < l; i++) {
                if (callback === list[i]) {
                    list.splice(i, 1);
                    break;
                }
            }
            return this;
        }
    };

    

   

    KUI.extend({
        /**
         * 获取SQ.core版本号
         */
        version :version,
        
        /**
         * 当前设置的zIndex值，默认为0
         */
        zIndex: 0,

        /**
         * 判断是否为object
         * @param {*} obj - 判断的对象
         * @returns {Boolean}
         */
        isObject: function (obj) {
            return $.isPlainObject(obj)
        },

        /**
         * 获取全局唯一标识符
         * @returns {string}
         */
        guid: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            }).toUpperCase();
        },

        /**
         * 获取命名空间，防止命名冲突
         * @param {Object|String} d - 名称
         */
        namespace: function (d) {
            var c = window;
            var e = d.split(".");
            for (var b = 0, a = e.length; b < a; b++) {
                if (!c[e[b]]) {
                    c[e[b]] = {};
                }
                else {
                    if (b == a - 1 && c[e[b]]) {
                        throw new Error("namespace [ " + d + " ] is exist!");
                    }
                }
                c = c[e[b]];
            }
        },

        /**
         * HTML实体解码
         * @param {String} html - html字符串
         * @returns {string}
         */
        decodeHTML: function (html) {
            return String(html).replace(/&(quot|lt|gt|amp|nbsp);/ig, function (all, key) {
                return _htmlDecodeDict[key];
            }).replace(/&#u([a-f\d]{4});/ig, function (all, hex) {
                return String.fromCharCode(parseInt("0x" + hex));
            }).replace(/&#(\d+);/ig, function (all, number) {
                return String.fromCharCode(+number);
            });
        },

        /**
         * HTML实体编码
         * @param  {String} html - html字符串
         * @returns {string}
         */
        encodeHTML: function (html) {
            return String(html).replace(/["<>& ]/g, function (all) {
                return "&" + _htmlEncodeDict[all] + ";";
            });
        },

        /**
         * 清除html格式
         * @param {String} html - html字符串
         * @returns {*}
         */
        clearHTML: function (html) {
            html = html.replace(/<\/?[^>]*>/g, '');
            html = html.replace(/[ | ]*\n/g, '\n');
            html = html.replace(/\n[\s| | ]*\r/g, '\n');
            html = html.replace(/&nbsp;/ig, '');
            return html;
        },
        
        /**
         * 模板替换
         * @param {String} template - 模板
         * @param {Object} obj - 对象
         * @returns {*}
         */
        replaceWith: function (template, obj) {
            var _this = this;
            var tpl = template.replace(/%7B/gi, '{').replace(/%7D/gi, '}');
            return tpl.replace(_templateSettings.saveRegex, function (str, match) {
                if (match in obj) {
                    return _this.encodeHTML(obj[match]);
                }
                else {
                    return str;
                }
            });
        },

        /**
         * 解析目标url为json对象
         * @param url
         * @param isDecode
         * @returns {Object}
         */
        queryToJson: function (url, isDecode) {
            url = url || exports.location.search;

            var query = url.substr(url.indexOf('?') + 1),
                params = query.split('&'),
                len = params.length,
                result = {},
                i = 0,
                key,
                value,
                item,
                param;

            for (; i < len; i++) {
                param = params[i].split('=');
                key = param[0];
                if (key) {
                    if (param[1]) {
                        value = !!isDecode ? decodeURIComponent(param[1]) : param[1];
                    } else {
                        value = "";
                    }
                }
                item = result[key];
                if ('undefined' == typeof item) {
                    result[key] = value;
                }
                else
                    if ($.isArray(item)) {
                        item.push(value);
                    }
                    else {
                        result[key] = [item, value];
                    }
            }
            return result;
        },

        /**
         * 获取url参数
         * @param {String} name - 参数名
         * @param {String} url - url地址 [可选]
         * @param {String} isDecode - 是否编码 [可选]
         * @returns {*}
         */
        getParam: function( name, url, isDecode ) {
            var json = this.queryToJson( url, isDecode );
            if ( name ) {
                return json[name] || "";
            } else {
                return json;
            }
        },
        getForm: function (wrapper) {
            var query = $('input,select,textarea', $(wrapper || exports.document)).serialize().replace(/\+/gi, '%20');
            return this.queryToJson(query, true);
        },
        setForm: function (json, wrapper) {
            for (var item in json) {
                var dom = $('[name=' + item + ']', $(wrapper || exports.document));
                if (dom.size() > 0) {
                    var type = dom.attr('type') || (dom.get(0).nodeName == 'SELECT' ? 'select' : 'textarea');
                    switch (type.toLocaleLowerCase()) {
                        case 'text': //向下合并
                        case 'hidden': //向下合并
                        case 'select': //向下合并
                        case 'textarea':
                            dom.val(json[item] || '');
                            break;
                        case 'radio':
                            dom.each(function () {
                                if ($(this).val() == json[item]) {
                                    $(this).attr('checked', 'checked');
                                }
                            });
                            break;
                        case 'checkbox':
                            var vals = json[item];
                            if (typeof vals !== 'object') {
                                vals = vals.toString().split(',');
                            };
                            dom.each(function () {
                                var self = $(this), selfVal = self.val();
                                for (var i = 0, len = vals.length; i < len; i++) {
                                    if (selfVal == vals[i]) {
                                        self.attr('checked', 'checked');
                                        break;
                                    }
                                }
                            });
                            break;
                    }
                }
            }
        },

        /**
         * 判断字符串长度，中文占两个字符
         * @param {String} str
         * @returns {*}
         */
        getCharCount: function (str) {
            return str.replace(/[^\x00-\xff]/g, "xx").length;
        },

        /**
         * 字符截取
         * @param {String} str - 字符串
         * @param {number} len - 长度
         * @returns {*}
         */
        substr: function (str, len) {
            var str_length = 0;
            var str_len = 0;
            var str_cut = new String();
            str_len = str.length;
            for (var i = 0; i < str_len; i++) {
                var a = str.charAt(i);
                str_length++;
                if (escape(a).length > 4) {
                    //中文字符的长度经编码之后大于4  
                    str_length++;
                }
                str_cut = str_cut.concat(a);
                if (str_length >= len) {
                    if (str_length > len) {
                        //str_cut = str_cut.concat("...");
                    }
                    return str_cut;
                }
            }
            //如果给定字符串小于指定长度，则返回源字符串；  
            if (str_length < len) {
                return str;
            }
        },

        /**
         * 页面刷新
         */
        refresh: function () {
            var local = exports.location;
            var param = this.queryToJson(local.search);
            if ($.isEmptyObject()) {
                param = {};
            }
            $.extend(param, {
                n: Math.random()
            });
            local.href = local.pathname + "?" + $.param(param) + local.hash;
        },

        /**
         * 判断是否为非负整数
         * @param {*} value
         * @returns {boolean}
         */
        isDigits: function (value) {
            return /^\d+$/.test(value);
        },

        /**
         * 判断是否为数字类型
         * @param {*} value
         * @returns {boolean}
         */
        isNumber: function (value) {
            return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
        },

        /**
         * 判断是否为日期格式
         * @param {String} value
         * @returns {boolean}
         */
        isDate: function (value) {
            return !/Invalid|NaN/.test(new Date(value));
        },

        /**
         * 获取指定ID的HTML对象(区别于jQ的$id)
         * @param {String} id id名称
         * @returns {HTMLElement}
         */
        byId: function( id ) {
            return document.getElementById( id );
        },

        /**
         * 控制台输出
         * @param {*} e - 需要输出的内容
         */
        log: function ( e ) {
            if ( window.console && console.log ) {
                console.log( e );
            } else {
                //alert(e);
            }
        }
    });

    /**
     * 控制器基类
     */
    KUI.Controller = Class.create({

        //控制器默认容器
        tag: 'div',

        initializer: function (options) {

            this.options = options || {};

            //如果参数是对象，即把对象的属性添加到控制器
            if (typeof this.options === 'object') {
                for (var key in this.options) {
                    this[key] = this.options[key];
                }
            } else {
                throw new Error('控制器初始化参数必须是对象');
            }

            //如果控制器的el不存在，即创建默认的容器Dom作为el
            if (!this.el) {
                this.el = exports.document.createElement(this.tag);
            }

            //把控制器的el转换成jQuery对象
            this.el = $(this.el);

            //如果控制器实例events对象不存在，即取类的events对象
            if (!this.events) {
                this.events = this.parent.events;
            }

            //如果控制器实例elements对象不存在，即取类的elements对象
            if (!this.elements) {
                this.elements = this.parent.elements;
            }

            //绑定委托事件
            if (this.events) {
                this.delegateEvents();
            }

            //把elements各项转换成jQuery对象，并添加到控制器
            if (this.elements) {
                this.refreshElements();
            }

            //预处理作用域
            if (this.proxied) {
                this.proxyAll.apply(this, this.proxied);
            }

        },

        $: function (selector) {
            return $(selector, this.el);
        },

        /**
         * 绑定委托事件
         */
        delegateEvents: function () {
            for (var key in this.events) {
                var methodName = this.events[key];
                var method = this.proxy(this[methodName]);
                var match = key.match(_eventSplitter);
                var eventName = match[1], selector = match[2];

                //如果jQuery选择器为空，就把事件绑定到el，否则把事件委托绑定到选择器
                if (selector === '') {
                    this.el.bind(eventName, method);
                }
                else {
                    this.el.delegate(selector, eventName, method);
                }
            }
        },

        /**
         * 把elements各项转换成jQuery对象，并添加到控制器
         */
        refreshElements: function () {
            for (var key in this.elements) {
                this[this.elements[key]] = this.$(key);
            }
        },

        /**
         * 延时运行， setTimeout的代替方法，该方法回调的指针已经修改成了控制器实例
         * @param {Function} func - 方法
         * @param {number} timeout - 毫秒单位
         */
        delay: function (func, timeout) {
            setTimeout(this.proxy(func), timeout || 0);
        }
    });

    //控制器创建方法
    KUI.Controller.create = function (include) {
        var ctrl = new Class(KUI.Controller);
        if (include) {
            ctrl.include(include);
        };
        return ctrl;
    };

    
    KUI._widgets = {};

    /**
     * 组件基类，创建UI组件时要继承这个类
     */
    KUI.Widget = Class.create({
        /**
         * 组件初始化
         */
        initializer: function () {

            //实例化时随机生成一个guid，用来标识唯一的实例
            this.id = KUI.guid();
            this.parent._register(this);
            this.parent.trigger('init', this);

            //侦听销毁时事件
            this.bind('destroy', this._destroying);
        },
        /**
         * 实例销毁。通常在销毁之前要删除dom、属性标记、事件来释放内存，以提高性能
         */
        destroy: function () {
            this.trigger('destroy', this);
            this.parent._unregister(this.id);
            this.parent.trigger('destroyed', this);
        },
        _destroying: function () {

            /* 这是一个抽象方法，什么也不处理，功能由子类实现
               通常在销毁之前要删除dom、属性标记、事件来释放内存，以提高性能
            */
        }
    });

    /**
     * 给组件基类添加静态方法
     */
    KUI.Widget.extend({

        /**
         * 根据id获取组件的实例
         * @param {string} id - 实例名
         */
        get: function (id) {
            return KUI._widgets[id];
        },

        /**
         * 销毁组件实例
         * @param {string} id - 实例名
         */
        _unregister: function (id) {
            delete KUI._widgets[id];
        },

        /**
         * 记录注册组件实例
         * @param {string} id - 实例名
         */
        _register: function (widget) {
            KUI._widgets[widget.id] = widget;
        }
    });

    /**
     * 组件基类添加事件支持
     */
    KUI.Widget.extend(KUI.Events);


    /**
     * 组件实例添加事件支持
     */
    KUI.Widget.include(KUI.Events);

    /**
     * 模板解析函数
     * @argument {String} template - 模板字符串
     * @argument {Object} data - 要替换的数据，一般为数组对象
     * @type {Function}
     */
    KUI.template = KUI.T = function () {
        var args = arguments, _this = this;
        if (args.length == 2) {
            if ($.isArray(args[1])) {
                //是数组
                var result = [];
                for (var i = 0, len = args[1].length; i < len; i++) {
                    args[1][i]._currentIndex = i;
                    result.push(KUI.template(args[0], args[1][i]));
                };
                return result.join('');
            }
            else {
                //是对象
                return (function (str, data) {
                    if (typeof str !== 'string') {
                        throw new Error('template is not a string');
                    };
                    if (!$.isPlainObject(data)) {
                        throw new Error('data from template is not a object');
                    };
                    var c = _templateSettings;
                    str = _this.replaceWith(str, data);
                    var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
                        'with(obj||{}){__p.push(\'' +
                        str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(c.interpolate, function (match, code) {
                            return "'," + code.replace(/\\'/g, "'") + ",'";
                        }).replace(c.evaluate || null, function (match, code) {
                            return "');" +
                                code.replace(/\\'/g, "'").replace(/[\r\n\t]/g, ' ') +
                                "__p.push('";
                        }).replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t') +
                        "');}return __p.join('');";

                    var func = new Function('obj', tmpl);
                    return data ? func(data) : func;

                })(args[0], args[1]);
            }
        }
        else
            if (args.length > 2) {
                var result = arguments.callee(args[0], args[1]);
                for (var i = 2, len = args.length; i < len; i++) {
                    result = arguments.callee(result, args[i]);
                }
                return result;
            }
            else {
                return arguments[0];
            }
    };

    /**
     * 日期处理函数
     * @param {String} dateStr
     * @param {String} format
     * @param {Object} options
     * @returns {*}
     */
    KUI.date = function (dateStr, format, options) {
        if (!dateStr) {
            return (new Date());
        };
        var obj = null;
        if (/Date/.test(dateStr)) {
            var d = dateStr.replace(/\//g, '');
            obj = eval('(new ' + d + ')');
        } else {
            obj = typeof dateStr === 'string' ? new Date(dateStr.replace(/-/g, '/')) : dateStr;
        }

        var setting = {
            y: 0, //年
            M: 0, // 月
            d: 0, //日
            h: 0, //时
            m: 0, //分
            s: 0 //秒
        };

        $.extend(setting, options || {});

        obj = new Date(setting.y + obj.getFullYear(),
                        setting.M + obj.getMonth(),
                        setting.d + obj.getDate(),
                        setting.h + obj.getHours(),
                        setting.m + obj.getMinutes(),
                        setting.s + obj.getSeconds());
        var o = {
            "M+": obj.getMonth() + 1,
            "d+": obj.getDate(),
            "h+": obj.getHours(),
            "m+": obj.getMinutes(),
            "s+": obj.getSeconds(),
            "q+": Math.floor((obj.getMonth() + 3) / 3),
            "S": obj.getMilliseconds()
        };
        if (format) {
            if (/(y+)/.test(format)) {
                format = format.replace(RegExp.$1,
                    RegExp.$1.length == 4 ?
                        obj.getFullYear() :
                        (obj.getFullYear() + "").substr(4 - RegExp.$1.length));
            };
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1 ?
                        o[k] :
                        ("00" + o[k]).substr(("" + o[k]).length));
                }
            };
            return format;
        }
        else {
            return obj;
        }
    };

    /**
     * cookie操作
     * @param {String} key
     * @param {String} value
     * @param {Object} options
     * @returns {string}
     */
    KUI.cookie = function( key, value, options ) {
        if ( arguments.length > 1 && (value === null || typeof value !== "object") ) {
            options = $.extend( {
                encodeKey: true
            }, options );

            if ( value === null ) {
                options.expires = -1;
            }

            if ( typeof options.expires === "number" ) {
                var days = options.expires,
                    t = options.expires = new Date();
                t.setDate( t.getDate() + days );
            }

            return (document.cookie = [
                options.encodeKey ? encodeURIComponent( key ) : key, "=",
                options.raw ? String( value ) : encodeURIComponent( String( value ) ),
                options.expires ? "; expires=" + options.expires.toUTCString() : "", // use expires attribute, max-age is not supported by IE
                options.path ? "; path=" + options.path : "",
                options.domain ? "; domain=" + options.domain : "",
                options.secure ? "; secure" : ""
            ].join( "" ));
        }

        // key and possibly options given, get cookie...
        options = value || {};
        var result, decode = options.raw ? function( s ) {
            return s;
        } : decodeURIComponent;
        return (result = new RegExp( "(?:^|; )" + (options.encodeKey ? encodeURIComponent(key) : key) + "=([^;]*)" ).exec( document.cookie )) ? decode( result[1] ) : null;
    };

    /**
     * 复制内容到粘贴板
     * @param {DOM} elem
     * @returns {ZeroClipboard}
     */
    KUI.clip = function( elem ) {
        if ( !elem ) return;

        ZeroClipboard.setDefaults({
            trustedOrigins: [window.location.protocol + "//" + window.location.host],
            allowScriptAccess: "always"
        });

        var clip = new ZeroClipboard( elem, {
            moviePath: "http://ptres.37.com/js/sq/plugin/ZeroClipboard.swf"
        });

        clip.on( "complete", function() {
            window.alert( "已经复制到剪贴板" );
        });

        return clip;
    };

    exports.KUI = exports.SQ = KUI;

})(jQuery, window);
