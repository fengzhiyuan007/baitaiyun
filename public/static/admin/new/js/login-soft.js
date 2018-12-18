var Login = function () {
	function alert_modal(titletxt,bodyinfo,footerbtn){
		bootbox.alert(bodyinfo);
	}
	

	
	var handleLogin = function() {
		$('.login-forms').validate({
	            errorElement: 'span', //default input error message container
	            errorClass: 'help-block', // default input error message class
	            focusInvalid: false, // do not focus the last invalid input
	            rules: {
	                username: {
	                    required: true
	                },
	                remember: {
	                    required: false
	                }
	            },

	            messages: {
	                username: {
	                    required: "帐号卡密不能为空."
	                }
	            },

	           

	            
	            
	        });

	        
	}

	var handleForgetPassword = function () {
		$('.forget-form').validate({
	            errorElement: 'span', //default input error message container
	            errorClass: 'help-block', // default input error message class
	            focusInvalid: false, // do not focus the last invalid input
	            ignore: "",
	            rules: {
	                email: {
	                    required: true,
	                    email: true
	                }
	            },

	            messages: {
	                email: {
	                    required: "邮箱必须填写."
	                }
	            },

	            invalidHandler: function (event, validator) { //display error alert on form submit   

	            },

	            highlight: function (element) { // hightlight error inputs
	                $(element)
	                    .closest('.form-group').addClass('has-error'); // set error class to the control group
	            },

	            success: function (label) {
	                label.closest('.form-group').removeClass('has-error');
	                label.remove();
	            },

	            errorPlacement: function (error, element) {
	                error.insertAfter(element.closest('.input-icon'));
	            },

	            submitHandler: function (form) {
					$.post($('.forget-form').attr('action'), $('.forget-form').serialize(),function (data){
						if(!data.status){
							alert_modal('找回密码提示',data.info,'关闭提示');
						} else {
							location.href = data.url;
						}
					},'json');
					return false;
	            }
	        });

	        $('.forget-form input').keypress(function (e) {
	            if (e.which == 13) {
	                if ($('.forget-form').validate().form()) {
						$.post($('.forget-form').attr('action'), $('.forget-form').serialize(),function (data){
							if(!data.status){
								alert_modal('找回密码提示',data.info,'关闭提示');
							} else {
								location.href = data.url;
							}
						},'json');
						return false;
	                }
	                return false;
	            }
	        });

	        jQuery('#forget-password').click(function () {
	            jQuery('.login-form').hide();
	            jQuery('.forget-form').show();
	        });

	        jQuery('#back-btn').click(function () {
	            jQuery('.login-form').show();
	            jQuery('.forget-form').hide();
	        });

	}

	var handleRegister = function () {
         $('.register-form').validate({
	            errorElement: 'span', //default input error message container
	            errorClass: 'help-block', // default input error message class
	            focusInvalid: false, // do not focus the last invalid input
	            ignore: "",
	            rules: {
	                email: {
	                    required: true,
	                    email: true
	                },
	                username: {
	                    required: true
	                },
	                password: {
	                    required: true
	                },
	                repassword: {
	                    required: true,
	                    equalTo: "#register_password"
	                },
	                tnc: {
	                    required: true
	                }
	            },

	            messages: { // custom messages for radio buttons and checkboxes
	                username: {
	                    required: "帐号不能为空."
	                },
	                password: {
	                    required: "密码不能为空."
	                },
					repassword: {
						required: "密码不能为空.",
	                    equalTo: "两次密码不一样."
	                },
	                email: {
	                    required: "邮箱不能为空.",
	                    email: "邮箱格式不正确."
	                },
	                tnc: {
	                    required: "您需要同意服务条款和隐私政策."
	                }
	            },

	            invalidHandler: function (event, validator) { //display error alert on form submit   

	            },

	            highlight: function (element) { // hightlight error inputs
	                $(element)
	                    .closest('.form-group').addClass('has-error'); // set error class to the control group
	            },

	            success: function (label) {
	                label.closest('.form-group').removeClass('has-error');
	                label.remove();
	            },

	            errorPlacement: function (error, element) {
	                if (element.attr("name") == "tnc") { // insert checkbox errors after the container                  
	                    error.insertAfter($('#register_tnc_error'));
	                } else if (element.closest('.input-icon').size() === 1) {
	                    error.insertAfter(element.closest('.input-icon'));
	                } else {
	                	error.insertAfter(element);
	                }
	            },

	            submitHandler: function (form) {
					$.post($('.register-form').attr('action'), $('.register-form').serialize(),function (data){
						if(!data.status){
							alert_modal('创建帐号提示',data.info,'关闭提示');
						} else {
							alert_modal('创建帐号提示',data.info+'<br/>2秒后将跳转到登录页','关闭提示');
							setTimeout("location.href = '"+data.url+"'",3000);
						}
					},'json');
					return false;
	            }
	        });

			$('.register-form input').keypress(function (e) {
	            if (e.which == 13) {
	                if ($('.register-form').validate().form()) {
							$.post($('.register-form').attr('action'), $('.register-form').serialize(),function (data){
								if(!data.status){
									alert_modal('创建帐号提示',data.info,'关闭提示');
								} else {
									alert_modal('创建帐号提示',data.info+'<br/>2秒后将跳转到登录页','关闭提示');
									setTimeout("location.href = '"+data.url+"'",3000);
								}
							},'json');
							return false;
	                }
	                return false;
	            }
	        });

	        jQuery('#register-btn').click(function () {
	            jQuery('.login-form').hide();
	            jQuery('.register-form').show();
	        });

	        jQuery('#register-back-btn').click(function () {
	            jQuery('.login-form').show();
	            jQuery('.register-form').hide();
	        });
	}
    
    return {
        //main function to initiate the module
        init: function () {
            handleLogin();
            handleForgetPassword();
            handleRegister();
        }

    };

}();