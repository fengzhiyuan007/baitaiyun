/**
 * Created by wujunshan on 16/03/2017.
 */
function isEmpty(value) {
    return (Array.isArray(value) && value.length === 0) || (Object.prototype.isPrototypeOf(value) && Object.keys(value).length === 0) || !Boolean(value);
}

/**
 * dom内loading
 * @param _dom
 */
function domLoading(_dom){
    var loaderMask = _dom+" .loader_mask";
    var loader = _dom+" .loader";
    if($(loaderMask).length == 0){
        $(_dom).append("<div class='loader_mask'></div>");
        $(_dom).append("<div class='loader'></div>");
    }
    loaderMask = $(loaderMask);
    loader = $(loader);
    var _mh = loaderMask.height();
    var _mw = loaderMask.width();
    var _lh = (_mh/2) - (loader.height()/2);
    var _lw = (_mw/2) - (loader.width()/2);
    loader.css({'top':_lh, left: _lw, 'position':'absolute'});
    loaderMask.fadeIn();
    loader.fadeIn();

}

/**
 * dom内隐藏loading
 * @param _dom
 */
function domHideLoading(_dom){
    var loaderMask = _dom+" .loader_mask";
    var loader = _dom+" .loader";
    loaderMask = $(loaderMask);
    loader = $(loader);
    loaderMask.fadeOut();
    loader.fadeOut();
}

//退出登录
function logout(){
    $.post('/members/logout.html',function(rs){
        setTimeout(function(){
            window.location.reload();
        },2000);
    },'json');
}

//跳转到页面顶端
function jumpToTop(){
    $('body').animate( {scrollTop: 0}, 500);
}