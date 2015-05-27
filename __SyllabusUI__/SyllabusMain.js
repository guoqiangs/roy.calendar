/* modify 2014-10-14 16:48:53 by joyffp */
function p070Run(date){
	if(date){
		document.write('<input type="hidden" id="F-calendar-p070-value" value="'+date+'" /><div id="F-calendar-p070"></div>');	
	}else{
		var defaultDay = new Date();
		var y = defaultDay.getFullYear();
		var m = defaultDay.getMonth();
		var d = defaultDay.getDate();
		m = (m < 9) ? ("0" + (1 + m)) : (1 + m);
		d = (d < 10) ? ("0" + d) : d;		
		var ymd = y+"-"+m+"-"+d;
		document.write('<input type="hidden" id="F-calendar-p070-value" value="'+ymd+'" /><div id="F-calendar-p070"></div>');
	}
	$(function(){p070Auto();})
}

/*
 +----------------------------------------------------------------------
 +----------------------------------------------------------------------
 | B-calendar
 | Update: 2014-7-6 15:31:27
 | Versions: 2.0.x
 | Path: http://joyffp.com/2x/src/calendar/2.0.x/calendar.js
 | Author: fengfupeng <joyffp@qq.com>
 +----------------------------------------------------------------------
 | this.versions => String //版本号
 | this.options => {} //参数配置项
 | this.init() => Function //初始化操作
 | this.selector => jQuery Object //唤出日历的元素
 | this.box => jQuery Object //显示日历的容器
 +----------------------------------------------------------------------
 | @options.format
 | %y 两位数年
 | %Y 四位数年份
 | %m 两位数月份
 | %d 两位数日
 | 
 | %H 时
 | %M 分
 | %S 秒
 | 
 | %s 返回当前秒数
 | %W 本年第几周
 | %w 星期几
 | %% %
 +----------------------------------------------------------------------
 +----------------------------------------------------------------------
 | #20140706
 |		[^]依赖seajs2.3.0 && 去除css加载功能
 |		[-]去除对joyjs的依赖
 +----------------------------------------------------------------------
 */
$(function(){
	"use strict";
	
	// 转UNICODE
	var $LANG$ = {
		//week: ["日", "一", "二", "三", "四", "五", "六"],
//		year: "年",
//		month: "月",
//		day: "日",
//		hours: "时",
//		minute: "分",
//		clear: "清空",
//		ok: "确定",
//		prevMonth: "上月",
//		nextMonth: "下月",
//		today: "今日"
		week: ["\u65e5", "\u4e00", "\u4e8c", "\u4e09", "\u56db", "\u4e94", "\u516d"],
		year: "\u5e74",
		month: "\u6708",
		day: "\u65e5",
		hours: "\u65f6",
		minute: "\u5206",
		clear: "\u6e05\u7a7a",
		ok: "\u786e\u5b9a",
		prevMonth: "\u4e0a\u6708",
		nextMonth: "\u4e0b\u6708",
		today: "\u4eca\u65e5"
	}	
	
	// 加载所需功能
	var gFcalendar = null;
	//var	$ = require("$"),
	//	Handlebars = require("handlebars");		
	
	function Calendar(options){
		this.versions = "2.0.x";
		this.options = options || {};		
		this.init(); //进行初始化
	}
	
	/**
	 * 初始化
	 * @method Calendar.prototype.init
	 * @return void
	 */
	Calendar.prototype.init = function(){
		//唤出日历的对象
		this.selector = $(this.options.trigger);
		//初始化之后做标记，防止多次初始化
		if(!$(this.selector).data("isCalendarInit")){
			$(this.selector).data("isCalendarInit", true);
		}else{
			return;
		}		
		//显示日历的容器
		if(!this.options.show_id){
			this.box = null;
			this.boxIsCreate = true;
		}else{
			this.box = $(this.options.show_id);
			this.boxIsCreate = false;
		}
		//检测是否开启时分秒的选项，如果有检测options.format是否设置，并进行赋值
		if(this.options.is_time){
			if(!this.options.format){
				this.options.format = "%Y-%m-%d %H:%M:%S";
			}
		}
		//开始合并options
		this.options = $.extend(true, {}, Calendar.defaults, (typeof this.options) === "object" && this.options);
		//开始执行
		this.execute();
	}
	
	/**
	 * 执行一些前置事件
	 * @method Calendar.prototype.execute
	 * @return void
	 */
	Calendar.prototype.execute = function(){
		var that = this;
		//日历模板 this.__tpl
		this.__tpl = ((typeof this.options.tpl) == "function") ? this.options.tpl(this) : this.options.tpl;
		
		//
		if(!this.options.trigger_value){
			this.options.trigger_value = this.options.trigger;
		}
		//绑定触发事件
		$(this.selector).click(function(){
			that.render();	
		});
	}
	
	/**
	 * 渲染
	 * @method Calendar.prototype.render
	 * @return void
	 */
	Calendar.prototype.render = function(){
		var that = this;
		//判断是否需要自动设置弹出窗的zindex值
		if(!this.options.zindex){
			this.options.zindexAuto = true;
		}
		if(this.options.zindexAuto){
			this.options.zindex = Calendar.helper.getZindex();
		}
		//
		var str;		
		var DOM_trigger_value = $(this.options.trigger_value)[0];
		if(DOM_trigger_value.type){
			str = DOM_trigger_value.value;
		}else{
			str = DOM_trigger_value.innerHTML;
			//str = DOM_trigger_value.innerHTML.replace(/<.+?>/gim,'');
		}
		//
		var defaultDay = Calendar.helper.parseDate(str, this.options.format);
		this.options._ymdHMS = {};
		this.options._ymdHMS.y = defaultDay.getFullYear();
		this.options._ymdHMS.m = defaultDay.getMonth();
		this.options._ymdHMS.d = defaultDay.getDate();
		this.options._ymdHMS.H = defaultDay.getHours();
		this.options._ymdHMS.M = defaultDay.getMinutes();
		this.options._ymdHMS.S = defaultDay.getSeconds();
		//创建日历
		this.__fCreateCalendar();
		//如果为普通操作，开启默认绑定事件
		if(this.boxIsCreate){
			this.__fBind();
			if(that.options.callback_on_event && typeof that.options.callback_on_event === "function"){that.options.callback_on_event.call(that);}
		}else{
			if(that.options.callback_on_event && typeof that.options.callback_on_event === "function"){that.options.callback_on_event.call(that);}
		}
	}
	
	/**
	 * 创建日历
	 * @method Calendar.prototype.__fCreateCalendar
	 * @return void
	 */
	Calendar.prototype.__fCreateCalendar = function(){
		var that = this;
		var nMonthDays_TEMP = Calendar.helper.getMonthDays(this.options._ymdHMS.y, this.options._ymdHMS.m);	
		if(this.options._ymdHMS.d > nMonthDays_TEMP){
			this.options._ymdHMS.d = nMonthDays_TEMP;
		}
		if(!this.box && this.boxIsCreate){
			var oThisbox = $('<div></div>').attr("class", that.options.theme_css.calendar_ui).appendTo(document.body);
			this.box = oThisbox;
		}
		
		var oAlignTarget = $(this.options.align || this.options.trigger);
		var	aAlignTargetOffset = oAlignTarget.offset();
		
		this.options._pos = [aAlignTargetOffset.left, aAlignTargetOffset.top];
		this.options._pos[1] += oAlignTarget[0].offsetHeight;
		
		if(this.boxIsCreate){
			this.box.empty();
			this.box.css({position:"absolute", display:"block", top:"-1000px"});
		}
		//创建HTML
		this.__fCreateHTML(this.options._ymdHMS.y,this.options._ymdHMS.m,this.options._ymdHMS.d,this.options._ymdHMS.H,this.options._ymdHMS.M,this.options._ymdHMS.S);
		//
		if(this.boxIsCreate){
			//给出一个更好的位置,关闭时重置
			if(!this.options._pos_is_true){
				this.options._pos_is_true = true;
				this.options._pos = Calendar.helper.checkOffset(this.box, this.selector, this.options._pos);
				this.options._pos_temp = this.options._pos;
			}else{
				this.options._pos = this.options._pos_temp;
			}
			
			this.box.css({position:"absolute", display:"none", left:this.options._pos[0] + "px", top:this.options._pos[1] + "px"});
		
			if(!window.XMLHttpRequest){
				var iframeHeight = this.box.outerHeight();
				var iframeHTML = '<iframe frameborder="0" border="0" style="width:100%;height:'+iframeHeight+'px;position:absolute;z-index:-1;left:0;top:0;filter:Alpha(opacity=0);"></iframe>';
				this.box.append(iframeHTML);
			};
			this.box.css("zIndex", this.options.zindex).show();
			gFcalendar = this;
		}
	}
	
	/**
	 * 生成HTML
	 * @method Calendar.prototype.__fCreateHTML
	 * @return void
	 */
	Calendar.prototype.__fCreateHTML = function(y, m, d, H, M, S){
		var that = this;
		
		// 初始化y, m, d, H, M, S
		var y = parseInt(y, 10);
		var m = parseInt(m, 10);
		var d = parseInt(d, 10);
		var H = (H < 10) ? ("0" + H) : H;
		var M = (M < 10) ? ("0" + M) : M;
		var S = (S < 10) ? ("0" + S) : S;	
		
		// 本月天数
		var datenumber = Calendar.helper.getMonthDays(y, m);
		
		// 本月第一天星期几
		var firstweek = Calendar.helper.getWeekDay(y, m, 1);
		
		// 本月最后一天星期几
		var lastweek = Calendar.helper.getWeekDay(y, m, datenumber);
		
		// 本月第一周多出的天数
		var firstWeekAppend = (7 - firstweek + that.options.startweek) % 7;
		if(firstWeekAppend < 0){firstWeekAppend = -firstWeekAppend}
		
		// 本月最后一周多出的天数
		var lastWeekAppend = null;
		if(lastweek > that.options.startweek){
			lastWeekAppend = lastweek - that.options.startweek + 1
		}else if(lastweek < that.options.startweek){
			lastWeekAppend = (6 - that.options.startweek) + lastweek + 2
		}else if(lastweek == that.options.startweek){
			lastWeekAppend = 1
		}
		if(lastWeekAppend == 7){lastWeekAppend = 0};
		
		//本月中间的周数
		var weeknumber = (datenumber - firstWeekAppend - lastWeekAppend) / 7;		
		
		
		// 构造日信息所需变量
		var _year = y;
		var _month_value = m;
		var _month_label = m + 1;
		var _date = d;
		var _thisDate = 1;
		//前一个月的信息
		var _prevMonth_year = y;
		var _prevMonth_value = m - 1;
		var _prevMonth_label = m;
		var _prevMonth_date = Calendar.helper.getMonthDays(y, m - 1) - (7 - firstWeekAppend) + 1;	//上月多出开始日期
		//下一个月的信息
		var _nextMonth_year = y;
		var _nextMonth_value = m + 1;
		var _nextMonth_label = m + 2;
		var _nextMonth_date = 1;
		//
		if(m - 1 == -1){
			_prevMonth_year = y - 1;
			_prevMonth_value = 11;
			_prevMonth_label = 12;
			_prevMonth_date = Calendar.helper.getMonthDays(y, m) - (7 - firstWeekAppend) + 1;
		}
		
		if(m + 1 == 12){
			var _nextMonth_year = y + 1;
			var _nextMonth_value = 0;
			var _nextMonth_label = 1;
		}
		
		/*
		 +----------------------------------------------------------------------
		 +----------------------------------------------------------------------
		 | JSON组装开始
		 +----------------------------------------------------------------------
		 +----------------------------------------------------------------------
		 */
		var calendarJSON = {};
		
		// 显示模式
		calendarJSON.mode = {"year": false, "month": false, "date": true, "time": false};
		
		// 年信息
		calendarJSON.year = {};
		calendarJSON.year.current = {"value": y, "label": y} //当前选中年份
		calendarJSON.year.items = []; //下拉框中的年份列表
		for(var i = y-10, j = 0; i < y + 11; i++, j++){
			var _current = (i == y) ? true : false;
			calendarJSON.year.items[j] = {"value": i, "label": i, "current": _current};
		}
		
		// 月信息
		calendarJSON.month = {};
		calendarJSON.month.current = {"value": m, "label": m + 1}; //当前选中年份
		calendarJSON.month.items = []; //下拉框中的月份列表
		for(var i = 0; i < 12; i++){
			var _current = (i == m) ? true : false;
			calendarJSON.month.items[i] = {"value":i, "label": i + 1, "current": _current};
		}
		
		// 日信息
		calendarJSON.date = {};
		calendarJSON.date.current = {"value": d, "label": d}; //当前选中日
		calendarJSON.date.items = [];
				
		;(function(){
			var _list_ = [];
			var _i_ = 0;
			//本月最第一周多出格子上月填充
			if(firstWeekAppend != 0){
				for (var i = 0; i < (7 - firstWeekAppend); i++) {
					var _day = Calendar.helper.getWeekDay(_prevMonth_year,_prevMonth_value,_prevMonth_date);
					_list_[_i_] = {
						 "y": _prevMonth_year,
						 "m": _prevMonth_label,
						 "d": _prevMonth_date,
						 "M": Calendar.helper.zero(_prevMonth_label),
						 "D": Calendar.helper.zero(_prevMonth_date),
						 "day": _day,
						 "addClass": that.options.theme_css.date_other
					}
					_i_ ++;
					_prevMonth_date ++;
				}
			}
			//本月第一周
			if(firstWeekAppend != 0){
				for (var i = 0; i < firstWeekAppend; i++) {
					var __addClass = (_thisDate == _date) ? that.options.theme_css.date_this : "";
					var _day = Calendar.helper.getWeekDay(_year,_month_value,_thisDate);
					_list_[_i_] = {
						 "y": _year,
						 "m": _month_label,
						 "d": _thisDate,
						 "M": Calendar.helper.zero(_month_label),
						 "D": Calendar.helper.zero(_thisDate),
						 "day": _day,
						 "addClass": __addClass
					}
					_i_ ++;
					_thisDate ++;
				}
			}
			//本月中间几周
			for (var i = 0; i < 7 * weeknumber; i++) {
				var __addClass = (_thisDate == _date) ? that.options.theme_css.date_this : "";
				var _day = Calendar.helper.getWeekDay(_year, _month_value, _thisDate);
				_list_[_i_] = {
					"y": _year,
					"m": _month_label,
					"d": _thisDate,
					"M": Calendar.helper.zero(_month_label),
					"D": Calendar.helper.zero(_thisDate),
					"day": _day,
					"addClass": __addClass
				}
				_i_ ++;
				_thisDate ++;
			}
		
			//本月最后一周
			if(lastWeekAppend != 0){
				for (var i = 0; i < lastWeekAppend; i++) {
					var __addClass = (_thisDate == _date) ? that.options.theme_css.date_this : "";
					var _day = Calendar.helper.getWeekDay(_year, _month_value, _thisDate);
					_list_[_i_] = {
						"y": _year,
						"m": _month_label,
						"d": _thisDate,
						"M": Calendar.helper.zero(_month_label),
						"D": Calendar.helper.zero(_thisDate),
						"day": _day,
						"addClass": __addClass
					}
					_i_ ++;
					_thisDate ++;
				}
			}
			//本月最后一周多出格子下月填充
			if(lastWeekAppend != 0){
				for (var i = 0; i < 7 - lastWeekAppend; i++) {
					var _day = Calendar.helper.getWeekDay(_nextMonth_year, _nextMonth_value, _nextMonth_date);
					_list_[_i_] = {
						"y": _nextMonth_year,
						"m": _nextMonth_label,
						"d": _nextMonth_date,
						"M": Calendar.helper.zero(_nextMonth_label),
						"D": Calendar.helper.zero(_nextMonth_date),
						"day": _day,
						"addClass": that.options.theme_css.date_other
					}
					_i_ ++;
					_nextMonth_date ++;
				}
			}
			calendarJSON.date.items = _list_;
			
			for(var i=0; i<calendarJSON.date.items.length; i++){
				if((i+1)%7=="1"){
					calendarJSON.date.items[i].start = true;
					calendarJSON.date.items[i].end = false;
				}else if((i+1)%7=="0"){
					calendarJSON.date.items[i].start = false;
					calendarJSON.date.items[i].end = true;
				}else{
					calendarJSON.date.items[i].start = false;
					calendarJSON.date.items[i].end = false;
				}
			}
		})();
		
		// 星期信息
		calendarJSON.day = {};
		calendarJSON.day.items = [];
		for(var j=0, i = that.options.startweek ; i < that.options.startweek + 7; i++, j++){
			calendarJSON.day.items[j] = {"value": (i%7), "label": that.options.lang.week[i%7]};
		}
		
		// 时间信息
		if(that.options.is_time){
			calendarJSON.hours = {};
			calendarJSON.hours.items = [];
			for(var i = 0; i<24; i++){
				var I = (i < 10) ? ("0" + i) : i;
				if(I==H){
					calendarJSON.hours.current = {"value": i, "label": I}; //当前小时
					calendarJSON.hours.items[i] = {"value": i, "label": I, "current": true}
				}else{
					calendarJSON.hours.items[i] = {"value": i, "label": I, "current": false}
				}
			}
			calendarJSON.minutes = {};
			calendarJSON.minutes.items = [];
			for(var i = 0; i<60; i++){
				var I = (i < 10) ? ("0" + i) : i;
				if(I==M){
					calendarJSON.minutes.current = {"value": i, "label": I}; //当前分钟
					calendarJSON.minutes.items[i] = {"value": i, "label": I, "current": true}
				}else{
					calendarJSON.minutes.items[i] = {"value": i, "label": I, "current": true}
				}
			}
		}
		
		// 配置项信息
		calendarJSON.options = that.options;
		
		/*
		 +----------------------------------------------------------------------
		 +----------------------------------------------------------------------
		 | HTML转换开始
		 +----------------------------------------------------------------------
		 +----------------------------------------------------------------------
		 */
		
		var template = Handlebars.compile(that.__tpl);
		var calendarJSONtoHTML = template(calendarJSON);
		this.box.html(calendarJSONtoHTML);
	}
	
	/**
	 * 绑定事件
	 * @method Calendar.prototype.__fBind
	 * @return void
	 */
	Calendar.prototype.__fBind = function(){
		var that = this;
		var oThisbox = this.box;
		
		//下一年
		oThisbox.on("click", this.options.events.year_next, function(event){
			that.options._ymdHMS.y++;
			that.__fCreateCalendar();
		});
		
		//上一年
		oThisbox.on("click", this.options.events.year_prev, function(event){
			that.options._ymdHMS.y--;
			that.__fCreateCalendar();
		});
		
		//下月
		oThisbox.on("click", this.options.events.month_next , function(event){
			if(that.options._ymdHMS.m == 11){
				that.options._ymdHMS.y++;
				that.options._ymdHMS.m = 0;	
			}else{
				that.options._ymdHMS.m++;
			}
			that.__fCreateCalendar();
		});
		//上月
		oThisbox.on("click", this.options.events.month_prev, function(event){
			if(that.options._ymdHMS.m == 0){
				that.options._ymdHMS.y--;
				that.options._ymdHMS.m = 11;	
			}else{
				that.options._ymdHMS.m--;	
			}
			that.__fCreateCalendar();
		});
		//年
		oThisbox.on("change", this.options.events.change_year, function(event){
			var _val = $(this).val();
			that.options._ymdHMS.y = _val;
			that.__fCreateCalendar();
		});		
		//月
		oThisbox.on("change", this.options.events.change_month, function(event){
			that.options._ymdHMS.m = $(this).val();
			that.__fCreateCalendar();
		});
		
		if(this.options.is_time){
			//时
			oThisbox.on("change", this.options.events.change_hour, function(event){
				that.options._ymdHMS.H = $(this).val();
				var tempH = (that.options._ymdHMS.H < 10) ? ("0" + that.options._ymdHMS.H) : that.options._ymdHMS.H;
				$("."+that.options.theme_css.handle_hour_ui+" i").html(tempH + $LANG$.hours);
			});
			//分
			oThisbox.on("change", this.options.events.change_minute, function(event){
				that.options._ymdHMS.M = $(this).val();
				var tempM = (that.options._ymdHMS.M < 10) ? ("0" + that.options._ymdHMS.M) : that.options._ymdHMS.M;
				$("."+that.options.theme_css.handle_minute_ui+" i").html(tempM + $LANG$.minute);
			});
		}
		
		//日期点击事件
		oThisbox.on("click", this.options.events.day, function(event){
			event.preventDefault();
			that.options._ymdHMS.y = $(this).data("year");
			that.options._ymdHMS.m = $(this).data("month")-1;
			that.options._ymdHMS.d = $(this).data("date");
			that.__fPrint();
		});
		
		oThisbox.on("mouseenter", this.options.events.day, function(event){
			$(this).addClass(that.options.theme_css.date_hover);
		});
		oThisbox.on("mouseleave", this.options.events.day, function(event){
			$(this).removeClass(that.options.theme_css.date_hover);
		});
		//清空日期
		oThisbox.on("click", this.options.events.button_clear, function(event){
			that.selector.val("");
			that.__fClose();
		});
		//今日
		oThisbox.on("click", this.options.events.button_today, function(event){
			var defaultDay = new Date();
			that.options._ymdHMS.y = defaultDay.getFullYear();
			that.options._ymdHMS.m = defaultDay.getMonth();
			that.options._ymdHMS.d = defaultDay.getDate();
			that.options._ymdHMS.H = defaultDay.getHours();
			that.options._ymdHMS.M = defaultDay.getMinutes();
			that.options._ymdHMS.S = defaultDay.getSeconds();
			that.__fCreateCalendar();
			that.__fPrint();
		});
		//关闭
		oThisbox.on("click", this.options.events.button_close, function(event){
			that.__fClose();
		});
		//确定
		oThisbox.on("click", this.options.events.button_ok, function(event){
			that.__fPrint();
		});
		
		//
		oThisbox.on("mouseup", function(event){
			event.preventDefault();
			event.stopPropagation();
		});
		$(document).on("mouseup.FclendarDocument", function(event){
			that.__fClose();
		});
	}
	
	/**
	 * 写入时间
	 * @method Calendar.prototype.__fPrint
	 * @return void
	 */
	Calendar.prototype.__fPrint = function(){
		var oDateNEW_TEMP = new Date(this.options._ymdHMS.y,this.options._ymdHMS.m,this.options._ymdHMS.d,this.options._ymdHMS.H,this.options._ymdHMS.M,this.options._ymdHMS.S);
		var value = Calendar.helper.print(oDateNEW_TEMP, this.options.format);
		var DOM_trigger_value = $(this.options.trigger_value)[0];
		if(DOM_trigger_value.type){
			DOM_trigger_value.value = value;
		}else{
			DOM_trigger_value.innerHTML = value;
		}
		if(this.options.callback_role_day && (typeof this.options.callback_role_day) == "function"){this.options.callback_role_day.call(this);}
		this.__fClose();
	}
	
	/**
	 * 关闭
	 * @method Calendar.prototype.__fClose
	 * @return void
	 */
	Calendar.prototype.__fClose = function(){
		this.box.remove();
		$(document).off(".FclendarDocument");
		this.box = null;
		gFcalendar = null;
		this.options._pos_is_true = false;
	}
	
	/**
	 * 默认配置项
	 */
	Calendar.defaults = {
		v: "2.0.x"
		,trigger: undefined //唤出日历的元素，可以是：选择器   element    jQuery Object
		,trigger_value: undefined //日期写入的元素，如不定义，默认匹配trigger
		,format: "%Y-%m-%d"	//输出日期格式，默认为%Y-%m-%d
		,is_time: false //是否显示时分秒
		
		// 暂不开放的
		,align: undefined //框体对齐的目标,未定义时对齐到trigger
		,show_id: false //页面默认显示，非弹层，默认不开启
		,tpl: '<div class="F-calendar-handle-ymd"><span class="F-clendar-handle-month-prev"data-title="'+$LANG$.prevMonth+'"data-role="month_prev">&lt;&lt;</span><span class="F-calendar-handle-year-ui"><i>{{year.current.value}}'+$LANG$.year+'</i><select class="F-calendar-handle-year-change"data-role="change_year">{{#each year.items}}<option value="{{value}}"{{#if current}}selected{{/if}}>{{value}}'+$LANG$.year+'</option>{{/each}}</select></span><span class="F-calendar-handle-month-ui"><i>{{month.current.label}}'+$LANG$.month+'</i><select class="F-calendar-handle-month-change"data-role="change_month">{{#each month.items}}<option value="{{value}}"{{#if current}}selected{{/if}}>{{label}}'+$LANG$.month+'</option>{{/each}}</select></span><span class="F-clendar-handle-month-next"data-title="'+$LANG$.nextMonth+'"data-role="month_next">&gt;&gt;</span></div><div class="F-calendar-append-week-ui"></div><table cellpadding="0"cellspacing="0"><thead><tr>{{#each day.items}}<th class="F-calendar-week{{value}}"><span>{{label}}</span></th>{{/each}}</tr></thead><tbody>{{#each date.items}}{{#if start}}<tr>{{/if}}<td data-role="day"class="F-calendar-date-default {{addClass}}"data-year="{{y}}"data-month="{{m}}"data-date="{{d}}"data-week="{{day}}"><span>{{d}}</span></td>{{#if end}}</tr>{{/if}}{{/each}}</tbody></table>{{#if options.is_time}}<div class="F-calendar-handle-HMS"><span class="F-calendar-handle-hour-ui"><i>{{hours.current.label}}'+$LANG$.hours+'</i><select class="F-calendar-handle-hour-change"data-role="change_hour">{{#each hours.items}}<option value="{{value}}"{{#if current}}selected{{/if}}>{{label}}</option>{{/each}}</select></span><span class="F-calendar-handle-minute-ui"><i>{{minutes.current.label}}'+$LANG$.minute+'</i><select class="F-calendar-handle-minute-change"data-role="change_minute">{{#each minutes.items}}<option value="{{value}}"{{#if current}}selected{{/if}}>{{label}}</option>{{/each}}</select></span></div>{{/if}}<div class="F-calendar-button-ui"><span class="F-calendar-button-clear"data-role="button_clear"><i>'+$LANG$.clear+'</i></span><span class="F-calendar-button-today"data-role="button_today"><i>'+$LANG$.today+'</i></span><span class="F-calendar-button-ok"data-role="button_ok"><i>'+$LANG$.ok+'</i></span></div>'
		,startweek: 0 //第一天的星期
		,callback_role_day: undefined //日期写入后关闭前执行
		,callback_on_event: null // 自定义绑定事件，如果非弹层状态需要注意重复绑定bug
		
		// 未使用
		,is_button_clear: true
		,is_button_today: true
		,is_button_ok: true
		,is_button_close: false
		
		// 没用的
		,lang: {
			week: $LANG$.week
		}
		,events: {
			change_year: "[data-role='change_year']" //年
			,year_next: "[data-role='year_next']" //下一年
			,year_prev: "[data-role='year_prev']" //上一年
			
			,change_month: "[data-role='change_month']" //月			
			,month_next: "[data-role='month_next']" //下一月
			,month_prev: "[data-role='month_prev']" //上一月
			
			,change_hour: "[data-role='change_hour']" //时
			,change_minute: "[data-role='change_minute']" //分
			
			,day: "[data-role='day']" //日期点击事件
			
			,button_clear: "[data-role='button_clear']" //清空日期
			,button_today: "[data-role='button_today']" //今日
			,button_close: "[data-role='button_close']" //关闭
			,button_ok: "[data-role='button_ok']" //确定
		}
		
		,theme_css: {
			calendar_ui: "F-calendar-ui-default"
			
			,append_week_ui: "F-calendar-append-week-ui"
			,week_ui: "F-calendar-week"
			
			,handle_ymd: "F-calendar-handle-ymd"
			,handle_month_prev: "F-clendar-handle-month-prev" //上月
			,handle_month_next: "F-clendar-handle-month-next" //下月
			
			,handle_year_ui: "F-calendar-handle-year-ui"
			,handle_year_change: "F-calendar-handle-year-change"
			,handle_month_ui: "F-calendar-handle-month-ui"
			,handle_month_change: "F-calendar-handle-month-change"
			,handle_hour_ui: "F-calendar-handle-hour-ui"
			,handle_hour_change: "F-calendar-handle-hour-change"
			,handle_minute_ui: "F-calendar-handle-minute-ui"
			,handle_minute_change: "F-calendar-handle-minute-change"
			
			,handle_HMS: "F-calendar-handle-HMS"
			
			,button_ui: "F-calendar-button-ui"
			,button_clear: "F-calendar-button-clear"
			,button_today: "F-calendar-button-today"
			,button_ok: "F-calendar-button-ok"
			
			,date_default: "F-calendar-date-default"
			,date_other: "F-calendar-date-other"
			,date_this: "F-calendar-date-this"
			,date_hover: "F-calendar-date-hover"
		}
	}	
	
	//* helper
	Calendar.helper = {};
	Calendar.helper.MD = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
	Calendar.helper.SECOND = 1000;
	Calendar.helper.MINUTE = 60 * Calendar.helper.SECOND;
	Calendar.helper.HOUR = 60 * Calendar.helper.MINUTE;
	Calendar.helper.DAY = 24 * Calendar.helper.HOUR;
	Calendar.helper.WEEK = 7 * Calendar.helper.DAY;
	
	/**
	 * 解析传入的日期
	 * @method Calendar.helper.parseDate
	 * @param {String} str 文本框获取的值
	 * @param {String} fmt 从配置项中取得的格式化的值
	 * @return Date 返回日期对象
	 */
	Calendar.helper.parseDate = function(str, fmt) {
		var today = new Date();
		var y = 0;
		var m = -1;
		var d = 0;
		var a = str.split(/\W+/);
		var b = fmt.match(/%./g);
		var i = 0;
		var j = 0;
		var H = 0;
		var M = 0;
		var S = 0;
		for (i = 0; i < a.length; ++i) {
			if (!a[i]) continue;
			switch (b[i]) {
			case "%Y":
			case "%y":
				y = parseInt(a[i], 10); (y < 100) && (y += (y > 29) ? 1900 : 2000);
				break;
			case "%m":
				m = parseInt(a[i], 10) - 1;
				break;
			case "%d":
				d = parseInt(a[i], 10);
				break;
			case "%H":
				H = parseInt(a[i], 10);
				break;
			case "%M":
				M = parseInt(a[i], 10);
				break;
			case "%S":
				S = parseInt(a[i], 10);
				break;
			}
		}
		if (isNaN(y)) y = today.getFullYear();
		if (isNaN(m)) m = today.getMonth();
		if (isNaN(d)) d = today.getDate();
		if (isNaN(H)) H = today.getHours();
		if (isNaN(M)) M = today.getMinutes();
		if (isNaN(S)) S = today.getSeconds();
		if (y != 0 && m != -1 && d != 0) return new Date(y, m, d, H, M, S);
		return today;
	};
	
	/**
	 * 计算出当前月的天数
	 * @method Calendar.helper.getMonthDays
	 * @param {Namber} year 年份d{4}
	 * @param {Namber} month 月份 0-11
	 * @return Number 返回当前月的天数
	 */
	Calendar.helper.getMonthDays = function(year, month){
		if (((0 == (year % 4)) && ((0 != (year % 100)) || (0 == (year % 400)))) && month == 1) {
			return 29;
		} else {
			return Calendar.helper.MD[month];
		}
	}

	/**
	 * 本年第几天 - 暂未使用
	 * @method Calendar.helper.getDayOfYear
	 * @param  {Date} obj 日期对象
	 * @return Number 计算出传入的日期是本年中的第多少天
	 */
	Calendar.helper.getDayOfYear = function(obj){
		var now = new Date(obj.getFullYear(), obj.getMonth(), obj.getDate(), 0, 0, 0);
		var then = new Date(obj.getFullYear(), 0, 0, 0, 0, 0);
		var time = now - then;
		return Math.floor(time / Calendar.helper.DAY);
	}
	
	/**
	 * 本年第几周
	 * @method Calendar.helper.getWeekNumber
	 * @param  {Date} obj 日期对象
	 * @return Number 计算出传入的日期是本年中的第几周
	 */
	Calendar.helper.getWeekNumber = function(obj){
		var d = new Date(obj.getFullYear(), obj.getMonth(), obj.getDate(), 0, 0, 0);
		var DoW = d.getDay();
		d.setDate(d.getDate() - (DoW + 6) % 7 + 3);
		var ms = d.valueOf();
		d.setMonth(0);
		d.setDate(4);
		return Math.round((ms - d.valueOf()) / (7 * 864e5)) + 1;
	}
	
	/**
	 * 将日期格式化后输出
	 * @method Calendar.helper.print
	 * @param {Date} obj 日期对象
	 * @param {String} fmt 格式化的值 %Y-%m-%d %H:%M:%S
	 * @return String 返回格式化后要输出的日期的值
	 */
	Calendar.helper.print = function(obj, fmt){
		var y = obj.getFullYear();
		var m = obj.getMonth();
		var d = obj.getDate();
		var W = Calendar.helper.getWeekNumber(obj);
		var w = obj.getDay();
		var s = {};
		var H = obj.getHours();
		var M = obj.getMinutes();
		var S = obj.getSeconds();
		
		s["%y"] = ("" + y).substr(2, 2);
		s["%Y"] = y;
		s["%m"] = (m < 9) ? ("0" + (1 + m)) : (1 + m);
		s["%d"] = (d < 10) ? ("0" + d) : d;
		
		s["%H"] = (H < 10) ? ("0" + H) : H;
		s["%M"] = (M < 10) ? ("0" + M) : M;
		s["%S"] = (S < 10) ? ("0" + S) : S;
		
		s["%s"] = Math.floor(obj.getTime() / 1000);
		s["%W"] = (W < 10) ? ("0" + W) : W;
		s["%w"] = w + 1;	
		s["%%"] = "%";
		
		var re = /%./g;
		var a = fmt.match(re);
		for (var i = 0; i < a.length; i++) {
			var tmp = s[a[i]];
			if (tmp) {
				re = new RegExp(a[i], "g");
				fmt = fmt.replace(re, tmp);
			}
		}
		return fmt;
	}
	
	/**
	 * 获取当前是星期几
	 * @method Calendar.helper.getWeekDay
	 * @param {Number} _year 年
	 * @param {Number} _month 月 0-11
	 * @param {Number} _day 日
	 * @return Number 当天对应的星期 0-6
	 */
	Calendar.helper.getWeekDay = function(_year, _month, _day){
		var _localDate = new Date(_year, _month, _day, 0, 0, 0);
		var _currentWeek = _localDate.getDay();
		return _currentWeek;
	}
	
	/**
	 * 给出一个更好的位置
	 * @method Calendar.helper.checkOffset
	 * @param {Object} _box 传入的展示的对象
	 * @param {Object} _this 传入的目标的对象
	 * @param {Array} _pos 当前的坐标，数组
	 * @return Array 返回x,y数组坐标
	 */
	Calendar.helper.checkOffset = function(_box, _this, _pos){
		var dpWidth = _box.outerWidth();
		var dpHeight = _box.outerHeight();
		var inputWidth = _this.outerWidth();
		var inputHeight = _this.outerHeight();
		var viewWidth = document.documentElement.clientWidth + $(document).scrollLeft();
		var viewHeight = document.documentElement.clientHeight + $(document).scrollTop();
		var _pos = _pos;
		_pos[0] -= Math.min(_pos[0], (_pos[0] + dpWidth > viewWidth && viewWidth > dpWidth) ?
			Math.abs(_pos[0] + dpWidth - viewWidth) : 0);
		_pos[1] -= Math.min(_pos[1], (_pos[1] + dpHeight > viewHeight && viewHeight > dpHeight) ?
			Math.abs(dpHeight + inputHeight) : 0);
		return _pos;
	}
	
	Calendar.helper.zero = function(number){return (number < 10) ? ("0" + number) : number;}
	Calendar.helper.getZindex = function(){
		var _temp = new Date().valueOf().toString().substr(4, 9);
		return (_temp.substr(0, 2) === "00") ? ("1" + _temp) : _temp;
	}
		
	window.p070Calendar = Calendar;
});

$(function(){
	"use strict";
	
	var Calendar = p070Calendar;
	
	function helper_ajax(year,month,days,JsonpData){
		var m = parseInt(month);
		m = (m < 9) ? ("0" + (1 + m)) : (1 + m);
		var month = m;
		
		var date = Math.random();
        var obj = {};
        obj.apiUrl = "http://xytest.staff.xdf.cn/api/Calendar/";
        obj.method = "getcalendareventlistofteacher";
        obj.appid = Config.AppId;
        obj.schoolId = 3;
		obj.teacherCode = "TCGZ0050158";
        obj.fromDay = year+"-"+month+"-01";
		obj.toDay = year+"-"+month+"-"+days;
		obj.language = 1;
        obj.date = date;   //取消缓存使用
        obj.appkey = Config.AppKey;//appKey必须放到最后
        var sign = GetSign(obj);
        obj.sign = sign;

        delete obj["appkey"];
        var _data = $.toJSON(obj);
        var data = JSON.parse(_data);

        //调用接口
        $.ajax({
            url: "http://xytest.staff.xdf.cn/api/JSONP/Index",
            data: data,
            dataType: "jsonp",
            jsonp: "callback",//此项必填，不能更改
            success: function (data) {
                JsonpData(data)
				//document.writeln(JSON.stringify(data));
            },
			beforeSend: function(){
				//JsonpData(JsonpDataTest)
				$("#F-calendar-p070").find(".F-calendar-ui-p070-loading").show();
			},
			complete: function(){
				$("#F-calendar-p070").find(".F-calendar-ui-p070-loading").hide();
			}
        });

        function GetSign(obj) {
            if (obj == null) {
                throw "obj is null!";
            }
            var param = "";

            var a = $.param(obj);

            for (var key in obj) {
                param += key + "=" + obj[key] + "&";
            }
            if (param.length > 0) {
                param = param.substr(0, param.length - 1);
            }
            return $.md5(param.toLowerCase()).toUpperCase();
        }
	}
	
	
	function helper_render(year, month){
		var days = Calendar.helper.getMonthDays(year, month); //本月的天数
		helper_ajax(year,month,days,function(JsonpData){
			var _obj = JsonpData.Data;
			for(var i = 0; i< _obj.length; i++){
				var thisDataObj = _obj[i]['DetailInfo'];
				var id = thisDataObj['SectBegin'].substr(0, 10).replace(/-/g,"");
				var t1 = thisDataObj.SectBegin.replace(/-| /g,"").substr(8,5)+"-"+thisDataObj.SectEnd.replace(/-| /g,"").substr(8,5);
				
				var thisTitle = '';
				if(thisDataObj['ClassCode'] != null){thisTitle += '班级编号：'+thisDataObj['ClassCode']+'\n';}
				if(thisDataObj['ClassName'] != null){thisTitle += '班级名称：'+thisDataObj['ClassName']+'\n';}
				if(thisDataObj['LessonNo'] != null){thisTitle += '班级课次：'+thisDataObj['LessonNo']+'\n';}
				if(thisDataObj['CourseName'] != null){thisTitle += '课程名称：'+thisDataObj['CourseName']+'\n';}
				if(thisDataObj['SectBegin'] != null){thisTitle += '开始时间：'+thisDataObj['SectBegin']+'\n';}
				if(thisDataObj['SectEnd'] != null){thisTitle += '结束时间：'+thisDataObj['SectEnd']+'\n';}
				if(thisDataObj['PrintAdress'] != null){thisTitle += '上课地点：'+thisDataObj['PrintAdress']+'\n';}
				if(thisDataObj['StudentNames'] != null){thisTitle += '学生名称：'+thisDataObj['StudentNames'];}
				
				var thisHTML = '';
				thisHTML += '<div class="tItem" title="'+thisTitle+'"><i></i><div class="tItemTime">'+t1+'</div>';
				if(thisDataObj['ClassName'] != null){thisHTML += '<div class="tItemClassName">'+thisDataObj['ClassName']+'</div>';}
				if(thisDataObj['PrintAdress'] != null){thisHTML += '<div class="tItemPrintAdress">'+thisDataObj['PrintAdress']+'</div>';}
				thisHTML += '</div>';
				
				$("#day-"+id).find(".F-calendar-show-day").hide();
				$("#day-"+id).append(thisHTML);
			}
		});
		//console.log(year, month, days)
	}
	
	/**
	 * 构造日历对象
	 */
	var calendar = new Calendar({
		trigger: '#F-calendar-p070-value',		
		show_id: '#F-calendar-p070',
		callback_on_event: function(){
			helper_render(calendar.options._ymdHMS.y, calendar.options._ymdHMS.m);
		},
		tpl: '<div class="F-calendar-ui-p070"><div class="F-calendar-ui-p070-loading"><span>加载中...</span></div><div class="F-calendar-function-YearAndMonth"><div class="F-calendar-function-main"><span class="F-calendar-function-year-prev" title="上年">&lt;&lt;</span><span class="F-calendar-function-month-prev" title="上月">&lt;</span><span class="F-calendar-function-month-next" title="下月">&gt;</span><span class="F-calendar-function-year-next" title="下年">&gt;&gt;</span><span class="F-calendar-function-today" title="本月">&nbsp;</span></div><span class="F-calendar-function-month-show">{{year.current.value}}年{{month.current.label}}月</span></div><dl><dt><ul class="clearfix">{{#each day.items}}<li class="F-calendar-week{{value}}"><span>周{{label}}</span></li>{{/each}}</ul></dt><dd><table>{{#each date.items}}{{#if start}}<tr>{{/if}}<td data-week="{{day}}" data-date="{{d}}" data-month="{{m}}" data-year="{{y}}" class="F-calendar-date-default {{addClass}}" data-role="day" id="day-{{y}}{{M}}{{D}}"><div class="F-calendar-show-day">{{d}}</div></td>{{#if end}}</tr>{{/if}}{{/each}}</table></dd></dl></div>'
	});
	
	
	function Auto(){
		//下月
		calendar.box.on("click", ".F-calendar-function-month-next", function(event){
			function run(){
				if(calendar.options._ymdHMS.m == 11){
					calendar.options._ymdHMS.y++;
					calendar.options._ymdHMS.m = 0;	
				}else{
					calendar.options._ymdHMS.m++;
				}
				calendar.__fCreateCalendar();
				helper_render(calendar.options._ymdHMS.y, calendar.options._ymdHMS.m);
			}
			run();
		});
		
		//上月
		calendar.box.on("click", ".F-calendar-function-month-prev", function(event){
			function run(){
				if(calendar.options._ymdHMS.m == 0){
					calendar.options._ymdHMS.y--;
					calendar.options._ymdHMS.m = 11;	
				}else{
					calendar.options._ymdHMS.m--;	
				}
				calendar.__fCreateCalendar();
				helper_render(calendar.options._ymdHMS.y, calendar.options._ymdHMS.m);
			}
			run();
		});
		
		//下一年
		calendar.box.on("click", ".F-calendar-function-year-next", function(event){
			calendar.options._ymdHMS.y++;
			calendar.__fCreateCalendar();
			helper_render(calendar.options._ymdHMS.y, calendar.options._ymdHMS.m);
		});
		
		//上一年
		calendar.box.on("click", ".F-calendar-function-year-prev", function(event){
			calendar.options._ymdHMS.y--;
			calendar.__fCreateCalendar();
			helper_render(calendar.options._ymdHMS.y, calendar.options._ymdHMS.m);
		});
		
		//今日
		calendar.box.on("click", ".F-calendar-function-today", function(event){
			var defaultDay = new Date();
			calendar.options._ymdHMS.y = defaultDay.getFullYear();
			calendar.options._ymdHMS.m = defaultDay.getMonth();
			calendar.options._ymdHMS.d = defaultDay.getDate();
			calendar.options._ymdHMS.H = defaultDay.getHours();
			calendar.options._ymdHMS.M = defaultDay.getMinutes();
			calendar.options._ymdHMS.S = defaultDay.getSeconds();
			calendar.__fCreateCalendar();
			helper_render(calendar.options._ymdHMS.y, calendar.options._ymdHMS.m);
		});
		
		calendar.render();
	}
	window.p070Auto = Auto;
});



window.JsonpDataTest = {
    "State": 1,
    "Data": [
        {
            "DetailInfo": {
                "ClassCode": "CLGZ000475",
                "ClassName": "中考数学一对一（续）",
                "TeacherName": null,
                "PrintAdress": "环市东个性化R10",
                "LessonNo": "6",
                "CourseName": "中考数学Q",
                "SectBegin": "2014-09-29 18:30",
                "SectEnd": "2014-09-29 21:00",
                "LessonNoCourse": "中考数学Q第3课次",
                "StudentNames": "谢钲宇,谢钲宇"
            },
            "allDay": false,
            "end": "2014-09-29 21:00:00",
            "id": "6",
            "start": "2014-09-29 18:30:00",
            "title": "\n中考数学一对一（续）\n环市东个性化R10"
        },
        {
            "DetailInfo": {
                "ClassCode": "CLGZ000475",
                "ClassName": "中考数学一对一（续）",
                "TeacherName": null,
                "PrintAdress": "环市东个性化R10",
                "LessonNo": "4",
                "CourseName": "中考数学Q",
                "SectBegin": "2014-09-28 18:20",
                "SectEnd": "2014-09-28 20:20",
                "LessonNoCourse": "中考数学Q第6课次",
                "StudentNames": "谢钲宇,谢钲宇"
            },
            "allDay": false,
            "end": "2014-09-28 20:20:00",
            "id": "4",
            "start": "2014-09-28 18:20:00",
            "title": "\n中考数学一对一（续）\n环市东个性化R10"
        },
        {
            "DetailInfo": {
                "ClassCode": "CLGZ000475",
                "ClassName": "中考数学一对一（续）",
                "TeacherName": null,
                "PrintAdress": "环市东个性化R10",
                "LessonNo": "5",
                "CourseName": "中考数学Q",
                "SectBegin": "2014-09-29 16:20",
                "SectEnd": "2014-09-29 18:20",
                "LessonNoCourse": "中考数学Q第11课次",
                "StudentNames": "谢钲宇,谢钲宇"
            },
            "allDay": false,
            "end": "2014-09-29 18:20:00",
            "id": "5",
            "start": "2014-09-29 16:20:00",
            "title": "\n中考数学一对一（续）\n环市东个性化R10"
        },
        {
            "DetailInfo": {
                "ClassCode": "CLGZ000475",
                "ClassName": "中考数学一对一（续）",
                "TeacherName": null,
                "PrintAdress": null,
                "LessonNo": "8",
                "CourseName": "中考数学Q",
                "SectBegin": "2014-10-05 18:20",
                "SectEnd": "2014-10-05 20:20",
                "LessonNoCourse": "中考数学Q第4课次",
                "StudentNames": "谢钲宇,谢钲宇"
            },
            "allDay": false,
            "end": "2014-10-05 20:20:00",
            "id": "8",
            "start": "2014-10-05 18:20:00",
            "title": "\n中考数学一对一（续）\n环市东个性化R10"
        },
        {
            "DetailInfo": {
                "ClassCode": "CLGZ000475",
                "ClassName": "中考数学一对一（续）",
                "TeacherName": null,
                "PrintAdress": "环市东个性化R10",
                "LessonNo": "8",
                "CourseName": "中考数学Q",
                "SectBegin": "2014-10-05 16:20",
                "SectEnd": "2014-10-05 18:20",
                "LessonNoCourse": "中考数学Q第7课次",
                "StudentNames": "谢钲宇,谢钲宇"
            },
            "allDay": false,
            "end": "2014-10-05 18:20:00",
            "id": "8",
            "start": "2014-10-05 16:20:00",
            "title": "\n中考数学一对一（续）\n环市东个性化R10"
        },
        {
            "DetailInfo": {
                "ClassCode": "CLGZ000475",
                "ClassName": "中考数学一对一（续）",
                "TeacherName": null,
                "PrintAdress": "环市东个性化R10",
                "LessonNo": "9",
                "CourseName": "中考数学Q",
                "SectBegin": "2014-10-12 16:20",
                "SectEnd": "2014-10-12 18:20",
                "LessonNoCourse": "中考数学Q第8课次",
                "StudentNames": "谢钲宇,谢钲宇"
            },
            "allDay": false,
            "end": "2014-10-12 18:20:00",
            "id": "9",
            "start": "2014-10-12 16:20:00",
            "title": "\n中考数学一对一（续）\n环市东个性化R10"
        },
        {
            "DetailInfo": {
                "ClassCode": "CLGZ000475",
                "ClassName": "中考数学一对一（续）",
                "TeacherName": null,
                "PrintAdress": "环市东个性化R10",
                "LessonNo": "10",
                "CourseName": "中考数学Q",
                "SectBegin": "2014-10-19 16:20",
                "SectEnd": "2014-10-19 18:20",
                "LessonNoCourse": "中考数学Q第9课次",
                "StudentNames": "谢钲宇,谢钲宇"
            },
            "allDay": false,
            "end": "2014-10-19 18:20:00",
            "id": "10",
            "start": "2014-10-19 16:20:00",
            "title": "\n中考数学一对一（续）\n环市东个性化R10"
        },
        {
            "DetailInfo": {
                "ClassCode": "CLGZ000475",
                "ClassName": "中考数学一对一（续）",
                "TeacherName": null,
                "PrintAdress": "环市东个性化R10",
                "LessonNo": "11",
                "CourseName": "中考数学Q",
                "SectBegin": "2014-10-26 16:20",
                "SectEnd": "2014-10-26 18:20",
                "LessonNoCourse": "中考数学Q第10课次",
                "StudentNames": "谢钲宇,谢钲宇"
            },
            "allDay": false,
            "end": "2014-10-26 18:20:00",
            "id": "11",
            "start": "2014-10-26 16:20:00",
            "title": "\n中考数学一对一（续）\n环市东个性化R10"
        },
        {
            "DetailInfo": {
                "ClassCode": "CLGZ001175",
                "ClassName": "初一全科一对一",
                "TeacherName": null,
                "PrintAdress": null,
                "LessonNo": "26",
                "CourseName": "初一英语W",
                "SectBegin": "2014-09-28 08:00",
                "SectEnd": "2014-09-28 10:00",
                "LessonNoCourse": "初一英语W第26课次",
                "StudentNames": "黄嘉俊,黄嘉俊"
            },
            "allDay": false,
            "end": "2014-09-28 10:00:00",
            "id": "26",
            "start": "2014-09-28 08:00:00",
            "title": "\n初一全科一对一\n"
        },
        {
            "DetailInfo": {
                "ClassCode": "PJ1TB1J250003",
                "ClassName": "一年级英语1对1班",
                "TeacherName": null,
                "PrintAdress": "番禺洛溪第4教室（弃）",
                "LessonNo": "11",
                "CourseName": "泡泡英语一年级综合培优班（上）",
                "SectBegin": "2014-10-12 00:00",
                "SectEnd": "2014-10-12 01:20",
                "LessonNoCourse": "泡泡英语一年级综合培优班（上）第11课次",
                "StudentNames": "张梓俊,张梓俊"
            },
            "allDay": false,
            "end": "2014-10-12 01:20:00",
            "id": "11",
            "start": "2014-10-12 00:00:00",
            "title": "\n一年级英语1对1班\n番禺洛溪第4教室（弃）"
        }
    ],
    "Error": null,
    "DataCount": 10
}



/* TPL
<div class="F-calendar-ui-p070">
	<div class="F-calendar-ui-p070-loading"><span>加载中...</span></div>
	<div class="F-calendar-function-YearAndMonth">
		<div class="F-calendar-function-main">
			<span class="F-calendar-function-year-prev" title="上年">&lt;&lt;</span>
			<span class="F-calendar-function-month-prev" title="上月">&lt;</span>
			<span class="F-calendar-function-month-next" title="下月">&gt;</span>
			<span class="F-calendar-function-year-next" title="下年">&gt;&gt;</span>
			<span class="F-calendar-function-today" title="本月">&nbsp;</span>
		</div>
		<span class="F-calendar-function-month-show">{{year.current.value}}年{{month.current.label}}月</span>		
	</div>
	<dl>
		<dt>
			<ul class="clearfix">
				{{#each day.items}}<li class="F-calendar-week{{value}}"><span>周{{label}}</span></li>{{/each}}
			</ul>
		</dt>
		<dd>
			<table>
				{{#each date.items}}
				{{#if start}}<tr>{{/if}}
					<td data-week="{{day}}" data-date="{{d}}" data-month="{{m}}" data-year="{{y}}" class="F-calendar-date-default {{addClass}}" data-role="day" id="day-{{y}}{{M}}{{D}}">
						<div class="F-calendar-show-day">{{d}}</div>
					</td>
				{{#if end}}</tr>{{/if}}
				{{/each}}
			</table>
		</dd>
	</dl>
</div>
*/