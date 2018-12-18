$(function(){
	var b = $.browser;
	/*b.msie && b.version < 10*/
	if (true) {
			$("*[tishiyu]").each(function() {
				var 	$this = $(this);
				if($this.attr("type")=="password"){
					$this.css("display","none");
					$this.after("<input type1=\"password\" class=\""+$this.attr("class")+"\" value=\""+$this.attr("tishiyu")+"\"/>");
					$this.next().focus(function(){
						$(this).css("display","none");
						$this.css("display","");
						$this.focus();
					});
				}else{
					if($this.val()==""){
						$this.attr("value", $this.attr("tishiyu"));
					}
				}
				
				$this.focus(function(){
					
					if($this.attr("type1")=="password"){
						$this.show();
						$this.next().hide();
						return;
					}
					
					if($this.val()==$this.attr("tishiyu")){
						$this.val("");
					}
				});
				$this.blur(function(){
					if($this.val()==""){
						if($this.attr("type")=="password"){
							$this.hide();
							$this.next().show();
						}else{
							$this.attr("value", $this.attr("tishiyu"));
						}
					}
				});
			});
	}else{
		$("*[tishiyu]").each(function(){
			$(this).attr("placeholder",$(this).attr("tishiyu"));
			
		});
		
	}
	
});

