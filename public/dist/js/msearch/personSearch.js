/**
 * Created by wujunshan on 04/05/2017.
 */
(function () {

    var noDataText = '<div class="mt10">无</div>';
    //获得数据
    loadAnimate();
    $.post('/msearch/getReportData.html',{sn:getQueryString('sn')},function(rs){
        closeAnimate();
        if (rs.code === 200) {
            render(rs.data);
            toPage('#report_box',rs.data.data.report_info);
        } else {
            layer.msg(rs.msg);
        }
    },'json');

    /**
     * 弹出加载动画
     * @param loadText 显示文字
     */
    function loadAnimate(loadText, withoutBG) {
        var loadDiv, shadeDiv;
        loadDiv = $('.load_box');
        shadeDiv = $(".shade");

        if (loadDiv.length <= 0) {
            loadDiv = $('<div class="load_box"><div class="load-animate"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div></div></div>');
            loadDiv.appendTo('body');
            var _content = $('.main_content .content');
            if (_content.length > 0) {
                _content = _content.eq(0);
                _content.find('*')
            }
        } else {

        }
        if(!withoutBG){
            if (shadeDiv.length <= 0) {
                shadeDiv = $('<div class="shade"></div>');
                shadeDiv.appendTo('body');
            }
        }
        loadText ? loadDiv.find('.load_text').text(loadText) : loadDiv.find('.load_text').text('正在提交，请稍候');
        loadDiv.show();
        shadeDiv.show();
    };

    closeAnimate = function () {
        $('.load_box').hide();
        $(".shade").hide();
    };

    /**
     * 渲染
     * @param data 数据
     */
    function render(data) {
        var _str = '', report = data.data.report_data;
        var box = $('#report_box');
        var _basic = data.data.report_info;
        var _temp = report.sfzyz;
        var statusText = '---';
        var address = '---';
        var imgurl = '/dist/img/defaultphoto.jpg';
        var title = '查询条件';
        if (!isEmpty(_temp)) {
            address = _temp.address;
            imgurl = _temp.photo_url;
            statusText = _temp.status == 1 ? '一致' : _temp.status == 2 ? '<span class="text-red">不一致</span>' : '无结果';
            title = '身份证实名认证';
        }
        _str = '<div class="result_title">' +
            '<span class="lead">'+title+'</span>' +
            '</div>' +
            '<table class="result_table chengji_table text-center">' +
            '<tr>' +
            '<td width="20%" rowspan="4">' +
            '<img src="' + imgurl + '" style="width:100%;">' +
            '</td>' +
            '<td class="bold" width="15%">姓名</td><td class="bold" width="30%">身份证号</td>' +
            '<td class="bold" width="15%">性别</td><td class="bold">年龄</td></tr>' +
            '<tr><td>' + _basic.name + '</td><td>' + _temp.card_no + '</td><td>' + _temp.sex + '</td><td>' +_temp.age + '</td></tr>' +
            '<tr><td class="bold">家庭地址</td><td colspan="3" class="text-left" style="padding-left: 20px;">' + address + '</td></tr>' +
            '<tr><td class="bold">认证结果</td><td colspan="3" class="text-left" style="padding-left:20px">' + statusText + '</td></tr>' +
            '</table>';
        box.append(_str);

        //担任法人
        var _temp = report.faren;
        if (!isEmpty(_temp)) {
            _str = '<div class="result_title">' +
                '<span class="lead">担任法人信息</span>' +
                '</div><table class="result_table"><tr><td class="bold text-center">企业(机构)名称</td><td class="bold text-center">企业(机构)类型</td><td class="bold text-center">企业状态</td><td class="bold text-center">注册资本</td></tr>' ;

            _temp.forEach(function(_temp){
                _str += '<tr><td class="text-center">'+ _temp.EntName +'</td><td class="text-center">'+ _temp.EntType +'</td><td class="text-center">'+ _temp.EntStatus +'</td><td class="text-center">'+ _temp.RegCap + _temp.RegCapCur +'</td></tr>';
            });
            _str += '</table>';
        }else{
            _str = '<div class="result_title">' +
                '<span class="lead">担任法人信息</span>' +
                '</div>' ;
            _str += '<span class="no_data_text text-orange">暂无担任法人信息,仅供客户参考。</span>';
        }
        box.append(_str);


        //个人对外投资信息
        var _temp = report.dwtz;
        if (!isEmpty(_temp)) {
            _str = '<div class="result_title">' +
                '<span class="lead">对外投资信息</span>' +
                '</div><table class="result_table"><tr><td class="bold text-center">企业(机构)名称</td><td>注册号</td><td class="bold text-center">企业(机构)类型</td><td class="bold text-center">企业状态</td><td class="bold text-center">注册资本</td><td>出资比例</td><td>认缴出资额</td></tr>' ;

            _temp.forEach(function(_temp){
                _str += '<tr><td class="text-center">'+ _temp.EntName +'</td><td>'+_temp.RegNo+'</td><td class="text-center">'+ _temp.EntType +'</td><td class="text-center">'+ _temp.EntStatus +'</td><td class="text-center">'+ _temp.RegCap + _temp.RegCapCur +'</td><td>'+ _temp.FundedRatio +'</td><td>'+_temp.SubConAmt + _temp.Currency +'</td></tr>';
            });

            _str += '</table>';
        }else{
            _str = '<div class="result_title">' +
                '<span class="lead">对外投资信息</span>' +
                '</div>' ;
            _str += '<span class="no_data_text text-orange">暂无个人对外投资信息,仅供客户参考。</span>';
        }
        box.append(_str);

        //在外任职信息
        var _temp = report.zwrz;
        if (!isEmpty(_temp)) {
            _str = '<div class="result_title">' +
                '<span class="lead">在外任职信息</span>' +
                '</div><table class="result_table"><tr><td class="bold text-center">企业(机构)名称</td><td class="bold text-center">企业(机构)类型</td><td class="bold text-center">企业状态</td><td class="bold text-center">职位</td></tr>' ;

            _temp.forEach(function(_temp){
                _str += '<tr><td class="text-center">'+ _temp.EntName +'</td><td class="text-center">'+ _temp.EntType +'</td><td class="text-center">'+ _temp.EntStatus +'</td><td class="text-center">'+ _temp.Position +'</td></tr>';
            });
            _str += '</table>';
        }else{
            _str = '<div class="result_title">' +
                '<span class="lead">在外任职信息</span>' +
                '</div>' ;
            _str += '<span class="no_data_text text-orange">暂无在外任职信息信息,仅供客户参考。</span>';
        }
        box.append(_str);

        //底部
        _str = '<div class="all_footer">' +
            '<div class="footer_title">报告使用说明：</div>' +
            '<div class="footer_con">1. 本报告著作权属于看法有限公司，未经书面许可，不得复制、摘录、转载和发表。<br>' +
            '2. 本报告仅供使用者参考，看法有限公司不承担据此报告产生的任何法律责任。<br>' +
            '3. 看法有限公司客服热线：400-003-1933</div>' +
            '</div>';
        box.append(_str);

    }

})(jQuery);
