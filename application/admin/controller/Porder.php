<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/11/14
 * Time: 下午4:27
 */

namespace app\admin\controller;

use lib\Page;
use think\Db;
use think\Session;
use think\Request;
class Porder extends Base
{
    /*商户申请订单*/
    public function merchant_apply(){
        $name = input('name');
        $order_state = input('order_state');
        !empty($name)   &&  $where['b.merchants_name|a.order_no'] = ['like','%'.$name.'%'];
        !empty($order_state)   &&  $where['a.order_state'] = $order_state;
        $where['a.is_delete'] = 0;
//        $where['a.order_state'] = 'end';
        $num  = input('num');
        if (empty($num)){
            $num = 10;
        }
        $count = Db::name('merchants_deposit_order')->alias('a')
               ->join('th_merchants b','a.member_id = b.member_id')
               ->where($where)
               ->count();
        $list = Db::name('merchants_deposit_order')->alias('a')
            ->field('a.*,b.merchants_name')
            ->join('th_merchants b','a.member_id = b.member_id')
            ->where($where)
            ->order('a.create_time desc')
            ->paginate($num,false,["query"=>Request::instance()->param()]);
        $page = $list->render();
        $this->assign(['count'=>$count,'list'=>$list,'page'=>$page]);
        $act = input("act");
        if($act=="download"){
            $dat = Db::name('merchants_deposit_order')->alias('a')
                ->field('a.*,b.merchants_name')
                ->join('th_merchants b','a.member_id = b.member_id')
                ->where($where)
                ->order('a.create_time desc')
                ->select();
            $str = '商户申请订单记录表格'.date('YmdHis');
            header('Content-Type: application/download');
            header("Content-type:application/vnd.ms-excel");
            header("Content-Disposition:attachment;filename={$str}.csv");
            header('Cache-Control:must-revalidate,post-check=0,pre-check=0');
            header('Expires:0');
            header('Pragma:public');
            echo "\xEF\xBB\xBF"."序号,订单单号,支付金额,商家,支付类型,下单时间\n";
            foreach($dat as $key=>$val){
                switch($val['order_state']){
                    case 'wait_pay' :
                        $val['order_state'] = '待支付';
                        break;
                    case 'end' :
                        $val['order_state'] = '已支付';
                        break;
                }
                echo $key.","
                    .$val["order_no"]."\t,"
                    .$val["amount"]."\t,"
                    .$val["merchants_name"]."\t,"
                    .$val["pay_way"]."\t,"
                    .$val["pay_type"]."\t,"
                    .$val["create_time"]."\t,"
                    ."\n";
            }
        }else{
            $url =$_SERVER['REQUEST_URI'];
            session('url',$url);
            return $this->fetch();
        }

    }

    public function del_merchant_apply(){
        if(Request::instance()->isAjax()){
            $ids = input('ids');
            $result = Db::name('merchants_deposit_order')->where(['deposit_id'=>['in',$ids]])->update(['is_delete'=>'1']);
            if($result){
                success(['info' => '删除记录成功!', 'url' => session('url')]);
            }else{
                error("删除失败");
            }
        }
    }

    // 空方法
    public function _empty(){
        $this->view->engine->layout(false);
        return $this->fetch('common/error');
    }
}