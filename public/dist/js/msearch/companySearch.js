(function ($) {

    var sn = getQueryString('sn');
    //var noDataText = '<span>无</span>';
    var companHead = $('.company_head_info');

    //获得数据
    loadAnimate();
    $.post('/msearch/getReportData.html',{sn:getQueryString('sn')},function(rs){
        closeAnimate();
        if (rs.code === 200) {
            render(rs.data);
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
        var _str = '', report = data.data;
        var box = $('.report_box .company_search_content');
        //var _basic = report.base_info;
        var _temp = null;
        //window.report_time = report.report_info.report_date;
        //window.report_no = report.report_info.report_sn;
        box.append(getComBasicHtml(report));
        box.append(getComInvestHtml(report));
        box.append(getComHolder(report));
        box.append(getComLawsuit(report));
        box.append(getComBiz(report));
        box.append(getComYearReport(report));
        box.append(getComLore(report));
        //底部
        _str = '<div class="all_footer">' +
            '<div class="footer_title">报告使用说明：</div>' +
            '<div class="footer_con">1. 本报告著作权属于看法有限公司，未经书面许可，不得复制、摘录、转载和发表。<br>' +
            '2. 本报告仅供使用者参考，看法有限公司不承担据此报告产生的任何法律责任。<br>' +
            '3. 看法有限公司客服热线：400-003-1933</div>' +
            '</div>';
        box.append(_str);
        toPage('.report_box .company_search_content', report.report_info);
    }


    /**
     * 企业基本信息
     * @param data
     */
    function getComBasicHtml(data) {
        var _str = '', _temp = null, report = data.report_data;


        if (argsSome(report.contact, report.detail, report.change_list, report.com_manage, report.com_holder)) {
            _str += '<h1>企业基本信息</h1>';
        }
        //工商基本信息
        _temp = report.detail;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="detail"]').addClass('text-blue').attr('href','#detail');
            _str += '<div class="result_title" id="detail">' +
                '<span class="lead">基本工商信息</span>' +
                '</div>';
            _temp = replaceObj(_temp);
            _str += '<table class="result_table">' +
                '<tr>' +
                '<td style="width:18%" class="bold">企业名称</td>' +
                '<td colspan="3">' + _temp.name + '</td>' +
                '</tr>' +
                '<tr>' +
                '<td style="width:18%" class="bold">工商注册号：</td>' +
                '<td style="width:42%">' + _temp.reg_no + '</td>' +
                '<td style="width:18%" class="bold">社会信用代码：</td>' +
                '<td style="width:22%">' + _temp.credit_no + '</td>' +
                '</tr>' +
                '<tr>' +
                '<td class="bold">法定代表人：</td>' +
                '<td>' + _temp.oper_name + '</td>' +
                '<td class="bold">组织机构代码：</td>' +
                '<td>' + _temp.org_no + '</td>' +
                '</tr>' +
                '<tr>' +
                '<td class="bold">企业类型：</td>' +
                '<td>' + _temp.econ_kind + '</td>' +
                '<td class="bold">成立日期：</td>' +
                '<td>' + _temp.term_start + '</td>' +
                '</tr>' +
                '<tr>' +
                '<td class="bold">注册资本：</td>' +
                '<td>' + _temp.regist_capi + ' 万元</td>' +
                '<td class="bold">经营状态：</td>' +
                '<td>' + _temp.status + '</td>' +
                '</tr>' +
                '<tr>' +
                '<td class="bold">注册地址：</td>' +
                '<td colspan="3">' + _temp.address + '</td>' +
                '</tr>' +
                '<tr>' +
                '<td class="bold">营业期限：</td>' +
                '<td colspan="3"><span class="bold">自</span>　' + _temp.term_start + '　<span class="bold">至</span>　' + _temp.term_end + '</td>' +
                '</tr>' +
                '<tr>' +
                '<td class="bold">营业范围：</td>' +
                '<td colspan="3">' + _temp.scope +
                '</td>' +
                '</tr>' +
                '<tr>' +
                '<td class="bold">登记机关：</td>' +
                '<td>' + _temp.belong_org + '</td>' +
                '<td class="bold">发照日期：</td>' +
                '<td>' + _temp.check_date + '</td>' +
                '</tr>' +
                '</table>';
        }

        //获取企业联系信息
        _temp = report.contact;
        if (!isEmpty(_temp)) {
            _temp = replaceObj(_temp);
            companHead.find('[data-href="contact"]').addClass('text-blue').attr('href','#contact');
            _str += '<div class="result_title" id="contact">' +
                '<span class="lead">联系方式</span>' +
                '</div>';
            var header = [{
                title: '联系电话',
                name: 'Tel',
                width: '20%'
            }, {
                title: '邮箱',
                name: 'Email',
                width: '30%'
            }, {
                title: '公司地址',
                name: 'Address',
                width: '50%'
            }];
            _str += renderList(header, _temp, '<span class="no_data_text text-orange">暂无企业联系信息,不排除存在时间相对滞后或工商未公示的情况,仅供客户参考。</span>');
        }


        //企业信息变更记录
        _temp = report.change_list;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="change_list"]').addClass('text-blue').attr('href','#change_list');
            _str += '<div class="result_title" id="change_list">' +
                '<span class="lead">工商变更记录</span>' +
                '</div>';
            var header = [{
                title: '变更事项',
                name: 'AlterItem',
                width: '20%'
            }, {
                title: '变更前内容',
                name: 'AltBe',
                width: '30%'
            }, {
                title: '变更后内容',
                name: 'AltAf',
                width: '30%'
            }, {
                title: '日期',
                name: 'AltDate',
                type:'date',
                width: '15%'
            }];
            _str += renderList(header, _temp, '<span class="no_data_text text-orange">暂无工商变更记录,不排除存在时间相对滞后或工商未公示的情况,仅供客户参考。</span>');
        }

        //公司高管信息
        _temp = report.com_manage;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="com_manage"]').addClass('text-blue').attr('href','#com_manage');
            _str += '<div class="result_title" id="com_manage">' +
                '<span class="lead">高管信息</span>' +
                '</div>';
            var header = [{
                title: '序号',
                name: 'i',
                width: '10%'
            }, {
                title: '姓名',
                name: 'Name',
                width: '30%'
            }, {
                title: '职位',
                name: 'Position',
                width: '40%'
            }, {
                title: '性别',
                name: 'Sex',
                width: '20%'
            }];
            _str += renderList(header, _temp, '<span class="no_data_text text-orange">暂无高管信息,不排除存在时间相对滞后或工商未公示的情况,仅供客户参考。</span>');
        }

        //公司股东信息
        _temp = report.com_holder;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="com_holder"]').addClass('text-blue').attr('href','#com_holder');
            _str += '<div class="result_title" id="com_holder">' +
                '<span class="lead">股东及出资信息</span>' +
                '</div>';
            var header = [{
                title: '序号',
                name: 'i',
                width: '10%'
            }, {
                title: '股东名称',
                name: 'ShaName',
                width: '20%'
            }, {
                title: '认缴出资额(万元)',
                name: 'SubConAmt',
                width: '20%'
            }, {
                title: '币种',
                name: 'RegCapCur',
                width: '20%'
            }, {
                title: '出资比例',
                name: 'FundedRatio',
                width: '10%'
            }, {
                title: '出资日期',
                type:'date',
                name: 'ConDate',
                width: '20%'
            }];
            _str += renderList(header, _temp, '<span class="no_data_text text-orange">暂无股东信息,不排除存在时间相对滞后或工商未公示的情况,仅供客户参考。</span>');
        }

        return _str;

    }


    /**
     * 企业对外投资及负债
     * @param data
     */
    function getComInvestHtml(data) {
        var _str = '', _temp = null, report = data.report_data;
        if (argsSome(report.child, report.invest, report.stock_pledge, report.stock_frozen, report.assets_pledge, report.assets_mortgage, report.ali_loan)) {
            _str += '<h1>企业对外投资及负债</h1>';
        }
        //分支机构查询
        _temp = report.child;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="child"]').addClass('text-blue').attr('href','#child');
            _str += '<div class="result_title" id="child">' +
                '<span class="lead">分支机构</span>' +
                '</div>';
            var header = [{
                title: '分支机构名称',
                name: 'brname',
                width: '20%'
            }, {
                title: '分支机构企业注册号',
                name: 'brregno',
                width: '20%'
            }, {
                title: '分支机构负责人',
                name: 'brprincipal',
                width: '20%'
            }, {
                title: '一般经营项目',
                name: 'cbuitem',
                width: '20%'
            }, {
                title: '分支机构地址',
                name: 'braddr',
                width: '20%'
            }];
            _str += renderList(header, _temp, '<span class="no_data_text text-orange">暂无分支机构信息,不排除存在时间相对滞后或工商未公示的情况,仅供客户参考。</span>');
        }


        //对外投资情况
        _temp = report.invest;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="invest"]').addClass('text-blue').attr('href','#invest');
            _str += '<div class="result_title" id="invest">' +
                '<span class="lead">企业对外投资信息(含出资比例)</span>' +
                '</div>';
            var header = [{
                title: '序号',
                name: 'i',
                width: '10%'
            }, {
                title: '企业名称',
                name: 'EntName',
                width: '20%'
            }, {
                title: '注册号',
                name: 'RegNo',
                width: '15%'
            }, {
                title: '成立日期',
                type:'date',
                name: 'EsDate',
                width: '15%'
            }, {
                title: '企业(机构)类型',
                name: 'EntType',
                width: '15%'
            }, {
                title: '出资比例',
                name: 'FundedRatio',
                width: '10%'
            }, {
                title: '注册资金(万元)',
                name: 'RegCap',
                width: '15%'
            }];
            _str += renderList(header, _temp, '<span class="no_data_text text-orange">暂无对外投资信息,不排除存在时间相对滞后或工商未公示的情况,仅供客户参考。</span>');

        }

        //股权出质历史查询
        _temp = report.stock_pledge;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="stock_pledge"]').addClass('text-blue').attr('href','#stock_pledge');
            _str += '<div class="result_title" id="stock_pledge">' +
                '<span class="lead">股权出质记录</span>' +
                '</div>';
            var header = [{
                title: '质权人姓名',
                name: 'imporg',
                width: '15%'
            }, {
                title: '出质人类别',
                name: 'imporgtype',
                width: '15%'
            }, {
                title: '出质金额(万元)',
                name: 'impam',
                width: '10%'
            }, {
                title: '出质备案日期',
                type:'date',
                name: 'imponrecdate',
                width: '20%'
            }, {
                title: '出质审批部门',
                name: 'impexaeep',
                width: '15%'
            }, {
                title: '出质批准日期',
                type:'date',
                name: 'impsandate',
                width: '15%'
            }, {
                title: '出质截至日期',
                type:'date',
                name: 'impto',
                width: '10%'
            }];
            _str += renderList(header, _temp, '<span class="no_data_text text-orange">暂无股权出质信息,不排除存在时间相对滞后或工商未公示的情况,仅供客户参考。</span>');
        }

        //动产质押信息查询
        _temp = report.assets_pledge;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="assets_pledge"]').addClass('text-blue').attr('href','#assets_pledge');
            _str += '<div class="result_title" id="assets_pledge">' +
                '<span class="lead">动产质押信息</span>' +
                '</div>';
            if (_temp.length > 0) {
                _temp.forEach(function (item) {
                    _str += '<table class="result_table mt10">' +
                        '<tr>' +
                        '<td width="15%" class="bold">抵押 ID：</td>' +
                        '<td width="45%">' + item.morregid + '</td>' +
                        '<td width="15%" class="bold">抵押人：</td>' +
                        '<td width="25%">' + item.mortgagor + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td class="bold">抵押权人：</td>' +
                        '<td>' + item.more + '</td>' +
                        '<td class="bold">登记机关：</td>' +
                        '<td>' + item.regorg + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td class="bold">登记日期：</td>' +
                        '<td>' + item.regidate + '</td>' +
                        '<td class="bold">状态标识：</td>' +
                        '<td>' + item.mortype + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td class="bold">登记证号：</td>' +
                        '<td>' + item.morregcno + '</td>' +
                        '<td class="bold">申请抵押原因：</td>' +
                        '<td>' + item.appregrea + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td class="bold">被担保主债权种类：</td>' +
                        '<td>' + item.priclaseckind + '</td>' +
                        '<td class="bold">被担保主债权数额(万元)：</td>' +
                        '<td>' + item.priclasecam + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td class="bold">履约起始日期：</td>' +
                        '<td>' + item.pefperfrom + '</td>' +
                        '<td class="bold">履约截止日期：</td>' +
                        '<td>' + item.pefperto + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td class="bold">注销日期：</td>' +
                        '<td colspan="3">' + item.candate + '</td>' +
                        '</tr>' +
                        '</table>';
                })
            } else {
                _str += '<span class="no_data_text text-orange">暂无动产质押信息,不排除存在时间相对滞后或工商未公示的情况,仅供客户参考。</span>';
            }
        }


        //动产抵押物信息查询
        _temp = report.assets_mortgage;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="assets_mortgage"]').addClass('text-blue').attr('href','#assets_mortgage');
            _str += '<div class="result_title" id="assets_mortgage">' +
                '<span class="lead">动产抵押物信息</span>' +
                '</div>';
            var header = [{
                name: 'morregid',
                title: '抵押 ID',
                width: '20%'
            }, {
                name: 'guaname',
                title: '抵押物名称',
                width: '40%'
            }, {
                name: 'quan',
                title: '数量',
                width: '10%'
            }, {
                name: 'value',
                title: '价值(万元)',
                width: '20%'
            }];
            _str += renderList(header, _temp, '<span class="no_data_text text-orange">暂无动产抵押物信息,不排除存在时间相对滞后或工商未公示的情况,仅供客户参考。</span>');
        }


        //阿里小贷欠款信息查询
        _temp = report.ali_loan;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="ali_loan"]').addClass('text-blue').attr('href','#ali_loan');
            _str += '<div class="result_title" id="ali_loan">' +
                '<span class="lead">阿里欠贷</span>' +
                '</div>';
            if (_temp.length > 0) {
                _temp.forEach(function (_temp) {
                    _str += '<table class="result_table mt10">' +
                        '<tr>' +
                        '<td width="15%" class="bold">欠贷人姓名/名称：</td>' +
                        '<td width="45%">' + _temp.INameClean + '</td>' +
                        '<td width="15%" class="bold">身份证号码：</td>' +
                        '<td>' + _temp.CardNumClean + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td class="bold">性别：</td>' +
                        '<td>' + _temp.SexyClean + '</td>' +
                        '<td class="bold">年龄：</td>' +
                        '<td>' + _temp.AgeClean + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td class="bold">省份：</td>' +
                        '<td>' + _temp.AreaNameClean + '</td>' +
                        '<td class="bold">身份证原始发证地：</td>' +
                        '<td>' + _temp.Ysfzd + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td class="bold">欠款额度：</td>' +
                        '<td>' + _temp.Qked + '</td>' +
                        '<td class="bold">违约情况：</td>' +
                        '<td>' + _temp.Wyqk + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td class="bold">贷款到期时间：</td>' +
                        '<td>' + _temp.Dkdqsj + '</td>' +
                        '<td class="bold">淘宝账户：</td>' +
                        '<td>' + _temp.Tbzh + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td class="bold">法定代表人：</td>' +
                        '<td>' + _temp.LegalPerson + '</td>' +
                        '<td class="bold">贷款期限：</td>' +
                        '<td>' + _temp.Dkqx + '</td>' +
                        '</tr>' +
                        '</table>';
                });
            } else {
                _str += '<span class="no_data_text text-orange">暂无阿里欠贷信息,不排除存在时间相对滞后或阿里未公示的情况,仅供客户参考。</span>';
            }
        }

        return _str;
    }


    //法定代表人相关
    function getComHolder(data) {
        var _str = '', _temp = null, report = data.report_data;
        if (argsSome(report.holder_invest, report.holder_position)) {
            _str += '<h1>法定代表人相关信息</h1>';
        }

        //法定代表人对外投资(含出资比例)
        _temp = report.holder_invest;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="holder_invest"]').addClass('text-blue').attr('href','#holder_invest');
            _str += '<div class="result_title" id="holder_invest">' +
                '<span class="lead">法定代表人对外投资(含出资比例)</span>' +
                '</div>';

            var header = [{
                name: 'Name',
                title: '姓名',
                width: '10%'
            }, {
                name: 'EntName',
                title: '公司名称',
                width: '20%'
            }, {
                name: 'EntType',
                title: '公司类型',
                width: '20%'
            }, {
                name: 'RegNo',
                title: '工商注册号',
                width: '20%'
            }, {
                name: 'EntStatus',
                title: '状态',
                width: '20%'
            }, {
                name: 'FundedRatio',
                title: '出资比例',
                width: '10%'
            }];
            _str += renderList(header, _temp, '<span class="no_data_text text-orange">暂无法定代表人对外投资信息,不排除存在时间相对滞后或工商未公示的情况,仅供客户参考。</span>');
        }


        //法定代表人在外任职
        _temp = report.holder_position;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="holder_position"]').addClass('text-blue').attr('href','#holder_position');
            _str += '<div class="result_title" id="holder_position">' +
                '<span class="lead">法定代表人在外任职</span>' +
                '</div>';

            var header = [{
                name: 'Name',
                title: '姓名',
                width: '10%'
            }, {
                name: 'EntName',
                title: '公司名称',
                width: '20%'
            }, {
                name: 'EntType',
                title: '公司类型',
                width: '20%'
            }, {
                name: 'RegNo',
                title: '工商注册号',
                width: '20%'
            }, {
                name: 'EntStatus',
                title: '状态',
                width: '20%'
            }, {
                name: 'Position',
                title: '职位',
                width: '10%'
            }];
            _str += renderList(header, _temp, '<span class="no_data_text text-orange">暂无法定代表人在外任职信息,不排除存在时间相对滞后或行政机构未公示的情况,仅供客户参考。</span>');
        }


        return _str;

    }

    //年报信息
    function getComYearReport(data) {
        var _str = '', _temp = null, report = data.report_data;
        if (argsSome(report.com_year_reports)) {
            _str += '<h1>年报信息</h1>';
        }
        //年报
        _temp = report.com_year_reports;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="com_year_reports"]').addClass('text-blue').attr('href','#com_year_reports');
            _str += '<div class="result_title" id="com_year_reports">' +
                '<span class="lead">公司年报概况</span>' +
                '</div>';

            var header = [{
                name: 'No',
                title: '序号',
                width: '10%'
            }, {
                name: 'Year',
                title: '报送年度',
                width: '20%'
            }, {
                name: 'Remarks',
                title: '备注',
                width: '30%'
            }, {
                name: 'HasDetailInfo',
                title: '是否有详细信息',
                width: '20%'
            }, {
                name: 'PublishDate',
                title: '发布日期',
                type:'date',
                width: '20%'
            }];
            _str += renderList(header, _temp, '<span class="no_data_text text-orange">暂无年报信息,不排除存在时间相对滞后或企业未公示的情况,仅供客户参考。</span>', [{
                from: undefined,
                to: '---'
            }, {from: null, to: '---'}, {from: true, to: '是'}, {from: false, to: '否'}]);
        }

        return _str;
    }

    //知识产权
    function getComLore(data) {
        var _str = '', _temp = null, report = data.report_data;
        if (argsSome(report.copyright, report.trademark, report.patent, report.com_itcopyright)) {
            _str += '<h1>企业知识产权</h1>';
        }

        //著作权
        _temp = report.copyright;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="copyright"]').addClass('text-blue').attr('href','#copyright');
            _str += '<div class="result_title" id="copyright">' +
                '<span class="lead">著作权信息</span>' +
                '</div>';

            var header = [{
                name: 'RegisterNo',
                title: '著作权登记号',
                width: '20%'
            }, {
                name: 'RegisterDate',
                title: '登记日期',
                type:'date',
                width: '15%'
            }, {
                name: 'Name',
                title: '作品名称',
                width: '10%'
            }, {
                name: 'Category',
                title: '类别',
                width: '10%'
            }, {
                name: 'Owner',
                title: '著作权人',
                width: '15%'
            }, {
                name: 'FinishDate',
                title: '完成日期',
                type:'date',
                width: '15%'
            }, {
                name: 'PublishDate',
                title: '首次发布日期',
                type:'date',
                width: '15%'
            }];
            _str += renderList(header, _temp, '<span class="no_data_text text-orange">暂无著作权信息,不排除存在时间相对滞后或行政机构未公示的情况,仅供客户参考。</span>');
        }


        //商标权
        _temp = report.trademark;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="trademark"]').addClass('text-blue').attr('href','#trademark');
            _str += '<div class="result_title" id="trademark">' +
                '<span class="lead">商标权信息</span>' +
                '</div>';

            var header = [{
                name: 'i',
                title: '序号',
                width: '10%'
            }, {
                name: 'RegNo',
                title: '注册号',
                width: '25%'
            }, {
                name: 'Name',
                title: '商标名称',
                ext:'ImageUrl',
                extType:'img',
                width: '15%'
            }, {
                name: 'IntCls',
                title: '商品/服务列表',
                width: '30%'
            }, {
                name: 'AppDate',
                title: '申请日期',
                type:'date',
                width: '20%'
            }];
            _str += renderList(header, _temp, '<span class="no_data_text text-orange">暂无商标权信息,不排除存在时间相对滞后或行政机构未公示的情况,仅供客户参考。</span>');
        }

        //专利
        _temp = report.patent;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="patent"]').addClass('text-blue').attr('href','#patent');
            _str += '<div class="result_title" id="patent">' +
                '<span class="lead">专利信息</span>' +
                '</div>';

            var header = [{
                name: 'i',
                title: '序号',
                width: '10%'
            }, {
                name: 'Title',
                title: '标题',
                width: '25%'
            }, {
                name: 'KindCodeDesc',
                title: '类型',
                width: '25%'
            }, {
                name: 'PublicationNumber',
                title: '申请公布号',
                width: '20%'
            }, {
                name: 'PublicationDate',
                title: '申请公布日',
                width: '20%'
            }];
            _str += renderList(header, _temp, '<span class="no_data_text text-orange">暂无专利信息,不排除存在时间相对滞后或行政机构未公示的情况,仅供客户参考。</span>');
        }

        //软件著作权
        _temp = report.com_itcopyright;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="com_itcopyright"]').addClass('text-blue').attr('href','#com_itcopyright');
            _str += '<div class="result_title" id="com_itcopyright">' +
                '<span class="lead">软件著作权信息</span>' +
                '</div>';

            var header = [{
                name: 'i',
                title: '序号',
                width: '10%'
            }, {
                name: 'RegisterNo',
                title: '登记号',
                width: '15%'
            }, {
                name: 'Category',
                title: '分类号',
                width: '15%'
            }, {
                name: 'Name',
                title: '软件全称',
                width: '15%'
            }, {
                name: 'ShortName',
                title: '软件简称',
                width: '15%'
            }, {
                name: 'VersionNo',
                title: '版本号',
                width: '10%'
            }, {
                name: 'Owner',
                title: '著作权人',
                width: '10%'
            }, {
                name: 'RegisterAperDate',
                title: '登记批准日期',
                type:'date',
                width: '10%'
            }];
            _str += renderList(header, _temp, '<span class="no_data_text text-orange">暂无软件著作权信息,不排除存在时间相对滞后或行政机构未公示的情况,仅供客户参考。</span>');
        }


        //域名备案信息
        _temp = report.com_website;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="com_website"]').addClass('text-blue').attr('href','#com_website');
            _str += '<div class="result_title" id="com_website">' +
                '<span class="lead">域名备案信息</span>' +
                '</div>';

            var header = [{
                name: 'i',
                title: '序号',
                width: '10%'
            }, {
                name: 'web_host',
                title: '域名',
                width: '15%'
            }, {
                name: 'web_record',
                title: '备案号',
                width: '15%'
            }, {
                name: 'web_name',
                title: '网站名称',
                width: '15%'
            }, {
                name: 'verify_date',
                title: '审核时间',
                type:'date',
                width: '15%'
            }];
            _str += renderList(header, _temp, '<span class="no_data_text text-orange">暂无域名备案信息,不排除存在时间相对滞后或行政机构未公示的情况,仅供客户参考。</span>');
        }

        return _str;
    }


    /**
     * 企业经营异常查询
     * @param data
     */
    function getComBiz(data) {
        var _str = '', _temp = null, report = data.report_data;
        if (argsSome(report.sanction, report.anomalies, report.stock_frozen, report.clear_history)) {
            _str += '<h1>企业经营异常</h1>';
        }


        //企业经营异常信息查询
        _temp = report.anomalies;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="anomalies"]').addClass('text-blue').attr('href','#anomalies');
            _str += '<div class="result_title" id="anomalies">' +
                '<span class="lead">企业经营异常信息</span>' +
                '</div>';
            var header = [{
                title: '列入原因',
                name: 'AddReason',
                width: '20%'
            }, {
                title: '列入时间',
                name: 'AddDate',
                width: '10%'
            }, {
                title: '移出原因',
                name: 'RomoveReason',
                width: '20%'
            }, {
                title: '移出时间',
                name: 'RemoveDate',
                width: '10%'
            }, {
                title: '做出决定机关',
                name: 'DecisionOffice',
                width: '15%'
            }, {
                title: '做出决定机关',
                name: 'RemoveDecisionOffice',
                width: '15%'
            }];
            _str += renderList(header, _temp, '<span class="no_data_text text-orange">暂无经营异常信息,不排除存在时间相对滞后或工商未公示的情况,仅供客户参考。</span>');
        }

        //行政处罚历史信息查询
        _temp = report.sanction;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="sanction"]').addClass('text-blue').attr('href','#sanction');
            _str += '<div class="result_title" id="sanction">' +
                '<span class="lead">行政处罚历史信息</span>' +
                '</div>';
            if (_temp.length > 0) {
                _temp.forEach(function (item) {
                    _str += '<table class="result_table mt10">' +
                        '<tr>' +
                        '<td width="15%" class="bold">案发时间：</td>' +
                        '<td width="45%">' + item.casetime + '</td>' +
                        '<td width="15%" class="bold">案由：</td>' +
                        '<td>' + item.casereason + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td class="bold">违法行为类型：</td>' +
                        '<td>' + item.casetype + '</td>' +
                        '<td class="bold">执行类别：</td>' +
                        '<td>' + item.exesort + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td class="bold">案件结果：</td>' +
                        '<td>' + item.caseresult + '</td>' +
                        '<td class="bold">处罚决定书签发日期：</td>' +
                        '<td>' + item.pendesissdate + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td class="bold">作出行政处罚决定机关名称：</td>' +
                        '<td>' + item.penauth + '</td>' +
                        '<td class="bold">主要违法事实：</td>' +
                        '<td>' + item.illegfact + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td class="bold">处罚依据：</td>' +
                        '<td>' + item.penbasis + '</td>' +
                        '<td class="bold">处罚种类：</td>' +
                        '<td>' + item.pentype + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td width="15%" class="bold">处罚结果：</td>' +
                        '<td width="45%">' + item.penresult + '</td>' +
                        '<td width="15%" class="bold">处罚金额：</td>' +
                        '<td>' + item.penam + ' 万元</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td class="bold">处罚执行情况：</td>' +
                        '<td colspan="3">' + item.penexest + '</td>' +
                        '</tr>' +
                        '</table>';
                    ''
                });
            } else {
                _str += '<span class="no_data_text text-orange">暂无行政处罚信息,不排除存在时间相对滞后或工商未公示的情况,仅供客户参考。</span>';
            }
        } else {
            _str += '<span class="no_data_text text-orange">暂无企业经营异常信息,不排除存在时间相对滞后或法院未公示的情况,仅供客户参考。</span>';
        }


        //股权冻结历史查询
        _temp = report.stock_frozen;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="stock_frozen"]').addClass('text-blue').attr('href','#stock_frozen');
            _str += '<div class="result_title" id="stock_frozen">' +
                '<span class="lead">股权冻结历史信息</span>' +
                '</div>';
            if (_temp.length > 0) {
                _temp.forEach(function (item) {
                    _str += '<table class="result_table mt10">' +
                        '<tr>' +
                        '<td width="15%" class="bold">冻结文号：</td>' +
                        '<td width="45%">' + item.frodocno + '</td>' +
                        '<td width="15%" class="bold">冻结机关：</td>' +
                        '<td>' + item.froauth + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td class="bold">冻结起始日期：</td>' +
                        '<td>' + item.frofrom + '</td>' +
                        '<td class="bold">冻结截至日期：</td>' +
                        '<td>' + item.froto + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td class="bold">冻结金额：</td>' +
                        '<td>' + item.froam + '</td>' +
                        '<td class="bold">解冻机关：</td>' +
                        '<td>' + item.thawauth + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td class="bold">解冻文号：</td>' +
                        '<td>' + item.thawdocno + '</td>' +
                        '<td class="bold">解冻日期：</td>' +
                        '<td>' + item.thawdate + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td class="bold">解冻说明：</td>' +
                        '<td colspan="3">' + item.thawcomment + '</td>' +
                        '</tr>' +
                        '</table>';
                    ''
                });
            } else {
                _str += '<span class="no_data_text text-orange">暂无股权冻结信息,不排除存在时间相对滞后或工商未公示的情况,仅供客户参考。</span>';
            }
        }


        //清算历史信息查询
        _temp = report.clear_history;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="clear_history"]').addClass('text-blue').attr('href','#clear_history');
            _str += '<div class="result_title" id="clear_history">' +
                '<span class="lead">清算历史信息</span>' +
                '</div>';
            var header = [{
                title: '清算责任人',
                name: 'ligentity',
                width: '10%'
            }, {
                title: '清算负责人',
                name: 'ligprincipal',
                width: '10%'
            }, {
                title: '清算组成员',
                name: 'liqmen',
                width: '20%'
            }, {
                title: '清算完结情况',
                name: 'ligst',
                width: '20%'
            }, {
                title: '清算完结日期',
                type:'date',
                name: 'ligenddate',
                width: '20%'
            }, {
                title: '债务承接人',
                name: 'debttranee',
                width: '10%'
            }, {
                title: '债权承接人',
                name: 'claintranee',
                width: '10%'
            }];
            _str += renderList(header, _temp, '<span class="no_data_text text-orange">暂无清算信息,不排除存在时间相对滞后或工商未公示的情况,仅供客户参考。</span>');
        }

        return _str;
    }

    //企业司法相关信息
    function getComLawsuit(data) {
        var _str = '', _temp = null, report = data.report_data;
        if (argsSome(report.justed, report.auction, report.court, report.biz_failed)) {
            _str += '<h1>司法信息</h1>';
        }


        //企业失信人信息查询
        _temp = report.biz_failed;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="biz_failed"]').addClass('text-blue').attr('href','#biz_failed');
            _str += '<div class="result_title" id="biz_failed">' +
                '<span class="lead">企业失信人信息</span>' +
                '</div>';
            if (_temp.length > 0) {
                _temp.forEach(function (item) {
                    _str += '<table class="result_table mt10">' +
                        '<tr>' +
                        '<td width="15%" class="bold">案号：</td>' +
                        '<td width="45%">' + item.CaseCode + '</td>' +
                        '<td width="15%" class="bold">被执行人姓名：</td>' +
                        '<td width="25%">' + item.INameClean + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td width="15%" class="bold">立案事件：</td>' +
                        '<td width="45%">' + item.RegDateClean + '</td>' +
                        '<td width="15%" class="bold">公布时间：</td>' +
                        '<td width="25%">' + item.PublishDateClean + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td width="15%" class="bold">执行法院：</td>' +
                        '<td width="45%">' + item.CourtName + '</td>' +
                        '<td width="15%" class="bold">省份：</td>' +
                        '<td width="25%">' + item.AreaNameClean + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td width="15%" class="bold">生效法律文书确定的义务：</td>' +
                        '<td width="45%">' + item.Duty + '</td>' +
                        '<td width="15%" class="bold">执行依据文号：</td>' +
                        '<td width="25%">' + item.GistId + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td width="15%" class="bold">被执行人的履行情况：</td>' +
                        '<td width="45%">' + item.Performance + '</td>' +
                        '<td width="15%" class="bold">失信被执行人行为具体情形：</td>' +
                        '<td width="25%">' + item.DisruptTypeName + '</td>' +
                        '</tr>' +
                        '</table>';
                });

            } else {
                _str += '<span class="no_data_text text-orange">暂无企业失信人信息,不排除存在时间相对滞后或法院未公示的情况,仅供客户参考。</span>';
            }
        } else {
            _str += '<span class="no_data_text text-orange">暂无企业司法信息,不排除存在时间相对滞后或法院未公示的情况,仅供客户参考。</span>';
        }


        //企业被执行信息查询
        _temp = report.justed;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="justed"]').addClass('text-blue').attr('href','#justed');
            _str += '<div class="result_title" id="justed">' +
                '<span class="lead">企业被执行信息查询</span>' +
                '</div>';
            var header = [{
                title: '序号',
                name: 'i',
                width: '10%'
            }, {
                title: '案号',
                name: 'CaseCode',
                width: '25%'
            }, {
                title: '执行法院',
                name: 'CourtName',
                width: '25%'
            }, {
                title: '执行标的(元)',
                name: 'ExecMoney',
                width: '20%'
            }, {
                title: '立案时间',
                name: 'RegDateClean',
                width: '20%'
            }];
            _str += renderList(header, _temp, '<span class="no_data_text text-orange">暂无企业被执行信息,不排除存在时间相对滞后或法院未公示的情况,仅供客户参考。</span>');
        }


        //法院公告信息查询
        _temp = report.court;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="court"]').addClass('text-blue').attr('href','#court');
            _str += '<div class="result_title" id="court">' +
                '<span class="lead">法院公告</span>' +
                '</div>';
            var header = [{
                title: '公告类型',
                name: 'Category',
                width: '20%'
            }, {
                title: '内容',
                name: 'Content',
                width: '40%'
            }, {
                title: '发布日期',
                type:'date',
                name: 'PublishedDate',
                width: '20%'
            }, {
                title: '法院',
                name: 'Court',
                width: '20%'
            }];
            _str += renderList(header, _temp, '<span class="no_data_text text-orange">暂无法院公告信息,不排除存在时间相对滞后或法院未公示的情况,仅供客户参考。</span>');
        }


        //法院判决
        _temp = report.com_panjue;
        if (!isEmpty(_temp)) {
            companHead.find('[data-href="com_panjue"]').addClass('text-blue').attr('href','#com_panjue');
            _str += '<div class="result_title" id="com_panjue">' +
                '<span class="lead">法院判决</span>' +
                '</div>';
            var header = [{
                title: '裁判文书编号',
                name: 'CaseNo',
                width: '20%'
            }, {
                title: '标题',
                name: 'CaseName',
                width: '30%'
            }, {
                title: '执行法院',
                name: 'Court',
                width: '20%'
            }, {
                title: '日期',
                name: 'SubmitDate',
                type:'date',
                width: '20%'
            }, {
                title: '类型',
                name: 'CaseType',
                width: '10%'
            }];
            _str += renderList(header, _temp, '<span class="no_data_text text-orange">暂无法院判决信息,不排除存在时间相对滞后或法院未公示的情况,仅供客户参考。</span>',[{from:undefined,to:'---'},{from:undefined,to:'---'},{from:'ms',to:'民事'},{from:'xs',to:'刑事'},{from:'xz',to:'行政'},{from:'zscq',to:'知识产权'},{from:'pc',to:'赔偿'},{from:'zx',to:'执行'}]);
        }

        return _str;
    }

    function argsSome() {
        for (var i = 0, max = arguments.length; i < max; i++) {
            var _ = arguments[i];
            if (_ !== undefined) {
                return true;
            }
        }
        return false;
    }


})(jQuery);