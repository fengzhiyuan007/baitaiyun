/**
 * Created by wujunshan on 23/05/2017.
 * @author: wujunshan
 * @desc: 进度条插件
 *
 */
$.fn.progressBar = function(options){

    /**
     *
     * @type {{active: boolean, striped: number, opacity: number, color: string[], showToolTip: number, data: Array, max: number}}
     * @params active boolean 是否动态效果
     * @params striped boolean 是否动态效果
     * @params opacity int 透明度
     * @params color array 颜色数组
     * @params showToolTip boolean 是否显示tip
     * @params data array 内容 数组格式
     * @params max int 最大显示数量
     */
    var defaults = {
        active: false,  //是否动态效果
        striped: false, //0,1 进度条样式
        opacity: 1,
        color: ['#04aafd','#66bb6a','#5c6bc0','#ffa726','#ff7043'],
        showToolTip: true, //是否显示tip
        data: [],
        max:5,
        total:0,
        },_this = this;

    this.PB = $.extend(defaults, options);

    this.checkData = function(){
        if(Array.isArray(this.PB.data)){
            if(this.PB.data.length === 0){
                return false;
            }
            return true;
        }
        return false;
    };

    this.total = function(){
        //计算总数
        var total = 0;
        this.PB.data.forEach(function(e,i){
            total += parseInt(e['value']);
        });
        return total;
    }

    this.show = function(){

        if(!this.checkData){
            return false;
        }
        var total = this.total();
        if(this.PB.total > 0 && this.PB.total> total){
            total = this.PB.total;
        }
        var progressBarClass = "progress-bar";
        if(this.PB.active){
            progressBarClass += "active ";
        }
        if(this.PB.striped){
            progressBarClass += "progress-bar-striped ";
        }

        var html_str = '';
        var a = 0;
        this.PB.data.forEach(function(e,i){
            var pec = (parseInt(e['value'])/total*100).toFixed(0);
            if(parseInt(pec) + a > 100){
                pec = 100-a;
            }else {
                a += parseInt(pec);
            }
            html_str += '<a class="progress-link" href="'+ e.linkTo+'"><div>';
            html_str += '<div class="clearfix"><div class="progress-content pull-left" style="color:'+_this.PB.color[i]+'">'+e['name']+'</div><div class="progress-content pull-right" style="color:'+_this.PB.color[i]+'">'+pec+'%</div></div>'
            html_str += '<div class="progress" '+ (_this.PB.showToolTip ? 'data-original-title="'+ e['name']+'('+pec+'%)" data-toggle="tooltip" data-placement="top"':'') +'>';
            html_str += '<div class="'+progressBarClass+'" style="width:'+pec+'%;opacity:'+_this.PB.opacity+';background-color:'+_this.PB.color[i]+'" >';
            html_str += '</div></div></div></a>';

        });
        this.append(html_str);
        $('[data-toggle="tooltip"]').tooltip();
        return true;
    };

    return this;

}