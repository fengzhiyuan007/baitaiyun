/**
 * 分页
 */
function toPage(select,report_info) {
    report_info = report_info || {report_sn:'',report_date:''};
    select = select || '.report_box';
    var box = $(select);
    var container = $('.report_page');
    var singleHeight = 820;
    var currPage = 1;
    var currRenderHeight = 0;
    var headerStr = '<div class="report_page_box"><div class="page_header">报告编号：<span class="report_no"></span>　　查询时间：<span class="report_time"></span> <span class="text-blue pull-right">看法</span> </div><div class="page_content">';
    var _str = headerStr;

    var footerStr = function(){
        return  '</div><div class="page_footer">当前第'+currPage+'页，共<span class="total_page">1</span>页。</div></div>';
    };

    var pageRender = function () {
        box.children().each(function (index, item) {
            //判断是否是table
            if (item.tagName.toLowerCase() === 'table') {
                pageRenderTable(item);
            } else {
                pageRenderOther(item);
            }
            if(index===box.children().length-1){
                _str += footerStr();
            }

        });
        $('.report_page').append(_str);
        $('.total_page').text(currPage);

        //渲染完成修改报告编号和时间
        $('.report_no').text(report_info.report_sn);
        $('.report_time').text(report_info.report_date);
        box.hide();
    };
    var pageRenderTable = function (item) {
        var _self = $(item);
        var _selfH = _self.outerHeight(true);
        var tableHStr = '<table class="'+_self.attr('class')+'">';
        var tableHeader = _self.find('thead');
        var tableIsHeader = tableHeader.length > 0;
        var tableHeaderStr = tableIsHeader ? tableHeader.eq(0).prop('outerHTML') : '';
        var tableBody = _self.find('tbody');
        //如果高度+当前渲染高度大于一页高度
        if (_selfH + currRenderHeight > singleHeight) {
            //如果thead+tbody第一行高度大于一页则换页
            if(tableHeader.outerHeight(true)+tableBody.children().eq(0).outerHeight(true)+currRenderHeight>singleHeight){
                _str += footerStr();
                _str += headerStr;
                currPage++;
                currRenderHeight = 0;
            }
            //绘制表格
            _str += '<table class="'+_self.attr('class')+'">';
            //如果有thead
            if(tableIsHeader){
                _str += tableHeaderStr;
                currRenderHeight += tableHeader.outerHeight(true);
            }
            //tbody
            tableBody.find('tr').each(function (index, item) {
                var _tr = $(item);
                var _trH = _tr.outerHeight(true);
                if (_trH + currRenderHeight > singleHeight) {
                    //加上当前行大于一页高度
                    _str += '</table>';
                    _str += footerStr();
                    _str += headerStr;
                    _str += tableHStr;
                    currPage++;
                    currRenderHeight = 0;
                    if(tableIsHeader){
                        _str += tableHeaderStr;
                        currRenderHeight += tableHeader.outerHeight(true);
                    }
                }
                _str += _tr.prop('outerHTML');
                currRenderHeight += _trH;
                if(index===tableBody.find('tr').length-1){
                    _str += '</table>';
                }
            });


        } else {
            _str += _self.prop('outerHTML');    //加上当前标签代码
            currRenderHeight += _selfH; //加上渲染高度
        }
    };
    var pageRenderOther = function (item) {
        var _self = $(item);
        var _selfH = _self.outerHeight(true);
        //其他标签，如果高度+当前渲染的高度大于一页的高度则换行。
        var _addH = 0;
        if(_self.hasClass('result_title')){
            _addH = 100;
        }
        if (_selfH + currRenderHeight + _addH > singleHeight) {
            _str += footerStr();  //当前页底部
            _str += headerStr;  //下一页头部
            currRenderHeight = 0;   //初始化渲染高度
            currPage++; //当前页码
        }
        _str += _self.prop('outerHTML');    //加上当前标签代码
        currRenderHeight += _selfH; //加上渲染高度
    };
    pageRender();
}


/**
 * 获取url参数
 * @param name 参数名
 * @returns {null}
 */
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r !== null) return unescape(r[2]);
    return null;
}

/**
 * 渲染列表
 * @param header 列表头部
 * @param data 数据
 * @param noDataText 无数据显示的内容
 * @param replace 替换内容
 */
function renderList(header, data,noDataText,replace) {
    noDataText = noDataText || '无';
    if (data.length > 0) {
        var tableStr = '<table class="result_table">', i, max;
        var headerStr = '<thead><tr>', bodyStr = '<tbody>';
        for (i = 0, max = header.length; i < max; i++) {
            var _h = header[i];
            var _width = _h.width || 'auto';
            headerStr += '<td width="' + _width + '" class="bold text-center">' + _h.title + '</td>';

        }
        headerStr += '</tr></thead>';


        for (i = 0, max = data.length; i < max; i++) {
            bodyStr += '<tr>';
            var _data = data[i];
            if(replace){
                _data = replaceObj(_data,replace);
            }
            for (var j = 0, m = header.length; j < m; j++) {

                if (header[j].name === 'i') {
                    bodyStr += '<td class="text-center">' + (i+1) + '</td>';
                } else {
                    var _text = _data[header[j].name];
                    if (_text !== null && _text !== undefined) {
                        if(header[j].ext){
                            if(header[j].extType==='img' && _data[header[j].ext]){
                                _text += '<div style="height:40px;"><img src="'+_data[header[j].ext]+'" style="max-width:100%;height:40px;"></div>';
                            }else{
                                _text += header[j].ext;
                            }

                        }
                        if(header[j].type==='date' && _text.length>=10){
                            _text = _text.substr(0,10)
                        }
                        bodyStr += '<td class="text-center">' + _text + '</td>';
                    } else {
                        bodyStr += '<td class="text-center">---</td>';
                    }

                }

            }
            bodyStr += '</tr>';
        }
        bodyStr += '</tbody>';


        tableStr = tableStr + headerStr + bodyStr + '</table>';
        return tableStr;
    } else {
        return noDataText;
    }

}

/**
 * 浅替换对象中的指定值
 * @param replaceKeys 配置数组
 */

function replaceObj(obj, replaceKeys) {
    replaceKeys = replaceKeys || [{from: undefined, to: '---'}, {from: null, to: '---'}];
    var i, max;
    for (var _ in obj) {
        for (i = 0, max = replaceKeys.length; i < max; i++) {
            var _temp = replaceKeys[i];
            obj[_] = obj[_] === _temp.from ? _temp.to : obj[_];
        }
    }
    return obj;
}