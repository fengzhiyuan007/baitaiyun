<?php
namespace app\television\controller;
use think\controller;
use think\Db;
use think\Request;
use think\Validate;
use think\session;
class Caiwu extends Base{
    public function index(){
        return $this->fetch();
    }
    /**
     * 直播收益财务报表
     * @return mixed
     */
    public function anchor(){
        $member =session::get("member");
        $map=[];
        $params = Request::instance()->param();
        $username = $params["username"];
        if($username)   $map['b.username|b.phone|d.title'] = ['like','%'.$username.'%'];
        if($params["member_type"]) $map["a.member_type"] = $params["member_type"];
        $start_time = $params["start_time"];
        $end_time = $params["end_time"];
        //时间
        if($start_time){
            $map["a.date"] = ["gt",urldecode($start_time)];
        }
        if($end_time){
            $map["a.date"] = ['lt',urldecode($end_time)];
        }
        $num  = input('num');
        if(empty($num)){
            $num=10;
        }
        $count = DB::name("give_gift")
                ->alias('a')
                ->join("__MEMBER__ b","a.user_id2 = b.member_id","LEFT")
                ->join("__GIFT__ c","a.gift_id = c.gift_id")
                ->join("__LIVE__ d","a.live_id = d.live_id")
                ->where(["a.tv_id"=>$member["member_id"]])
                ->where($map)
                ->count();
        $list = DB::name("give_gift")
                ->field("a.*,b.username,b.header_img,b.phone,c.*,d.title")
                ->alias('a')
                ->join("__MEMBER__ b","a.user_id2 = b.member_id","LEFT")
                ->join("__GIFT__ c","a.gift_id = c.gift_id",'LEFT')
                ->join("__LIVE__ d","a.live_id = d.live_id")
                ->where(["a.tv_id"=>$member["member_id"]])
                ->where($map)
                ->order("a.intime desc")
                ->paginate($num,false,["query"=>$params]);
        $system = DB::name("system")->where(["id"=>1])->find();
        $change_scale = $change_scale = $system["convert_scale1"]/$system["convert_scale2"];
        $list->toArray();
        foreach ($list as $k=>$v){
            $platform_scale = explode(',',$v["dashang_scale"])[0]/100;
            $anchor_scale = explode(",",$v["dashang_scale"])[1]/100;
            $anchor_amount = $v["price"]*$change_scale*$platform_scale*$anchor_scale;
            $platform_amount = $v["price"]*$change_scale*$platform_scale*(1-$anchor_scale);
            $data = array();
            $data = $v;
            $data['anchor_amount'] = $anchor_amount;
            $data['platform_amount'] = $platform_amount;
            $list->offsetSet($k,$data);
        }
       $this->assign("count",$count);
       $this->assign("list",$list);
       return $this->fetch();
    }
    /**
     * 商户销售报表
     * @return mixed
     */
    public function  merchants(){
        //获取电视台id
        $member =session::get("member");
        $tv_id = $member["member_id"];
        //获取电视台下的商户
        $merchants =array("tv_id"=>$tv_id,"platform_type"=>1);
        $merchants_id = DB::name("Merchants")->where($merchants)->column("member_id");
        if(empty($num)){
            $num =10;
        }
        $params = Request::instance()->param();
        $order_no = $params["order_no"];
        if($order_no)                  $map['a.order_no|c.username|c.phone|b.merchants_name'] = ['like','%'.$order_no.'%'];
        //获取相应对应商户的支付订单信息
        if($params["order_state"]){
            $map["order_state"] = $params["order_state"];
        }else{
            $map['order_state'] = ['in','wait_send','wait_receive','wait_assessment','end'];
        }
        //订单时间
        $start_time = $params["start_time"];
        $end_time = $params["end_time"];
        if($start_time){
            $map["a.create_time"] = ["gt",urldecode($start_time)];
        }
        if($end_time){
            $map["a.create_time"] = ['lt',urldecode($end_time)];
        }
        $map["a.merchants_id"] = ['in',$merchants_id];
        if(!empty($merchants_id)){
            $count = DB::name("order_merchants")
                ->alias("a")
                ->join("__MERCHANTS__ b","a.merchants_id=b.member_id")
                ->join("__MEMBER__ c","a.member_id = c.member_id")
                ->where($map)
                ->count();
            $list = DB::name("order_merchants")
                ->alias("a")
                ->field("a.*,b.merchants_img,b.merchants_name,b.contact_name,b.contact_mobile,c.phone,c.username")
                ->join("__MERCHANTS__ b","a.merchants_id=b.member_id")
                ->join("__MEMBER__ c","a.member_id = c.member_id")
                ->where($map)
                ->paginate($num,false,["query"=>$params]);
            $page = $list->render();
            $this->assign(["count"=>$count,"list"=>$list,'page'=>$page]);
        }else{
                $this->assign(["count"=>0,"list"=>[]]);
        }
        return $this->fetch();
    }

    public function to_withdraw_ticket(){
        $member = session::get("member");
        $tv_id = $member["member_id"];
        $system = Db::name('system')->where(['id'=>1])->find();
        $tv = Db::name('television')->where(['tv_id'=>$tv_id])->find();
        $cash_money =  $system['convert_scale4']/$system['convert_scale3'];
        $tv['money'] = $tv['e_ticket'] * $cash_money;
        if(request()->isAjax()) {
            if($tv['e_ticket']<100)       error('钻石数量少于100');
            $data['e_ticket'] = 0;
            $data['cash_money'] = $tv['cash_money'] + $tv['money'];
            $result = Db::name('television')->where(['tv_id'=>$tv_id])->update($data);
            if($result){
                success(['info'=>'钻石转化成功','url'=>url('Caiwu/to_withdraw_ticket')]);
            }else{
                error('钻石转化失败');
            }
        }else{
            $this->assign(['cash_money'=>$cash_money,'re'=>$tv]);
            return $this->fetch();
        }
    }

    /**
     * 去提现
     */
     public function to_withdraw(){
         $member = session::get("member");
         $tv_id = $member["member_id"];
         if(request()->isAjax()) {
             $res = DB::name("alipay")->where(['user_id'=>$tv_id])->find();
             $television_info = DB::name("television")->where(["tv_id"=>$tv_id])->find();
             $params = Request::instance()->param();
             if(empty($params['withdraw_money'])){
                 error("提现信息有误");
             }
             if((float)$params['withdraw_money'] > $television_info['account_money']){
                 error("账户余额不足");
             }
             $data['relname'] = $params["relname"];
             $data['withdraw_type'] = "银行卡";//$params['where_it_is'];
             $data['withdraw_way'] = $params['alipay'];
             $data['money'] = (float)$params['withdraw_money'];
             $data['k'] = 0;
             $data['intime'] =time();
             $data["user_id"] = $tv_id;
             $data['user_type'] = 2;
             $data['type'] = 2;
             $data['status'] = 1;
             $add = DB::name("withdraw")->insert($data);
             if($add){
                 $upArr['account_money'] = DB::name("television")->where(["tv_id"=>$tv_id])->value("account_money")-$params['withdraw_money'];
                 $upArr['withdraw_money'] = DB::name("television")->where(["tv_id"=>$tv_id])->value("withdraw_money")+$params['withdraw_money'];
                 $update = DB::name("television")->where(["tv_id"=>$tv_id])->update($upArr);
                 success(['info'=>"提现提现成功",'url'=>"/Television/index/index"]);
             }else{
                 error(['info'=>"提现失败"]);
             }

         }else{
             $res = DB::name("alipay")->where(['user_id'=>$tv_id])->find();
             if($res){
                 $res["account_money"] = DB::name("television")->where(['tv_id'=>$tv_id])->value('account_money');
                 $this->assign(['re'=>$res]);
                 return $this->fetch();
             }else{
                 $this->redirect('Index/account');
             }
         }


     }
    /**
     *@提现记录
     */
    public function withdraw(){
        $merchant  = $this->television;
        $param = Request::instance()->param();
        $map['user_id'] = $merchant['member_id'];
        $param['type'] ? $map['type'] = $param['type'] : $map['type'] = 2 ;
        $start_time = input('start_time');
        $end_time = input('end_time');
        if($start_time && !$end_time){
            $start_time = urldecode($start_time);
            $map['intime'] = ['gt',strtotime($start_time)];
        }else if($end_time && !$start_time){
            $end_time = urldecode($end_time);
            $map['intime'] = ['lt',strtotime($end_time)];
        }else if($start_time && $end_time){
            $map['intime'] = ['between',[strtotime($start_time),strtotime($end_time)]];
        }
        $map['user_type'] = '2';
        $type = input('type');
        !empty($type)       &&      $map['type'] = $type;
        $num = input('num');
        $num ? $num :  $num = 10;
        $count = Db::name('withdraw')->where($map)->count();
        $list = Db::name('withdraw')->where($map)
            ->where($map)
            ->order('cash_time desc')
            ->order('intime desc')
            ->paginate($num,false,["query"=>$param]);
        $page = $list->render();
        $sum = Db::name('withdraw')->where($map)->sum('money');
        $this->assign(['count'=>$count,'list'=>$list,'sum'=>$sum,'page'=>$page]);
        return $this->fetch();
    }

}