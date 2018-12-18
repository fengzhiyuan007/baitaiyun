$(function(){
    //$('#starttime,#endtime').datetimepicker({
    //    format: "yyyy-mm-dd hh:ii", //选择日期后，文本框显示的日期格式
    //    language: 'zh-CN', //汉化
    //    autoclose:true //选择日期后自动关闭
    //});
    
    
    
    var content;
    KindEditor
        .ready(function(K) {
            content = K
                .create('#content',{
                    allowFileManager : true,
                    uploadJson : "/assets/js/kindeditor/php/upload_json.php?dirname=product",
                });
        });
    KindEditor
        .ready(function(K) {
            K.create();
            var editor = K.editor({
                allowFileManager : true,
                uploadJson : "/assets/js/kindeditor/php/upload_json.php?dirname=product"
                //sdl:false
            });
            K('.uparea').click(
                function() {
                    val=$(this).attr("values");
                    editor.loadPlugin('image', function() {
                        editor.plugin.imageDialog({
                            imageUrl : K('#image_'+val).val(),
                            clickFn : function(url, title, width, height, border, align) {
                                $('#image'+val).css('background-image', 'url(' + url + ')');
                                if(val != 'ei') $('#image'+val).css('background-size', '220px 160px');

                                var old_rul = K('#image_'+val).val();
                                if(old_rul)
                                    $.post($("#d_img_url").attr('url'), {url:old_rul}, function(){});

                                K('#image_'+val).val(url);

                                editor.hideDialog();
                            }
                        });
                    });
                });
        });

    $(".btn_delMember").click(function(){
        var mobile = $(this).attr("dit-params");
        if(mobile==null){
        if(!confirm("确定要删除\n么？")){
            return false;
        }}
        else{
        if(!confirm("确定要\n" + mobile + "么？")){
            return false;
        }}
        var url = $(this).attr("dit-action");
        $.get(url,function(data){
            console.log(data);
            if(data.code == '200'){
                if(data.redirect!=undefined){
                    window.location.href=data.redirect;
                }else
                window.location.href = window.location.href;
            } else {
                alert(data.msg);
            }
        },'json');
    });

        //左侧下拉
        $(".upside").click(function(){
            console.log("aaa");
            value=$(this).attr("values");
            console.log(value);
            $("#con"+value).removeAttr("hidden");
            $("#up"+value).attr("hidden",true);
        });
        $(".downside").click(function(){
            value=$(this).attr("values");
            console.log(value);
            $("#up"+value).removeAttr("hidden");
            $("#con"+value).attr("hidden",true);
        });

    $(".pic-manager").click(function(){
		var url = $(this).attr("tx-action");
		popWin.showWin(800, 600, '图片管理', url);
	});
	
	// 返回按钮
	$("#backward").click(function(){
		history.go(-1);
	});
	
	$("form.ajax-form").submit(function(){
		var obj = $(this);
		var url = obj.attr('dit-action');
		$.post(url,obj.serialize(),function(data){
            console.log(data);
			if(data.redirect!= undefined){
				window.location.href = data.redirect;
			}else if(data.code==200)
            {
                window.location.href =  window.location.href;
            }else{
				obj.find('.form-tip').html(data.msg);
			}
		},'json');
		return false;
	});
	
	$(".advance-form").submit(function(){
		var end_time = (new Date($("#create_time_end").val())).valueOf();
		var start_time = (new Date($("#create_time_start").val())).valueOf();
		if(start_time > end_time){
			alert("结束时间需大于开始时间");
			return false;
		}
	});
	
	$(".tx-push").click(function(){
		var url = window.location.href;
		if(url.indexOf('doPush') < 0) {
			url += '&doPush=yes';
		}
		$(this).attr('href', url);
	});
	
	$(".delImage").click(function(){
		if(!confirm('确定要删除此图片么?')){
			return false;
		}
		var url = $(this).attr('dit-action');
		$.get(url,function(data){
			if(data.code == '200'){
				if(data.redirect != undefined){
					window.location.href = data.redirect;
				} else {
					window.location.href = window.location.href;
				}
			} else {
				alert(data.msg);
			}
		},'json');
	});

    $('.check_auth').click(function(){
        var url = $(this).attr('data-action');
        $.get(url+'&check=1',function(data){
            if(data['status'] == 'cannot'){
                popup.error(data.info);
                setTimeout(function(){
                    popup.close("asyncbox_error");
                },2000);
            }else{
                window.location.href = url;
            }
        },'json');
        return false;
    })

    $(".del").click(function(){
        var delLink=$(this).attr("link");
        if(confirm('你真的打算删除【'+$(this).attr("name")+'】的这条记录吗?','温馨提示')){

        };
        return false;
    });

    $(".check_lock").click(function(){
        var id = $(this).attr('data');
        var url = $(this).attr('data-action');
        $.post(url,{id:id},function(data){
            console.log(data);
            if(data.status == 'cannot'){
                alert(data.info);
            }else{
                window.location.href = url;
            }
        },'json');
    });
});

// 加法函数  
function accAdd(arg1, arg2) {  
    var r1, r2, m;  
    try {  
        r1 = arg1.toString().split(".")[1].length;  
    }  
    catch (e) {  
        r1 = 0;  
    }  
    try {  
        r2 = arg2.toString().split(".")[1].length;  
    }  
    catch (e) {  
        r2 = 0;  
    }  
    m = Math.pow(10, Math.max(r1, r2));  
    return (arg1 * m + arg2 * m) / m;  
}

//给Number类型增加一个add方法，，使用时直接用 .add 即可完成计算。   
Number.prototype.add = function (arg) {  
    return accAdd(arg, this);  
};

//减法函数  
function Subtr(arg1, arg2) {  
    var r1, r2, m, n;  
    try {  
        r1 = arg1.toString().split(".")[1].length;  
    }  
    catch (e) {  
        r1 = 0;  
    }  
    try {  
        r2 = arg2.toString().split(".")[1].length;  
    }  
    catch (e) {  
        r2 = 0;  
    }  
    m = Math.pow(10, Math.max(r1, r2));  
     //last modify by deeka  
     //动态控制精度长度  
    n = (r1 >= r2) ? r1 : r2;  
    return ((arg1 * m - arg2 * m) / m).toFixed(n);  
}

//给Number类型增加一个add方法，，使用时直接用 .sub 即可完成计算。   
Number.prototype.sub = function (arg) {  
    return Subtr(this, arg);  
};  

//乘法函数  
function accMul(arg1, arg2) {  
    var m = 0, s1 = arg1.toString(), s2 = arg2.toString();  
    try {  
        m += s1.split(".")[1].length;  
    }  
    catch (e) {  
    }  
    try {  
        m += s2.split(".")[1].length;  
    }  
    catch (e) {  
    }  
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);  
}   
//给Number类型增加一个mul方法，使用时直接用 .mul 即可完成计算。   
Number.prototype.mul = function (arg) {  
    return accMul(arg, this);  
};   
  
//除法函数  
function accDiv(arg1, arg2) {  
    var t1 = 0, t2 = 0, r1, r2;  
    try {  
        t1 = arg1.toString().split(".")[1].length;  
    }  
    catch (e) {  
    }  
    try {  
        t2 = arg2.toString().split(".")[1].length;  
    }  
    catch (e) {  
    }  
    with (Math) {  
        r1 = Number(arg1.toString().replace(".", ""));  
        r2 = Number(arg2.toString().replace(".", ""));  
        return (r1 / r2) * pow(10, t2 - t1);  
    }  
}   
//给Number类型增加一个div方法，，使用时直接用 .div 即可完成计算。   
Number.prototype.div = function (arg) {  
    return accDiv(this, arg);  
};

Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

function updateCoords(c)
{
    $('#x').val(c.x);
    $('#y').val(c.y);
    $('#w').val(c.w);
    $('#h').val(c.h);
};

function checkCoords()
{
    if (parseInt($('#w').val())) return true;
    alert('Please select a crop region then press submit.');
    return false;
};

function del_image(num){
    var img = $('#image_'+num).val();
    if(img.length !=0) {
        //if (confirm('是否要删除该图片?\n删除该图片将会连服务器的图片一起删除')) {
        //    $.post('/system.php/tools/del_img', {url: img}, function (data) {
        //        if (data['status'] == 'ok') {
        //            console.log(data);
        //            $('#image' + num).css('background-image', '');
        //            $('#image_' + num).val('');
        //        }
        //    }, 'json');
        if (confirm('是否要删除该图片?')) {
            $('#image' + num).css('background-image', '');
            $('#image_' + num).val('');

        };
        return false;
    } else {
        return false;
    }
}

/**
 * 通用AJAX提交
 * @param  {string} url    表单提交地址
 * @param  {string} formObj    待提交的表单对象或ID
 */
function commonAjaxSubmit(url,formObj){
    if(!formObj||formObj==''){
        var formObj="form";
    }
    console.log(formObj);
    if(!url||url==''){
        var url=document.URL;
    }
    console.log(url);
    $(formObj).ajaxSubmit({
        url:url,
        type:"POST",
        dataType:"JSON",
        success:function(data, st) {
            console.log(data);
            //                var data = eval("(" + data + ")");
            if(data.status=='ok'){
                popup.success(data.info);
                setTimeout(function(){
                    popup.close("asyncbox_success");
                },2000);
            }else{
                popup.error(data.info);
                setTimeout(function(){
                    popup.close("asyncbox_error");
                },2000);
            }
            // return ;
            if(data.url&&data.url!=''){
                setTimeout(function(){
                    top.window.location.href=data.url;
                },2000);
            }
            if(data.url==''){
                setTimeout(function(){
                    top.window.location.reload();
                },1000);
            }
            if(data.info == '验证码错误啦，再输入吧'){
                setTimeout(function(){
                    $('#verify_code').val('');
                    console.log(1);
                    $('#verify').prop('src','/index.php/conist/public/verify_code'+'?rand='+Math.random());
                },1000);
            }
        },
        error:function(data){
            console.log(data);
        }
    });
    return false;
}


