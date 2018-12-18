<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/11/20
 * Time: 下午2:19
 */

namespace app\admin\controller;

use think\Request;
use think\Db;
use think\Session;
use think\Validate;
use lib\Page;
class Marketing extends Base
{
    /**
     *积分设置
     */
    public function integral(){
        if(Request::instance()->isAjax()){
            $data = Request::instance()->post();
            if(empty($data['integral']))           error("消费积分值设置不能为空");
            if(empty($data['money']))              error("抵扣金额值设置不能为空");
            if(empty($data['consumer']))           error("用户消费值设置不能为空");
            if(empty($data['give_integral']))      error("得到积分值设置不能为空");
            $result = Db::name('InstallScore')->where(['id'=>1])->update($data);
            if($result){
                success(array('info'=>'设置积分数据成功'));
            }else{
               error('设置积分数据失败');
            }
        }else{
            $re = Db::name('InstallScore')->where(['id'=>1])->find();
            $this->assign(['re'=>$re]);
            return $this->fetch();
        }
    }
    /**
     *@通兑普通优惠券
     */
    public function common_coupon(){
        $map=[];
        $map['is_delete'] = 0;
        $map['type'] = 1;
        $title = input('title');
        !empty($title)   &&  $map['title'] = ['like',"%".$title.'%'];
        $num  = input('num');
        if (empty($num)){
            $num = 10;
        }
        $this->assign('nus',$num);
        $count = Db::name('Coupon')->where($map)->count();
        $list = Db::name("Coupon")->where($map)->order("status desc,intime desc")->paginate($num,false,$config = Request::instance()->param());
        $list->toArray();
        foreach ($list as $k=>$v){
            $data = array();
            $data = $v;
            $data['used_count'] = Db::name('MemberCoupon')->where(['coupon_id'=>$v['id'],'status'=>'2'])->count();
            $list->offsetSet($k,$data);
        }
        $page = $list->render();
        $this->assign(['list'=>$list,'page'=>$page,'count'=>$count]);
        $act = input("get.act");
        if($act=="download"){
            $dat =  M("Coupon")->where($map)->order("status desc,intime desc")->limit($p->firstRow,$p->listRows)->select();
            $str = '优惠券表'.date('YmdHis');
            header("Content-type:application/vnd.ms-excel");
            header("Content-Disposition:filename={$str}.csv");
            echo "\xEF\xBB\xBF"."序号,名称,价值,场景,限制金额,发行量,剩余量,使用量,支付量,过期时间,发送状态\n";
            foreach ($dat as $k=>$v){
                $v['used_count'] = M('MemberCoupon')->where(['coupon_id'=>$v['id'],'status'=>'2'])->count();
                switch($v['is_send']){
                    case 1 :
                        $v['is_send'] = '未发送';
                        break;
                    case 2 :
                        $v['is_send'] = '已发送';
                        break;
                }
                switch($v['type']){
                    case 1 :
                        $v['type'] = '普通';
                        break;
                    case 2 :
                        $v['type'] = '已特殊';
                        break;
                }
                echo $k.","
                    .$v["title"]."\t,"
                    .$v["value"]."\t,"
                    .$v["type"]."\t,"
                    .$v["limit_value"]."\t,"
                    .$v["number"]."\t,"
                    .$v["balance"]."\t,"
                    .$v["used_count"]."\t,"
                    .$v["pay_number"]."\t,"
                    .$v["end_time"]."\t,"
                    .$v["is_send"]."\t,"
                    ."\n";
            }
        }else{
            $url =$_SERVER['REQUEST_URI'];
            session('url',$url);
            return $this->fetch();
        }
    }
    /**
     *@添加普通优惠券
     */
    public function insert_common_coupon(){
        if(Request::instance()->isAjax()){
            $data = Request::instance()->post();
            $obj = model('Coupon');
            $result = $obj->edit_common($data,'common');
        }else{
          return  $this->fetch();
        }
    }

    /**
     *@编辑普通优惠券
     */
    public function edit_common_coupon(){
        if(Request::instance()->isAjax()){
            $data = Request::instance()->post();
            $obj = model('Coupon');
            $result = $obj->edit_common($data,'common');
        }else{
            $id = input('id');
            $re = Db::name('coupon')->where(['coupon_id'=>$id])->find();
            $this->assign(['re'=>$re]);
            return  $this->fetch('marketing/insert_common_coupon');
        }
    }

    public function change_coupon_status(){
        $id = input('id');
        $obj = model('Coupon');
        $result = $obj->change_status($id);
        success($result);
    }

    public function del_coupon(){
        $id = input('ids');
        $obj = model('Coupon');
        $result = $obj->soft_del($id);
        if ($result) {
            return success([ 'info' => '删除记录成功!', 'url' => session('url')]);
        } else {
            return error('删除记录失败!');
        }
    }

    public function copy_coupon(){
        $id = input('id');
        $data = Db::name('coupon')->where(['coupon_id'=>$id])->find();
        if($data){
            unset($data['coupon_id']);
            $data['status'] = 1;
            $result = Db::name('coupon')->insert($data);
            if($result){
                success('复制成功');
            }else{
                error('复制失败');
            }
        }else{
            error('复制失败');
        }
    }
}