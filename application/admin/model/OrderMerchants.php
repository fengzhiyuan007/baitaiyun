<?php
namespace app\admin\model;
use think\model;
use think\Db;
use think\Session;
use lib\Page;
class OrderMerchants extends Common{
    // 设置当前模型对应的完整数据表名称
    protected $table = 'order_merchants';
    //获取订单详情
    public function order_list($params,$map,$num){
    //获取订单总数
    $count = DB::name('order_merchants')->alias('a')
        ->join("__MEMBER__ b", "a.member_id = b.member_id","LEFT")
        ->join("__MERCHANTS__ c", "a.merchants_id = c.merchants_id","LEFT")
        ->where($map)
        ->count();
    $list  = DB::name('order_merchants')->alias('a')
        ->field('a.order_merchants_id,a.merchants_id,a.member_id,a.order_no,a.order_total_price,a.order_actual_price,a.goods_total_price,a.order_state,a.create_time,address_mobile,address_name,
               b.phone,b.username,
               c.merchants_name,c.contact_name
        ')
        ->join("__MEMBER__ b", "a.member_id = b.member_id","LEFT")
        ->join("__MERCHANTS__ c", "a.merchants_id = c.merchants_id",'LEFT')
        ->where($map)
        ->order("a.create_time desc")
        ->paginate($num,false,["query"=>$params]);
        return ["count"=>$count,'list'=>$list];
    }
}