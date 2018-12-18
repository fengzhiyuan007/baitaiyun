


$(function(){
    var global_order = {'order_no': '', 'idnumber':'', 'pay_status': false};
    var checkIntervalId;   // 查询任务
    var refreshIntervalId; // 订单付款

    var page_num = 6;
    var fengxian_data = Array();     // 风险查询获取的数据
    var fengxian_main_data = Array();


    // 身份证号码验证
    function checkID(ID) {
        if(typeof ID !== 'string') return '非法字符串';
        var city = {11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江 ",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北 ",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏 ",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外"};
        var birthday = ID.substr(6, 4) + '/' + Number(ID.substr(10, 2)) + '/' + Number(ID.substr(12, 2));
        var d = new Date(birthday);
        var newBirthday = d.getFullYear() + '/' + Number(d.getMonth() + 1) + '/' + Number(d.getDate());
        var currentTime = new Date().getTime();
        var time = d.getTime();
        var arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        var arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
        var sum = 0, i, residue;
      
        if(!/^\d{17}(\d|x)$/i.test(ID)) return '非法身份证';
        if(city[ID.substr(0,2)] === undefined) return "非法地区";
        if(time >= currentTime || birthday !== newBirthday) return '非法生日';
        for(i=0; i<17; i++) {
          sum += ID.substr(i, 1) * arrInt[i];
        }
        residue = arrCh[sum % 11];
        if (residue !== ID.substr(17, 1)) return '非法身份证哦';
      
        return 'success';
      }


    // 付款完成
    $('#myModal-7').on('hide.bs.modal', function (e) {
        if(true == global_order['pay_status']){ 
            checkIntervalId = setInterval( function() { checkNumberStatus(); }, 1000 );
        }
    });

    function checkNumberStatus(){
        $.get('/fengxian/checkOrder', {order_no: global_order['order_no'], type: 'search'}, function(rsp){
            if(rsp['data']){
                global_order['idnumber'] = rsp['data'];
                clearInterval(checkIntervalId);
                getSearchData();
            }
        });
    }

    // 导航切换处理
    $("#enterprise").click(function(){
       $("#name").val('');
       $("#id_card").val('');
    })
    $("#personal").click(function(){
       $("#company_name").val('');
    })

    // 创建订单
    $(".main .btn2 i").click(function() {
        
        var name = $("#name").val();
        var id_card = $("#id_card").val();
        var company_name = $("#company_name").val();
        var btype = $('#myTab .active a').attr('id');


        if('personal' == btype && name.length < 2){
            layer.msg("请输入要查询姓名");
             return false;
        }

        if('enterprise' == btype && company_name.length < 6){
            layer.msg("请输入正确的企业名称");
             return false;
        }
        if (name) {
            if('success' !=checkID(id_card)){
                layer.msg("请输入正确的身份证号");
                return false;
            }
          
        };
        data = {
            'name': name,
            'id_card': id_card,
            'company_name': company_name,
        };

        if(data.name.length == 0 ){
            message = "“ " +company_name+ " ”" + "和关联公司的风险信息";
        }else{
            message = "“ " +data.name + "（"+ data.id_card+ "）" + " ”"+ "个人和关联公司的风险信息";
        }
        message += "<br />支付完成后，查看结果 <br />支付查询费：￥9.80";
        $('.task-dl2 > p').html(message);
        $.post('fengxian/add_order', data, function(datas){

            if(200 == datas['code'] ){
                $("#qr_code").empty();
                $("#qr_code").html("<img src=data:image/svg+xml;base64," + datas['data']['1']+" />");
                $("#myModal-7").modal('show');
                
                refreshIntervalId = setInterval( function() { checkOrderStatus(datas['data']['0']); }, 1000 );
            }
        });
    });

    // 检查订单状态
    
    function checkOrderStatus(order_id){
        $.get('/fengxian/checkOrder', {order_no: order_id}, function(rsp){
            if(1 == rsp['data']){
                global_order['order_no'] = order_id;
                global_order['pay_status'] = true;

                clearInterval(refreshIntervalId);
                $('.er-wem p:last').html('<p>付款已经成功</p>');
                
                setTimeout(function(){
                    $("#myModal-7").modal('hide');
                }, 5000);
            }

        });
    }

    // 文书类型 中文名称转化
    function category_cn(name){
        var cn_name = '';
        switch(name)
        {
            case 'cpws':
              cn_name = '裁判文书';
              break;
            case 'ktgg':
              cn_name = '开庭公告';
              break;
            case 'fygg':
              cn_name = '法院公告';
              break;
            case 'splc':
              cn_name = '审判流程';
              break;
            case 'zhixing':
              cn_name = '执行信息';
              break;
            case 'shixin':
              cn_name = '失信信息';
              break;
        }
        return cn_name;
    }
    // 内容格式化

    function format_content(record){
        switch(record.category){
            case 'splc':
                content = JSON.parse(record.content);
                a = "<span>案号: " + content.caseCode + "</span>";
                a += "<span>法院: " + content.courtName + "</span>";
                a += "<span>日期: " + content.openTime + "</span>";
                a += "<span>状态: " + content.caseStat + "</span>";
                break;
            case 'zhixing', 'shixin':
                content = JSON.parse(record.content);
                a = "<span>案号: " + content.caseCode + "</span>";
                a += "<span>法院: " + content.courtName + "</span>";
                a += "<span>日期: " + content.regDate + "</span>";
                break;
            case 'cpws':
                content = JSON.parse(record.content);
                a = "<span>案号: " + content.case_num + "</span>";
                a += "<span>标题: " + content.case_name + "</span>";
                a += "<span>日期: " + content.judge_date + "</span>";
                break;

            default:
                a =  "<span>"+ record.content + "</span>";

        }
        return a;
    }


    // 菜单事件

    // - 子项选择
    $('.fengxian-main dd, .fengxian-relation dd').click(function(){
        $('.qy-right-con2 li').hide();
        parent_class_name = $(this).parent().attr('class');
        if(parent_class_name.match(/main/)){
            target_class_name = "li.fengxian-main." + $(this).attr('class');
        }else{
            target_class_name = "li.fengxian-relation." + $(this).attr('class');
        }
        
        $(target_class_name).show();
    });

    // - 显示全部
    $('.qy-con-left h4').click(function(){
        $('.qy-right-con2 li').show();
    })



    // 获取订单查询详情
    function getSearchData(){
        var total_main      = 0;
        var total_relation  = 0;
        domLoading('.qy-right-con2');
        
        
        $.get(feng_xian_api+global_order['idnumber'], function(rsp){
            // 清理上次数据
            $('ul.qy-right-con2').html('');
            $('.fengxian-main  dd, .fengxian-main dt, .fengxian-relation dd, .fengxian-relation dt, .qy-con-left > h4').each(function(){
              $(this).html($(this).html().replace(/\d+/, 0))
            })

            domHideLoading('.qy-right-con2');


            // 个人数据填充
            $.each(rsp.records,function(i,n){
                total_main += n.length;
                $('.fengxian-main  dd.'+i).html($('.fengxian-main dd.'+i).html().replace('0',n.length));
                $.each(n, function(i,record){
                    class_name = "fengxian-main " + record.category;
                    content = "<li class='"+class_name+"'><h4>"+rsp.name+ " - " + category_cn(record.category) + "</h4>";
                    content += "<p>"+ format_content(record) +"</p></li>";
                    // $('ul.qy-right-con2').append(content);
                    fengxian_data.push(content);
                })
            });

            // 关联企业数据填充
            $.each(rsp.companies,function(i,n){  
                var name = n.name;             
                $.each(n.records, function(i,n){
                    total_relation += n.length;
                    var current_count = $('.fengxian-relation dd.'+i).html().match(/\d+/)[0]-0 + n.length;
                    $('.fengxian-relation  dd.'+i).html($('.fengxian-main dd.'+i).html().replace(/\d+/, current_count));
                    
                    $.each(n, function(i,record){
                        class_name = "fengxian-relation " + record.category;
                        content = "<li class='"+class_name+"'><h4>"+name+ " - " + category_cn(record.category) + "</h4>";
                        content += "<p>"+ record.content + "</p><li>";

                        // $('ul.qy-right-con2').append(content);
                         fengxian_data.push(content);
                    })
                })
            });


            $('.qy-con-left > h4').html( 
                $('.qy-con-left > h4').html().replace('0', total_main+total_relation)
            );

            $('.fengxian-main dt').html(
                $('.fengxian-main dt').html().replace('0', total_main)
            );

            $('.fengxian-relation dt').html(
                $('.fengxian-relation dt').html().replace('0', total_relation)
            );


            
            page(fengxian_data);
            $('ul.qy-right-con2').html(fengxian_data.slice(0, page_num));

        });
    }


    function page(data){
        var data = fengxian_data;
        $('.pagination').pagination({
            items: fengxian_data.length,
            itemsOnPage: page_num,
            onPageClick: function(page){
                start = (page-1)*page_num;
                end = start+page_num;
                $('ul.qy-right-con2').html(data.slice(start, end));
            }
        });
    }




})