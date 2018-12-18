/**
 * Created by wujunshan on 21/04/2017.
 */
$(function(){
    $('.right-li2').click(function(event){
        event.stopPropagation();
        $('.right-list').slideToggle()
    });
    $('.right-list li').click(function(){
        $(this).addClass('active').siblings().removeClass('active')
    });
// 错误提示
    $('.clos-0').on('click', function(event) {
        $('.alert-danger').hide(300);
    });
    setInterval(function(){
        $('.alert-danger').hide(300);
    },5000);

    $(window).click(function(){
        $('.right-list').slideUp()
    });
});
