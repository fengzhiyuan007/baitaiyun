/**
 * Created by wujunshan on 17/04/2017.
 * @desc: 报告页右侧扩展栏
 */
$.fn.rightMenu = function(options){
    var defaults = {
        linkURL: "",
        opacity: 0.6,//背景透明度
        callBack: null,
        title: '',//标题
        show:false,
        timeout:0, //异步时间
        params:null, //请求参数 对象
        page_size: 20, //每页条数
        page:1, //当前页数
        linkParams:{}
    },_this=this;
    this.RM = $.extend(defaults, options);
    this.loading = false;
    this.rg_timer = "";
    this.page = {total_page:0,now_page:1,page_size:(window.screen.width > 1280 ? 30 : this.RM.page_size)};
    var menuHtml = '<div id="relResultOverlay" onclick="javascript:$().rightMenu().closeMenu();" style="display:none;background:rgba(0,0,0,'+this.RM.opacity+')"></div><div id="relResult" class=""><div class="content" style="overflow:auto"><div class="form"><div class="title">'+(this.RM.title ? this.RM.title:'查看全部')+'<span class="resultTag"></span></div></div><div class="msg empty">没有结果符合您的搜索</div><div class="result" id="rel_content"></div><div id="right_menu_loader" class="right_menu_loader"></div></div></div>';
    this.showMenu=function (){
        $("#relResultOverlay").remove();
        $("#relResult").remove();
        C = $(menuHtml).appendTo('body');
        var relResult = $('#relResult');
        var relResultOverlay = $('#relResultOverlay');
        relResultOverlay.show();
        relResult.addClass("show");
        relResultOverlay.animate({
            'opacity': 1
        },200);
        this.getData();
    };

    this.getData = function(){
        var params = this.RM.params;
        loader_show();
        setTimeout(function(){
            $.post(params.url,{search_type:params.search_type,id_no:params.id_no,data_type:params.data_type,page:_this.page.now_page,page_size:_this.page.page_size},function(rs){
                loader_hide();
                if(rs.code==200){
                    build_MenuItem(rs.data);
                    if(rs.data.total == 0){
                        $('#relResult .empty').show();
                    }
                    _this.listenScroll();
                    _this.page.total_page = Math.ceil(parseInt(rs.data.total)/_this.page.page_size);
                }else{
                    layer.msg(rs.msg,{time: 2000},function(){
                        _this.closeMenu();
                    });
                }
            })
        },1000);
        if(_this.loading) _this.loading = !_this.loading;
    };

    build_MenuItem = function (data) {
        var replace_arr = {
            'customer_list':'dangshiren_names',
            'dangshiren_list': 'dangshiren_names',
            'fayuan_list': 'fayuan_names',
            'fayuan': 'fayuan_names',
            'shenpanren_list': 'shenpanren_names',
            'shenpanren': 'shenpanren_names',
            'lawyers': 'lawyer_names',
            'duishou': 'lawyer_names',
            'duishou_lawyer': 'lawyer_names',
            'firm_list': 'firm_names',
            'firms': 'firm_names',
        };
        var type = _this.RM.params.data_type;
        var search_type = _this.RM.params.search_type;
        var link_to = '';
        var fe = $('#rel_content');
        var html_str = "";
        data.data.forEach(function(e,i){
            //var defaultName = _this.defaultName(search_type);
            //var search_default_name = _name;
            //link_to = _this.RM.linkURL?_this.RM.linkURL:'javascript:void(0);';
            //var search_key = eval("replace_arr."+type);
            //if(search_key && search_key!=undefined){
            //    if(type == 'duishou' && search_type == 'lawyer'){
            //        search_default_name = search_default_name+" "+ e.name;
            //        link_to = "javascript:doc_filter.link({"+(defaultName ? (defaultName+':\''+search_default_name+'\'') : '')+"},1)";
            //    }else if(type == 'firm_list' && search_type == 'firm'){
            //        search_default_name = search_default_name+" "+ e.name;
            //        link_to = "javascript:doc_filter.link({"+(defaultName ? (defaultName+':\''+search_default_name+'\'') : '')+"},1)";
            //    }else{
            //        link_to = "javascript:doc_filter.link({'"+search_key+"':'"+e.name+"',"+(defaultName ? (defaultName+':\''+search_default_name+'\'') : '')+"},1)";
            //    }
            //}
            //html_str += '<a class="entry clearfix" href="'+link_to+'"><span class="name">'+ e.name +'</span><span class="count">'+ e.value+'<i class="fa icon-chevron-right"></i></span></a>';
            if(_this.RM.linkParams && _this.RM.linkParams != undefined){
                var defaultName = _this.defaultName(search_type);
                var search_default_name = _name;
                link_to = _this.RM.linkURL?_this.RM.linkURL:'javascript:void(0);';
                var search_key = eval("replace_arr."+type);
                var link_params = {};
                if(search_type == 'lawyer'){
                    link_params.firm_names = _this.RM.linkParams.firm_names;
                }
                if(search_type == 'shenpanren'){
                    link_params.fayuan_names = _this.RM.linkParams.fayuan_names;
                }
                if(search_key && search_key!=undefined){
                    if(type == 'duishou' && search_type == 'lawyer'){
                        search_default_name = search_default_name+" "+ e.name;
                        (defaultName ? (eval("link_params."+defaultName+"='"+search_default_name+"'")) : '');
                    }else if(type == 'firm_list' && search_type == 'firm'){
                        search_default_name = search_default_name+" "+ e.name;
                        (defaultName ? (eval("link_params."+defaultName+"='"+search_default_name+"'")) : '');
                    }else{
                        eval("link_params."+defaultName+"='"+search_default_name+"'")
                        eval("link_params."+search_key+"='"+e.name+"'");
                        //link_to = "javascript:doc_filter.link({'"+search_key+"':'"+e.name+"',"+(defaultName ? (defaultName+':\''+search_default_name+'\'') : '')+"},1)";
                    }
                }
                var tmp = [];
                for( var item in link_params){
                    tmp.push(item+":'"+link_params[item]+"'");
                }
                link_to = "javascript:doc_filter.link({"+tmp.join(',')+"},1);";

            }else{
                link_to = "javascript:void(0);"
            }
            html_str += '<a class="entry clearfix" href="'+link_to+'"><span class="name">'+ e.name +'</span><span class="count">'+ e.value+'<i class="fa icon-chevron-right"></i></span></a>';

        });
        fe.append(html_str);
    }

    this.defaultName = function(name){
        var str = '';
        switch(name){
            case 'lawyer':
                str = 'lawyer_names';
                break;
            case 'company':
                str = 'dangshiren_names';
                break;
            case 'firm':
                str = 'firm_names';
                break;
            case 'court':
                str = 'lawyer_names';
                break;
            case 'shenpanren':
                str = 'shenpanren_names';
                break;
            default :
                str = 'default';
                break;
        }
        return str;
    }

    this.closeMenu = function(){
        $('#relResult').removeClass("show");
        $("#relResultOverlay").animate({
            'opacity': 0
        },600,function(){
            $('#relResultOverlay').hide();
            $("#relResultOverlay").remove();
            $("#relResult").remove();
        });
    };

    this.listenScroll = function () {
        var obj = $("#relResult #rel_content");
        obj.scroll(function(){
            if(obj.scrollTop() >= obj.height() - $(window).height()){
                if((_this.page.now_page + 1) <= _this.page.total_page){
                    clearTimeout(_this.rg_timer);
                    _this.rg_timer = setTimeout(function () {
                        if (_this.loading) {
                            return false;
                        } else {
                            _this.loading = true;
                        }
                        _this.page.now_page += 1;
                        _this.getData();
                    },500)
                };
            }
        });
    };

    function loader_show(){
        $('#right_menu_loader').fadeIn();
    }

    function loader_hide(){
        $('#right_menu_loader').fadeOut();
    }

    return this;
};