<?php
namespace app\admin\controller;
use think\Controller;
use think\View;
use think\Db;
use \think\Session;
use \think\Request;
class Finance extends Base{
    /**
     *充值记录
     */
    public function index(){
        $map = [];
        !empty($_GET['pay_type']) && $map['a.pay_type'] = ['like','%'.input('pay_type').'%'];
        !empty($_GET['username']) && $map['b.username|b.phone|a.pay_number'] = ['like','%'.input('username').'%'];
        if(!empty($_GET['start_time'])) $start_time = date("Y-m-d H:i:s",strtotime(input('start_time'))); else $start_time = 0;
        if(!empty($_GET['end_time']))   $end_time = date("Y-m-d H:i:s",strtotime(input('end_time'))); else $end_time = date("Y-m-d H:i:s",time());
        $map['a.intime'] = ['between',[$start_time,$end_time]];
        $map['a.pay_state'] = '2';
        $map['a.is_del'] = '1';
        if (empty($num)){
            $num = 10;
        }
        $this->assign('nus',$num);
        $count = DB::name('Recharge')->alias('a')
            ->join("__MEMBER__ b","a.member_id = b.member_id",'LEFT')
            ->where($map)->count();
        $list  = DB::name('Recharge')->alias('a')
            ->field('a.recharge_record_id,a.pay_number,a.amount,a.meters,a.zeng,a.pay_type,b.username,b.phone,a.intime,b.grade,b.member_id')
            ->join("__MEMBER__ b","a.member_id = b.member_id","LEFT")
            ->where($map)
            ->order("a.intime desc")
            ->paginate($num,false,['query' => Request::instance()->param()]);
        foreach($list as $key=>$val){
            $list[$key]['grade'] = DB::name('Grade')->where(['grade_id'=>$val['grade']])->value('name');
        }
        $sum = DB::name("Recharge")->alias('a')
            ->join("__MEMBER__ b","a.member_id = b.member_id","LEFT")
            ->where($map)
            ->sum('a.amount');
        $this->assign(['list'=>$list,'count'=>$count,'sum'=>$sum]);
        $act = input("act");
        if($act == 'download'){
            $dat = DB::name('Recharge')->alias('a')
                ->field('a.recharge_record_id,a.pay_number,a.amount,a.meters,a.zeng,a.pay_type,b.username,b.phone,a.intime,b.grade,b.member_id')
                ->join("__MEMBER__ b","a.member_id = b.member_id","LEFT")
                ->where($map)
                ->order("a.intime desc")
                ->select();
            $str = '充值记录表格'.date('YmdHis');
            header('Content-Type: application/download');
            header("Content-type:application/vnd.ms-excel");
            header("Content-Disposition:attachment;filename={$str}.csv");
            header('Cache-Control:must-revalidate,post-check=0,pre-check=0');
            header('Expires:0');
            header('Pragma:public');
            echo "\xEF\xBB\xBF"."序号,充值会员,订单号,充值账号,充值金额,支付类型,充值时间\n";
            foreach($dat as $key=>$val){
                $k = $key + 1;
                echo $k.","
                    .$val["username"]."\t,"
                    .$val["pay_number"]."\t,"
                    .$val["phone"]."\t,"
                    .$val["amount"]."\t,"
                    .$val["pay_type"]."\t,"
                    .$val["intime"]."\t,"
                    ."\n";
            }
        }else{
            $url = $_SERVER['REQUEST_URI'];
            session('url',$url);
            return $this->fetch();
        }
    }
    /**
     * @商家提现记录
     */
    public function withdraw(){
        $map=[];
        !empty($_GET['status']) && $map['a.status'] = input('status');
        !empty($_GET['username']) && $map['b.username|b.phone|a.relname|a.withdraw_way'] = ['like','%'.input('username').'%'];
        if(!empty($_GET['start_time'])) $start_time = strtotime(input('start_time')); else $start_time = 0;
        if(!empty($_GET['end_time']))   $end_time = strtotime(input('end_time')); else $end_time = time();
        $map['a.intime'] = ['between',[$start_time,$end_time]];
        if (empty($num)){
            $num = 10;
        }
        $map['a.user_type'] = 1;
        $count = DB::name("Withdraw")->alias('a')
            ->join("__MEMBER__ b","a.user_id = b.member_id")
            ->where($map)->count(); // 查询满足要求的总记录数
        $sum = DB::name("Withdraw")->alias('a')
            ->join("__MEMBER__ b","a.user_id = b.member_id")
            ->where($map)->sum("money");
        $data=DB::name("Withdraw")->alias('a')
            ->field('a.*,b.username,b.phone,b.member_id as uid')
            ->join("__MEMBER__ b","a.user_id = b.member_id")
            ->where($map)
            ->order('a.intime desc')
            ->paginate($num,false);
        $this->assign(['list'=>$data,'count'=>$count,"sum"=>$sum]);
        $act = input('act');
        if($act == 'download'){
            $dat=DB::name("Withdraw")->alias('a')
                ->field('a.*,b.username,b.phone,b.member_id as uid')
                ->join("__MEMBER__ b","a.user_id = b.member_id")
                ->where($map)
                ->order('a.intime desc')
                ->select();
            $str = '商家提现统计表格'.date('YmdHis');
            header('Content-Type: application/download');
            header("Content-type:application/vnd.ms-excel");
            header("Content-Disposition:attachment;filename={$str}.csv");
            header('Cache-Control:must-revalidate,post-check=0,pre-check=0');
            header('Expires:0');
            header('Pragma:public');
            echo "\xEF\xBB\xBF"."序号,名称,手机号,金额,账户名,账户,类型,状态,申请时间,返现时间\n";
            foreach($dat as $key=>$val){
                switch($val['pay_type']){
                    case 1:
                        $val['withdraw_type'] = '支付宝';
                        break;
                    case 2:
                        $val['withdraw_type'] = '银行卡';
                        break;
                }
                switch($val['status']){
                    case 1:
                        $val['status'] = '申请中';
                        break;
                    case 2:
                        $val['status'] = '冻结中';
                        break;
                    case 3:
                        $val['status'] = '已返现';
                        break;
                }
                $k = $key + 1;
                echo $k.","
                    .$val["username"]."\t,"
                    .$val["phone"]."\t,"
                    .$val["money"]."\t,"
                    .$val["relname"]."\t,"
                    .$val["withdraw_way"]."\t,"
                    .$val["withdraw_type"]."\t,"
                    .$val["status"]."\t,"
                    .date('Y-m-d H:i:s',$val["intime"])."\t,"
                    .date('Y-m-d H:i:s',$val["cash_time"])."\t,"
                    ."\n";
            }
        }else{
            $url = $_SERVER['REQUEST_URI'];
            session('url',$url);
            return $this->fetch();
        }
    }

    public function tv_withdraw(){
        $map=[];
        !empty($_GET['status']) && $map['a.status'] = input('status');
        !empty($_GET['username']) && $map['b.username|b.phone|a.relname|a.withdraw_way'] = ['like','%'.input('username').'%'];
        if(!empty($_GET['start_time'])) $start_time = strtotime(input('start_time')); else $start_time = 0;
        if(!empty($_GET['end_time']))   $end_time = strtotime(input('end_time')); else $end_time = time();
        $map['a.intime'] = ['between',[$start_time,$end_time]];
        if (empty($num)){
            $num = 10;
        }
        $map['a.user_type'] = 2;
        $count = DB::name("Withdraw")->alias('a')
            ->join("th_television b","a.user_id = b.tv_id")
            ->where($map)->count(); // 查询满足要求的总记录数
        $sum = DB::name("Withdraw")->alias('a')
            ->join("th_television b","a.user_id = b.tv_id")
            ->where($map)->sum("money");
        $data=DB::name("Withdraw")->alias('a')
            ->field('a.*,b.username,b.phone,b.tv_id as uid')
            ->join("th_television b","a.user_id = b.tv_id")
            ->where($map)
            ->order('a.intime desc')
            ->paginate($num,false);
        $this->assign(['list'=>$data,'count'=>$count,"sum"=>$sum]);
        $act = input('act');
        if($act == 'download'){
            $dat=DB::name("Withdraw")->alias('a')
                ->field('a.*,b.username,b.phone,b.tv_id as uid')
                ->join("th_television b","a.user_id = b.tv_id")
                ->where($map)
                ->order('a.intime desc')
                ->select();
            $str = '电视台提现统计表格'.date('YmdHis');
            header('Content-Type: application/download');
            header("Content-type:application/vnd.ms-excel");
            header("Content-Disposition:attachment;filename={$str}.csv");
            header('Cache-Control:must-revalidate,post-check=0,pre-check=0');
            header('Expires:0');
            header('Pragma:public');
            echo "\xEF\xBB\xBF"."序号,名称,手机号,金额,账户名,账户,类型,状态,申请时间,返现时间\n";
            foreach($dat as $key=>$val){
                switch($val['pay_type']){
                    case 1:
                        $val['withdraw_type'] = '支付宝';
                        break;
                    case 2:
                        $val['withdraw_type'] = '银行卡';
                        break;
                }
                switch($val['status']){
                    case 1:
                        $val['status'] = '申请中';
                        break;
                    case 2:
                        $val['status'] = '冻结中';
                        break;
                    case 3:
                        $val['status'] = '已返现';
                        break;
                }
                $k = $key + 1;
                echo $k.","
                    .$val["username"]."\t,"
                    .$val["phone"]."\t,"
                    .$val["money"]."\t,"
                    .$val["relname"]."\t,"
                    .$val["withdraw_way"]."\t,"
                    .$val["withdraw_type"]."\t,"
                    .$val["status"]."\t,"
                    .date('Y-m-d H:i:s',$val["intime"])."\t,"
                    .date('Y-m-d H:i:s',$val["cash_time"])."\t,"
                    ."\n";
            }
        }else{
            $url = $_SERVER['REQUEST_URI'];
            session('url',$url);
            return $this->fetch();
        }
    }
    /**
     *编辑审核信息
     */
    public function edit_withdraw(){
        $params = Request::instance()->param();
        if(Request::instance()->isPost()){
            $status = input('status');
            $result = DB::name('Withdraw')->where(['withdraw_id'=>$params["id"]])->update(['status'=>$status,'uptime'=>time(),'cash_time'=>time()]);
            if ($result) {
                echo json_encode(['status' => "ok", 'info' => '修改记录成功!', 'url' => session('url')]);
                die;
            } else {
                echo json_encode(['status' => "error", 'info' => '修改记录失败!']);
                die;
            }
        }else{
            $this->view->engine->layout(false);
            $id = $params["id"];
            $re = DB::name("Withdraw")->alias('a')
                ->field('a.*,b.username,b.phone')
                ->join("__MEMBER__ b", "a.user_id = b.member_id")
                ->where(['a.withdraw_id'=>$id])
                ->find();
            $this->assign('re',$re);
            return $this->fetch();
        }
    }
    /**
     *编辑电视审核信息
     */
    public function edit_tv_withdraw(){
        $params = Request::instance()->param();
        if(Request::instance()->isPost()){
            $status = input('status');
            $result = DB::name('Withdraw')->where(['withdraw_id'=>$params["id"]])->update(['status'=>$status,'uptime'=>time(),'cash_time'=>time()]);
            if($result && $status==3){
                $withdraw = DB::name("Withdraw")->where(['withdraw_id' =>$params["id"]])->find();
                Db::name("television")->where(["tv_id"=>$withdraw['user_id']])->setDec("withdraw_money",$withdraw["money"]);
                Db::name("television")->where(["tv_id"=>$withdraw['user_id']])->setInc("withdrawal_money",$withdraw["money"]);
            }
            if ($result) {
                echo json_encode(['status' => "ok", 'info' => '修改记录成功!', 'url' => session('url')]);
                die;
            } else {
                echo json_encode(['status' => "error", 'info' => '修改记录失败!']);
                die;
            }
        }else{
            $this->view->engine->layout(false);
            $id = $params["id"];
            $re = DB::name("Withdraw")->alias('a')
                ->field('a.*,b.username,b.phone')
                ->join("__TELEVISION__ b", "a.user_id = b.tv_id")
                ->where(['a.withdraw_id'=>$id])
                ->find();
            $this->assign('re',$re);
            return $this->fetch();
        }
    }
    /**
     *@真实删除订单
     */
    public function del_recharge(){
        if(Request::instance()->isPost()) {
            $id = input('ids');
            $result = DB::name('Recharge')->where('recharge_record_id','in',$id)->update(['is_del'=>2]);
            if ($result) {
                echo json_encode(['status' => "ok", 'info' => '删除记录成功!', 'url' => session('url')]);
            } else {
                echo json_encode(['status' => "error", 'info' => '删除记录失败!']);
            }
        }
    }
    /**
     * 送礼记录
     */
    public function give_gift(){
        !empty($_GET['username']) && $map['b.username|b.phone'] = ['like','%'.input('username').'%'];
        if(!empty($_GET['start_time'])) $start_time = strtotime(input('start_time')); else $start_time = 0;
        if(!empty($_GET['end_time']))   $end_time = strtotime(input('end_time')); else $end_time = time();
        $map['a.intime'] = ['between',[$start_time,$end_time]];
        $params = Request::instance()->param();
        $num = input("num");
        if(empty($num));$num=10;
        $count= DB::name("give_gift")->alias("a")
            ->join("__MEMBER__ b","a.user_id2 = b.member_id","left")
            ->join("th_gift_earnings c","a.give_gift_id = c.give_gift_id","left")
            ->join("th_gift d","a.gift_id = d.gift_id","left")
            ->where($map)
            ->count();
        $sum = DB::name("give_gift")->alias("a")
            ->field("a.*,b.username,b.phone,b.header_img,c.anchor_ratio,c.anchor_amount,c.platform_ratio,c.spread_tv,c.spread_tv_ratio,c.spread_tv_amount,
            c.platform_amount,d.name,d.price,c.level_one_tv,c.level_two_tv,c.level_three_tv,e.username as musername")
            ->join("__MEMBER__ b","a.user_id2 = b.member_id","left")
            ->join("th_gift_earnings c","a.give_gift_id = c.give_gift_id","left")
            ->join("th_gift d","a.gift_id = d.gift_id","left")
            ->join("__MEMBER__ e","a.user_id = e.member_id","left")
            ->where($map)->sum('c.platform_amount');
        $sum1 = DB::name("give_gift")->alias("a")
            ->field("a.*,b.username,b.phone,b.header_img,c.anchor_ratio,c.anchor_amount,c.platform_ratio,c.spread_tv,c.spread_tv_ratio,c.spread_tv_amount,
            c.platform_amount,d.name,d.price,c.level_one_tv,c.level_two_tv,c.level_three_tv,e.username as musername")
            ->join("__MEMBER__ b","a.user_id2 = b.member_id","left")
            ->join("th_gift_earnings c","a.give_gift_id = c.give_gift_id","left")
            ->join("th_gift d","a.gift_id = d.gift_id","left")
            ->join("__MEMBER__ e","a.user_id = e.member_id","left")
            ->where($map)->sum('d.price * a.number');
        $list = DB::name("give_gift")->alias("a")
            ->field("a.*,b.username,b.phone,b.header_img,c.anchor_ratio,c.anchor_amount,c.platform_ratio,c.spread_tv,c.spread_tv_ratio,c.spread_tv_amount,
            c.platform_amount,d.name,d.price,c.level_one_tv,c.level_two_tv,c.level_three_tv,e.username as musername")
            ->join("__MEMBER__ b","a.user_id2 = b.member_id","left")
            ->join("th_gift_earnings c","a.give_gift_id = c.give_gift_id","left")
            ->join("th_gift d","a.gift_id = d.gift_id","left")
            ->join("__MEMBER__ e","a.user_id = e.member_id","left")
            ->order("a.intime desc")
            ->where($map)
            ->paginate($num,false,["query"=>$params]);
        $list->toArray();
        foreach ($list as $k=>$v){
            $data = array();
            $data = $v;
            $data['total'] = $v['jewel'] * $v['number'];
            if(!empty($v['spread_tv'])){
                $data['spread_tv'] = Db::name('television')->where(['tv_id'=>$v['spread_tv']])->value('username');
            }
            $list->offsetSet($k,$data);
        }

        $act = input('act');
        if($act == 'download'){
            $dat = DB::name("give_gift")->alias("a")
                ->field("a.*,b.username,b.phone,b.header_img,c.anchor_ratio,c.anchor_amount,c.platform_ratio,c.spread_tv,c.spread_tv_ratio,c.spread_tv_amount,
            c.platform_amount,d.name,d.price,c.level_one_tv,c.level_two_tv,c.level_three_tv,e.username as musername,e.phone as mphone,c.level_one_tv,c.level_one_amount,c.level_one_ratio,
            c.level_two_tv,c.level_two_amount,c.level_two_ratio,c.level_three_tv,c.level_three_amount,c.level_three_ratio,c.other_amount")
                ->join("__MEMBER__ b","a.user_id2 = b.member_id","left")
                ->join("th_gift_earnings c","a.give_gift_id = c.give_gift_id","left")
                ->join("th_gift d","a.gift_id = d.gift_id","left")
                ->join("__MEMBER__ e","a.user_id = e.member_id","left")
                ->order("a.intime desc")
                ->where($map)->select();
            $str = '送礼记录统计表格'.date('YmdHis');
            header('Content-Type: application/download');
            header("Content-type:application/vnd.ms-excel");
            header("Content-Disposition:attachment;filename={$str}.csv");
            header('Cache-Control:must-revalidate,post-check=0,pre-check=0');
            header('Expires:0');
            header('Pragma:public');
            echo "\xEF\xBB\xBF"."序号,送礼会员,会员账号,收礼主播,主播账号,礼物,单价,数量,总价,主播收益钻石数,比例,平台收益钻石数,比例,用户电视台,收益钻石数,比例,总电视台收益钻石数,比例,区县电视台,收益钻石,比例,城市电视台,收益钻石,比例,省级电视台,收益钻石,比例,平台剩余,剩余比例,送礼时间\n";
            foreach ($dat as $k=>$v){
                $v['total'] = $v['jewel'] * $v['number'];
                if(!empty($v['spread_tv'])){
                    $v['spread_tv'] = Db::name('television')->where(['tv_id'=>$v['spread_tv']])->value('username');
                }else{
                    $v['spread_tv'] = '';
                }
                if(!empty($v['level_one_tv']) || !empty($v['level_two_tv']) || !empty($v['level_three_tv'])){
                    $v['anchor_amount1'] = '';
                    $v['anchor_ratio1'] = '';
                    $v['other_ratio'] = 100 - $v['level_one_ratio'] - $v['level_two_ratio'] - $v['level_three_ratio'];
                }else{
                    $v['anchor_amount1'] = $v['anchor_amount'];
                    $v['anchor_ratio1'] = $v['anchor_ratio'];
                    $v['anchor_amount'] = '';
                    $v['anchor_ratio'] = '';
                    $v['other_ratio'] = '';
                }
                if($v['level_one_tv']){
                    $v['level_one_tv'] = Db::name('television')->where(['tv_id'=>$v['level_one_tv']])->value('username');
                }else{
                    $v['level_one_tv'] = '';
                }
                if($v['level_two_tv']){
                    $v['level_two_tv'] = Db::name('television')->where(['tv_id'=>$v['level_two_tv']])->value('username');
                }else{
                    $v['level_two_tv'] = '';
                }
                if($v['level_three_tv']){
                    $v['level_three_tv'] = Db::name('television')->where(['tv_id'=>$v['level_three_tv']])->value('username');
                }else{
                    $v['level_three_tv'] = '';
                }

                $key = $k + 1;
                echo $key.","
                    .$v["musername"]."\t,"
                    .$v["mphone"]."\t,"
                    .$v["username"]."\t,"
                    .$v["phone"]."\t,"
                    .$v["name"]."\t,"
                    .$v["price"]."\t,"
                    .$v["number"]."\t,"
                    .$v["total"]."\t,"
                    .$v["anchor_amount1"]."\t,"
                    .$v["anchor_ratio1"]."\t,"
                    .$v["platform_amount"]."\t,"
                    .$v["platform_ratio"]."\t,"
                    .$v["spread_tv"]."\t,"
                    .$v["spread_tv_amount"]."\t,"
                    .$v["spread_tv_ratio"]."\t,"
                    .$v["anchor_amount"]."\t,"
                    .$v["anchor_ratio"]."\t,"
                    .$v["level_one_tv"]."\t,"
                    .$v["level_one_amount"]."\t,"
                    .$v["level_one_ratio"]."\t,"
                    .$v["level_two_tv"]."\t,"
                    .$v["level_two_amount"]."\t,"
                    .$v["level_two_ratio"]."\t,"
                    .$v["level_three_tv"]."\t,"
                    .$v["level_three_amount"]."\t,"
                    .$v["level_three_ratio"]."\t,"
                    .$v["other_amount"]."\t,"
                    .$v["other_ratio"]."\t,"
                    .date('Y-m-d H:i:s',$v["intime"])."\t,"
                    ."\n";
            }
            exit;
        }else{
            $page = $list->render();
            $this->assign(["count"=>$count,"list"=>$list,"page"=>$page,'sum'=>$sum,'sum1'=>$sum1]);
            return $this->fetch();
        }
    }

    /**
     *@送礼记录详情
     */
    public function give_gift_show(){
        $id = input('id');
        $re = Db::name('gift_earnings')->where(['give_gift_id'=>$id])->find();
        if($re){
            if($re['level_one_tv']){
                $re['level_one_tv'] = Db::name('television')->where(['tv_id'=>$re['level_one_tv']])->value('username');
            }else{
                $re['level_one_tv'] = '';
            }
            if($re['level_two_tv']){
                $re['level_two_tv'] = Db::name('television')->where(['tv_id'=>$re['level_two_tv']])->value('username');
            }else{
                $re['level_two_tv'] = '';
            }
            if($re['level_three_tv']){
                $re['level_three_tv'] = Db::name('television')->where(['tv_id'=>$re['level_three_tv']])->value('username');
            }else{
                $re['level_three_tv'] = '';
            }
            $re['other_ratio'] = 100 - $re['level_one_ratio'] - $re['level_two_ratio'] - $re['level_three_ratio'];
        }
        $this->assign(['re'=>$re]);
        $this->view->engine->layout(false);
        return $this->fetch();
    }

    public function goods_settlement(){
        $params = Request::instance()->param();
        $num = input("num");
        if(empty($num));$num=10;
        !empty($_GET['username']) && $map['b.order_no'] = ['like','%'.input('username').'%'];
        $start_time = input('start_time');
        $end_time = input('end_time');
        if($start_time && !$end_time){
            $start_time = urldecode($start_time);
            $map['a.create_time'] = ['gt',$start_time];
        }else if($end_time && !$start_time){
            $end_time = urldecode($end_time);
            $map['a.create_time'] = ['lt',$end_time];
        }else if($start_time && $end_time){
            $start_time = urldecode($start_time);
            $end_time = urldecode($end_time);
            $map['a.create_time'] = ['between',[$start_time,$end_time]];
        }
        $count = Db::name('order_goods_settlement')->alias('a')
               ->join('th_order_merchants b','a.order_merchant_id = b.order_merchants_id')
               ->join('th_order_goods c','a.order_goods_id = c.order_goods_id')
               ->count();
        $list = Db::name('order_goods_settlement')->alias('a')
            ->field('a.*,b.order_no,b.merchants_id,c.goods_num,c.goods_name')
            ->join('th_order_merchants b','a.order_merchant_id = b.order_merchants_id')
            ->join('th_order_goods c','a.order_goods_id = c.order_goods_id')
            //->join('th_member m','a.seller = m.member_id')//m.phone,m.username
            ->order("a.create_time desc")
            ->where($map)
            ->paginate($num,false,["query"=>$params]);
        $sum = Db::name('order_goods_settlement')->alias('a')
            ->field('a.*,b.order_no,c.goods_num,c.goods_name')
            ->join('th_order_merchants b','a.order_merchant_id = b.order_merchants_id')
            ->join('th_order_goods c','a.order_goods_id = c.order_goods_id')
            ->order("a.create_time desc")
            ->where($map)->sum('a.platform_amount');
        $list->toArray();
        foreach ($list as $k=>$v){
            $data = array();
            $data = $v;
            if($v['spread_tv']){
                $data['spread_tv'] = Db::name('television')->where(['tv_id'=>$v['spread_tv']])->value('username');
            }else{
                $data['spread_tv'] = '' ;
            }
            if($v['spread_id']){
                $data['spread_id'] = Db::name('television')->where(['tv_id'=>$v['spread_id']])->value('username');
            }else{
                $data['seller'] = Db::name('member')->where(['member_id'=>$v['seller']])->value('username');
                $data['spread_id'] = '' ;
            }
            if($v['seller']){
                $data['seller'] = Db::name('member')->where(['member_id'=>$v['seller']])->value('username');
            }else{
                $data['seller'] = '';
            }
            $data['merchants_name'] = Db::name('merchants')->where(['member_id'=>$v['merchants_id']])->value('merchants_name');
            $list->offsetSet($k,$data);
        }
        $act = input('act');
        if($act == 'download'){
           $dat = Db::name('order_goods_settlement')->alias('a')
                ->field('a.*,b.order_no,b.merchants_id,c.goods_num,c.goods_name')
                ->join('th_order_merchants b','a.order_merchant_id = b.order_merchants_id')
                ->join('th_order_goods c','a.order_goods_id = c.order_goods_id')
                ->order("a.create_time desc")
                ->where($map)->select();
            $str = '结算记录统计表格'.date('YmdHis');
            header('Content-Type: application/download');
            header("Content-type:application/vnd.ms-excel");
            header("Content-Disposition:attachment;filename={$str}.csv");
            header('Cache-Control:must-revalidate,post-check=0,pre-check=0');
            header('Expires:0');
            header('Pragma:public');
            echo "\xEF\xBB\xBF"."序号,订单号,商品名称,购买数量,总金额,商家名称,商家收益,比例,平台收益,比例,用户电视台,收益,比例,商家电视台,收益,比例,销售主播,收益,比例,总电视台收益,比例,区县电视台,收益,比例,城市电视台,收益,比例,省级电视台,收益,比例,平台剩余,剩余比例,结算时间\n";
            foreach ($dat as $k=>$v){
                if($v['spread_tv']){
                    $v['spread_tv'] = Db::name('television')->where(['tv_id'=>$v['spread_tv']])->value('username');
                }else{
                    $v['spread_tv'] = '' ;
                }
                if($v['spread_id']){
                    $v['spread_id'] = Db::name('television')->where(['tv_id'=>$v['spread_id']])->value('username');
                }else{
                    $v['spread_id'] = '' ;
                }
                if($v['seller']){
                    $v['seller'] = Db::name('member')->where(['member_id'=>$v['seller']])->value('username');
                }else{
                    $v['seller'] = '';
                }
                $v['merchants_name'] = Db::name('merchants')->where(['member_id'=>$v['merchants_id']])->value('merchants_name');
                if(!empty($v['level_one_tv']) || !empty($v['level_two_tv']) || !empty($v['level_three_tv'])){
                    $v['seller_amount1'] = '';
                    $v['seller_ratio1'] = '';
                    $v['other_ratio'] = 100 - $v['level_one_ratio'] - $v['level_two_ratio'] - $v['level_three_ratio'];
                }else{
                    $v['seller_amount1'] = $v['seller_amount'];
                    $v['seller_ratio1'] = $v['seller_ratio'];
                    $v['seller_amount'] = '';
                    $v['seller_ratio'] = '';
                    $v['other_ratio'] = '';
                }
                if($v['level_one_tv']){
                    $v['level_one_tv'] = Db::name('television')->where(['tv_id'=>$v['level_one_tv']])->value('username');
                }else{
                    $v['level_one_tv'] = '';
                }
                if($v['level_two_tv']){
                    $v['level_two_tv'] = Db::name('television')->where(['tv_id'=>$v['level_two_tv']])->value('username');
                }else{
                    $v['level_two_tv'] = '';
                }
                if($v['level_three_tv']){
                    $v['level_three_tv'] = Db::name('television')->where(['tv_id'=>$v['level_three_tv']])->value('username');
                }else{
                    $v['level_three_tv'] = '';
                }

                $key = $k + 1;
                echo $key.","
                    .$v["order_no"]."\t,"
                    .$v["goods_name"]."\t,"
                    .$v["goods_num"]."\t,"
                    .$v["settlement_price"]."\t,"
                    .$v["merchants_name"]."\t,"
                    .$v["merchants_amount"]."\t,"
                    .$v["merchants_ratio"]."\t,"
                    .$v["platform_amount"]."\t,"
                    .$v["platform_ratio"]."\t,"
                    .$v["spread_tv"]."\t,"
                    .$v["spread_tv_amount"]."\t,"
                    .$v["spread_tv_ratio"]."\t,"
                    .$v["spread_id"]."\t,"
                    .$v["spread_amount"]."\t,"
                    .$v["spread_ratio"]."\t,"
                    .$v["seller"]."\t,"
                    .$v["seller_amount1"]."\t,"
                    .$v["seller_ratio1"]."\t,"
                    .$v["seller_amount"]."\t,"
                    .$v["seller_ratio"]."\t,"
                    .$v["level_one_tv"]."\t,"
                    .$v["level_one_amount"]."\t,"
                    .$v["level_one_ratio"]."\t,"
                    .$v["level_two_tv"]."\t,"
                    .$v["level_two_amount"]."\t,"
                    .$v["level_two_ratio"]."\t,"
                    .$v["level_three_tv"]."\t,"
                    .$v["level_three_amount"]."\t,"
                    .$v["level_three_ratio"]."\t,"
                    .$v["other_amount"]."\t,"
                    .$v["other_ratio"]."\t,"
                    .$v["create_time"]."\t,"
                    ."\n";
            }
            exit;
        }else{
            $page = $list->render();
            $this->assign(['count'=>$count,'list'=>$list,'page'=>$page,'sum'=>$sum]);
            return $this->fetch();
        }
    }

    public function goods_settlement_view(){
        $id = input('id');
        $re = Db::name('order_goods_settlement')->where(['order_goods_settlement'=>$id])->find();
        if($re){
            if($re['level_one_tv']){
                $re['level_one_tv'] = Db::name('television')->where(['tv_id'=>$re['level_one_tv']])->value('username');
            }else{
                $re['level_one_tv'] = '';
            }
            if($re['level_two_tv']){
                $re['level_two_tv'] = Db::name('television')->where(['tv_id'=>$re['level_two_tv']])->value('username');
            }else{
                $re['level_two_tv'] = '';
            }
            if($re['level_three_tv']){
                $re['level_three_tv'] = Db::name('television')->where(['tv_id'=>$re['level_three_tv']])->value('username');
            }else{
                $re['level_three_tv'] = '';
            }

            if($re['spread_id']){
                $re['spread'] = Db::name('television')->where(['tv_id'=>$re['spread_id']])->value('username');
            }

        }
        $re['other_ratio'] = 100 - $re['level_one_ratio'] - $re['level_two_ratio'] - $re['level_three_ratio'];
        $this->assign(['re'=>$re]);
        $this->view->engine->layout(false);
        return $this->fetch();
    }
}