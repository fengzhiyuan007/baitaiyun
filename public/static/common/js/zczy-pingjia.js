/**
 * 会员等级
 * 在页面中加入<input value="__ROOT__" class="rooturl" type="hidden"/>
 * 
 * 使用方法 
 * 	<div id="abc" name="name" pingjia="1" all="4"></div>
	$("#abc").zczy_pj();
 */
(function($) {
	var zczy_pj_sets = new Object();
	var zczy_pj_imgs = [ "xing_hui.png", "xing_huang.png"];/*等级图标*/
	var methods = {
		init : function(options, picjsonarray) {
			return this.each(function() {
				var $this = $(this);
				var zczy_id = $this.attr("zczy_id");
				if (zczy_id) {
					return;
				}
				var uuid = getuuid();
				$this.attr("zczy_id", uuid);
				zczy_pj_sets[uuid] = $this;
				var pingjia = $this.attr("pingjia");/*分数，默认为0*/
				if(isNaN(pingjia)){
					pingjia=0;
				}else{
					pingjia = pingjia/1;	
				}
				var name = $this.attr("name");/*分数，默认为0*/
				$this.append("<input type=\"hidden\" value=\""+pingjia+"\" name=\""+name+"\"/>");
				var all = $this.attr("all");/*总分数，默认为5*/
				if(isNaN(all)){
					 $this.attr("all","5")
				}
				methods.fresh.apply($this);
			});
			
		},
		fresh : function(options, picjsonarray) {
			return this.each(function() {
				var $this = $(this);
				var zczy_id = $this.attr("zczy_id");
				if (!zczy_id) {
					return;
				}
				
				var input = $this.find("input").eq(0);
				var pingjia = input.val()/1;
				var all = $this.attr("all")/1;
				
				
				
				var rooturl = $(".rooturl").eq(0).val();
				if($(".rooturl").length>0){
					
				}else{
					alert("在页面中加入<input value=\"__ROOT__\" class=\"rooturl\" type=\"hidden\"/>  --来自pingjia");
					return;
				}
				
				$this.find("img").remove();
				var index = 1;
				for(var i=0;i<pingjia;i++){
					$this.append("<img index=\""+index+++"\" src=\""+rooturl+"/Public/common/zczy_images/xing_huang.png\" />");
				}
				for(var i=0;i<all-pingjia;i++){
					$this.append("<img index=\""+index+++"\" src=\""+rooturl+"/Public/common/zczy_images/xing_hui.png\" />");	
				}
			
				$this.find("img").click(function(){
					$this.find("input").val($(this).attr("index"));
					methods.fresh.apply($this);
				});
			});
			}
	};

	$.fn.zczy_pj = function() {
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
