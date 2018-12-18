(function($) {
	var zczy_window_sets = [];
	var methods = {
		init : function(options, picjsonarray) {
			return this.each(function() {
				var zczy_id = $(this).parent().attr("zczy_id");
				if (zczy_id || zczy_id == 0) {
					return;
				}
				var set = {
					$this : "",
					closed : true,
					mask : true,
					donghua : false
				};
				/*
				 * 初始化参数
				 */
				set.$this = $(this);

				// 合并参数开始
				set = $.extend(set, options);

				// 合并参数结束
				zczy_window_sets.push(set);
				
				var $all = $("<div zczy_id='" + (zczy_window_sets.length - 1)
				+ "'></div>");
				if(set.closed){
					$all.hide();
				}
				set.$this.wrap($all);
				var $mask = $("<div class=\"zczy_mask\">&nbsp;</div>");
				if(!set.mask){
					$mask.hide();
				}
				set.$this.before($mask);
				$mask.css({
					"z-index":"9999",
					"width":"100%",
					"opacity" : "0.45",
					"background-color" : "gray",
					"position" : "fixed",
					"left":"0px",
					"top":"0px"
				});
				set.$this.css({"z-index":"9999"}).show();
				
				if(!set.closed){
					methods.open.apply(set.$this);
				}
				set.x= getPageScroll()[0];
				set.y= getPageScroll()[1];
				methods.resize.apply(set.$this);
				addEvent(window, "resize", function() {
					set.x= getPageScroll()[0];
					set.y= getPageScroll()[1];
					methods.resize.apply(set.$this);

				});
				addEvent(window, "scroll", function() {
					methods.resize.apply(set.$this);
				});
				
			});
		},
		open : function() {
			return this.each(function() {
				var zczy_id = $(this).parent().attr("zczy_id");
				if (!zczy_id && zczy_id != 0) {
					return;
				}
				var set = zczy_window_sets[zczy_id];
				set.x= getPageScroll()[0];
				set.y= getPageScroll()[1];
				if (set.donghua) {
					set.$this.parent().fadeIn();
				} else {
					set.$this.parent().css("display", "");
				}
				methods.resize.apply($(this));
			});
		},
		close : function() {
			return this.each(function() {
				var zczy_id = $(this).parent().attr("zczy_id");
				if (!zczy_id && zczy_id != 0) {
					return;
				}
				var set = zczy_window_sets[zczy_id];
				if (set.donghua) {
					set.$this.parent().fadeOut();
				} else {
					set.$this.parent().css("display", "none");
				}
			});
		},
		resize : function() {
			return this
					.each(function() {
						var zczy_id = $(this).parent().attr("zczy_id");
						if (!zczy_id && zczy_id != 0) {
							return;
						}
						set = zczy_window_sets[zczy_id];
						var window_width = getPageSize()[2];//$(window).width();
						var window_height = getPageSize()[3];//$(window).height();
						var width = set.$this.width();
						var height = set.$this.height();
						
						var  top =(window_height-height)/2 ;
						var  left = (window_width-width)/2;
						set.$this.parent().find(".zczy_mask").css({
							"height":window_height+"px"
						});
						if(window_width>width&&window_height>height){
							set.$this.css({
								"position":"fixed",
								"top":top+"px",
								"left":left+"px"
							});
						}else{
							
							if(window_width<width&&window_height<height){
								
								set.$this.css({
									"position":"absolute",
									"left":set.x+"px",
									"top":set.y+"px"
								});	
								
							}else{
								
								
								if(window_width<width){
									set.$this.css({
										"position":"absolute",
										"left":"0px",
										"top":(getPageScroll()[1]+top)+"px"
									});	
								}
								
								
								if(window_height<height){
									set.$this.css({
										"position":"absolute",
										"left":(getPageScroll()[0]+left)+"px",
										"top":set.y+"px"
									});	
								}
								
								
								
							}
							
						}
					});
		}
	};

	$.fn.zczy_window = function() {
		var method = arguments[0];
		if (methods[method]) {
			method = methods[method];
			arguments = Array.prototype.slice.call(arguments, 1);
		} else if (typeof (method) == 'object' || !method) {
			method = methods.init;
		} else {
			$
					.error('Method ' + method
							+ ' does not exist on jQuery.pluginName');
			return this;
		}
		return method.apply(this, arguments);
	}
})(jQuery);
(function($) {

	var methods = {
		init : function(options, picjsonarray) {
			return this.each(function() {
				parent.$("div[zczy_id]").remove();
				var $this = $(this).clone();
				parent.$("body").append();
				parent.$this.zczy_window(options);

			});
		},
		open : function() {
			return this.each(function() {
				methods.init.apply($(this));
			});
		},
		close : function() {
			return this.each(function() {
				$(this).zczy_window("close");
			});
		}
	};
	$.fn.zczy_pwindow = function() {
		var method = arguments[0];

		if (methods[method]) {
			method = methods[method];
			arguments = Array.prototype.slice.call(arguments, 1);
		} else if (typeof (method) == 'object' || !method) {
			method = methods.init;
		} else {
			$
					.error('Method ' + method
							+ ' does not exist on jQuery.pluginName');
			return this;
		}
		return method.apply(this, arguments);
	}
})(jQuery);
$(function() {
	if ($("#alerttishiyu").attr("id") != "alerttishiyu") {
		$("body").append("<div id=\"alerttishiyu\"><div>");
		$("#alerttishiyu").css({
			"border" : "3px solid #43BE0E",
			"width" : "200px",
			"color" : "red",
			"text-align" : "center",
			"padding" : "15px",
			"font-size" : "20px",
			"background-color" : "white",
			"word-break" : "break-all"
		});
	}
	$("#alerttishiyu").zczy_window({
		mask : false,
		donghua : true
	});
	if ($("#zczy_confirm").attr("id") != "zczy_confirm") {
		$("body")
				.append(
						"<div id=\"zczy_confirm\" style=\"display:none\" class=\"tuich_tcbox\"><div class=\"tuich_tit\"><a class=\"guanbi\" href=\"javascript:;\">关闭</a>温馨提示</div><dl class=\"tuich_dl\"><dd><p>&nbsp;</p><span class=\"confirm_msg\" style='word-break: break-all'>您确定要退出此账号吗？</span><p>&nbsp;</p></dd><dt><a class=\"tuich_btn queding\" href=\"javascript:;\">确定</a><a class=\"guanbi guanbi2 tuich_btn2\" href=\"javascript:;\">取消</a></dt></dl></div>");
	}
	$("#zczy_confirm").zczy_window();
	var $loading = $("<img id='loadingimg' src='"+$(".rooturl").eq(0).val()+"/Public/common/zczy_images/loading.gif' />");
	$("body").append($loading);
	$loading.zczy_window();
})
function tishixinxi(msg, callback) {
	$("#alerttishiyu").html(msg);
	$("#alerttishiyu").zczy_window("open");
	setTimeout(function() {
		$("#alerttishiyu").zczy_window("close");
		if (callback) {
			callback.call();
		}
	}, 2000);
}
function loading(e){
	if(e=="close"){
		$("#loadingimg").zczy_window("close");
	}else{
		$("#loadingimg").zczy_window("open");
	}
}
function zczy_confirm(msg,callback,type) {
	$("#zczy_confirm .confirm_msg").html(msg);
	
	
	$("#zczy_confirm .queding").click(function(){
		$("#zczy_confirm").zczy_window("close");
		if(callback){
			callback.call();
		}
	});
	$("#zczy_confirm .guanbi").click(function(){
		$("#zczy_confirm").zczy_window("close");
	});
	
	if(!callback){
		$("#zczy_confirm .guanbi2").hide();
	}else{
		if(type){
			$("#zczy_confirm .guanbi2").hide();
		}else{
			$("#zczy_confirm .guanbi2").show()
			};
	}
	
	$("#zczy_confirm").zczy_window("open");
}
/**
 * 获取页面宽高度
 */
function getPageSize() {
	var xScroll, yScroll;
	if (window.innerHeight && window.scrollMaxY) {
		xScroll = document.body.scrollWidth;
		yScroll = window.innerHeight + window.scrollMaxY;
	} else if (document.body.scrollHeight > document.body.offsetHeight) {
		xScroll = document.body.scrollWidth;
		yScroll = document.body.scrollHeight;
	} else {
		xScroll = document.body.offsetWidth;
		yScroll = document.body.offsetHeight;
	}
	var windowWidth, windowHeight;
	if (self.innerHeight) {
		windowWidth = self.innerWidth;
		windowHeight = self.innerHeight;
	} else if (document.documentElement
			&& document.documentElement.clientHeight) {
		windowWidth = document.documentElement.clientWidth;
		windowHeight = document.documentElement.clientHeight;
	} else if (document.body) {
		windowWidth = document.body.clientWidth;
		windowHeight = document.body.clientHeight;
	}
	if (yScroll < windowHeight) {
		pageHeight = windowHeight;
	} else {
		pageHeight = yScroll;
	}
	if (xScroll < windowWidth) {
		pageWidth = windowWidth;
	} else {
		pageWidth = xScroll;
	}
	arrayPageSize = new Array(pageWidth, pageHeight, windowWidth, windowHeight,
			xScroll, yScroll)
	return arrayPageSize;
}
function addEvent(obj, evtType, func, cap) {
	cap = cap || false;
	if (obj.addEventListener) {
		obj.addEventListener(evtType, func, cap);
		return true;
	} else if (obj.attachEvent) {
		if (cap) {
			obj.setCapture();
			return true;
		} else {
			return obj.attachEvent("on" + evtType, func);
		}
	} else {
		return false;
	}
}
function getPageScroll() {
	var xScroll, yScroll;
	if (self.pageXOffset) {
		xScroll = self.pageXOffset;
	} else if (document.documentElement && document.documentElement.scrollLeft) {
		xScroll = document.documentElement.scrollLeft;
	} else if (document.body) {
		xScroll = document.body.scrollLeft;
	}
	if (self.pageYOffset) {
		yScroll = self.pageYOffset;
	} else if (document.documentElement && document.documentElement.scrollTop) {
		yScroll = document.documentElement.scrollTop;
	} else if (document.body) {
		yScroll = document.body.scrollTop;
	}
	arrayPageScroll = new Array(xScroll, yScroll);
	return arrayPageScroll;
}
(function($) {
	$.fn.extend({
		fileTypeJudge : function(str) {
			return this.each(function() {
				var rightFileType;
				var fileType;
				var pojo;
				if (str == "photo") {
					rightFileType = new Array("jpg", "bmp", "gif", "png","jpeg");
					pojo = "图片";
				} else if (str == "package") {
					rightFileType = new Array("jar", "six", "sisx", "apk","jad");
					pojo = "游戏包";
				} else {
					return;
				}
				var fileType = $(this).val().substring($(this).val().lastIndexOf(".") + 1);
				if (!in_array(fileType,rightFileType)) {
					this.outerHTML += '';   
				    this.value =""; 
				    alert("只支持" + pojo + "文件上传！");
				}
			})
		}
	})
})(jQuery)

function in_array(needle, haystack) {
    // 得到needle的类型
    var type = typeof needle;
    if(type == 'string' || type =='number') {
        for(var i in haystack) {
            if(haystack[i] == needle) {
                return true;
            }
        }
    }
    return false;
}