/**
 * 会员等级
 * 在页面中加入<input value="__ROOT__" class="rooturl" type="hidden"/>
 * 
 * 使用方法 
 * 	<div id="abc" jifen="100000"></div>
	$("#abc").zczy_hydj();
 */
(function($) {
	var zczy_hydj_sets = new Object();
	var zczy_hydj_imgs = [ "s_red_1.png", "s_blue_1.png", "s_crown_1.png",
			"s_cap_1.png" ];/*等级图标*/
	var zczy_hydj_dj=[4,11,41,91,151,251,501,1001,2001,5001,10001,20001,50001,100001,200001,500001,1000001,2000001,5000001,10000001];/*积分等级*/
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
				zczy_hydj_sets[uuid] = $this;
				var jifen = $this.attr("jifen");
				if(isNaN(jifen)){
					alert("信用度为非数字");
					return;
				}
				if(jifen<4){
					$this.append("0");
					return;
				}
				var jibie = 0;/*级别*/
				for(var i=0;i<zczy_hydj_dj.length-1;i++){
					if(zczy_hydj_dj[i]<=jifen&&jifen<zczy_hydj_dj[i+1]){
						jibie=i+1;
						break;
					}
				}
				if(jibie==0){
					jibie=20;
				}
				var imgindex=Math.floor(jibie/5);/*使用第几张图片（zczy_hydj_imgs下标）*/
				var imgnum=jibie%5;
				if(jibie%5==0){
					imgindex--;
					imgnum=5;
				}
				
				var img = zczy_hydj_imgs[imgindex];/*要使用的图标*/
				$this.html("");
				var rooturl = $(".rooturl").eq(0).val();
				if($(".rooturl").length>0){
					
				}else{
					alert("在页面中加入<input value=\"__ROOT__\" class=\"rooturl\" type=\"hidden\"/>  --来自pingjia");
					return;
				}
				for(var i=0;i<imgnum;i++){
					$this.append("<img src=\""+rooturl+"/Public/common/huiyuandengji/"+img+"\" />");
				}
				
			});
		}
	};

	$.fn.zczy_hydj = function() {
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
