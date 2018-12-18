<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/10/30
 * Time: 上午11:09
 */

namespace app\television\controller;

use think\Request;
use think\Session;
use think\Db;
use think\Validate;
class Earnings extends Base{
    protected $tv_id = '';
    public function _initialize()
    {
        parent::_initialize();
        $tv_info = Session::get("member");
        $this->tv_id = $tv_info['member_id'];
    }
    /**
     * 获取商户数组集
     */
    protected function get_merchants_id(){
        $tv_id = $this->tv_id;
        $map['a.is_delete'] = 0;
        $map["b.type"] = 2;
        $map["a.tv_id"] = $tv_id;
        $map["a.platform_type"] =1;
        $merchants_id =  DB::name("Merchants")->alias('a')
            ->join('__MEMBER__ b','a.member_id = b.member_id')
            ->where($map)
            ->column("a.member_id");
        if(empty($merchants_id)){
            return [];
        }else{
            return $merchants_id;
        }
    }
    /**
     * 获取主播数组集
     */
    protected function get_anchor_id(){
        $tv_id = $this->tv_id;
        $merchants_id = $this->get_merchants_id();
        $map["b.type"] = 3;
        $map["a.tv_id"] = $tv_id;
        $anchor_id = DB::name("anchor_info")
            ->alias("a")
            ->join('__MEMBER__ b','a.anchor_id = b.member_id')
            ->where($map)
            ->column("a.anchor_id");
        $anchor_id = empty($anchor_id) ? [] : $anchor_id;
        $anchor_arr = array_merge($anchor_id,$merchants_id);
        return $anchor_arr;
    }
    /**
     * 获取销售订单总数
     */
    protected function get_order_count($map){
        $count = DB::name('order_goods_settlement')->alias('a')
            ->join('__MERCHANTS__ b','a.merchants_id = b.member_id')
            ->where($map)
            ->count();
        return $count;
    }
    /**
     * 获取销售订单总收益
     */
    protected function get_order_sum($map,$string,$code){
        $map1 = $map;
        $map2 = $map;
        $map1['a.'.$string] = $this->tv_id;
        $map2['a.spread_id'] = $this->tv_id;
        $count1 = DB::name('order_goods_settlement')->alias('a')
            ->join('__MERCHANTS__ b','a.merchants_id = b.member_id')
            ->where($map1)
            ->sum($code);
        $count2 = DB::name('order_goods_settlement')->alias('a')
            ->join('__MERCHANTS__ b','a.merchants_id = b.member_id')
            ->where($map2)
            ->sum('spread_amount');
        return $count1 + $count2;
    }
    /**
     *订单查询条件
     */
    protected function get_order_where($params){
        $order_no = $params['order_no'];
        !empty($order_no)   &&      $map['b.merchants_name|b.contact_name'] = ['like','%'.$order_no.'%'];
        $start_time = $params['start_time'];
        $end_time = $params['end_time'];
        if($start_time && !$end_time){
            $start_time = urldecode($start_time);
            $map['a.create_time'] = ['gt',$start_time];
        }else if(!$start_time & $end_time){
            $end_time = urldecode($end_time);
            $map['a.create_time'] = ['lt',$end_time];
        }else if($end_time){
            $start_time = urldecode($start_time);
            $end_time = urldecode($end_time);
            $map['a.create_time'] = ['between',[$start_time,$end_time]];
        }
        $map['a.is_delete'] = '0';
        return $map;
    }
    /**
     * 直播打赏查询条件
     */
    public function get_live_where($params){
        $give_gift = $params['give_gift'];
        !empty($give_gift)     &&         $map['b.username|b.phone'] = ['like','%'.$give_gift.'%'];
        $start_time = $params['start_time'];
        $end_time = $params['end_time'];
        if($start_time && !$end_time){
            $start_time = urldecode($start_time);
            $map['a.create_time'] = ['gt',$start_time];
        }else if(!$start_time & $end_time){
            $end_time = urldecode($end_time);
            $map['a.create_time'] = ['lt',$end_time];
        }else if($end_time){
            $start_time = urldecode($start_time);
            $end_time = urldecode($end_time);
            $map['a.create_time'] = ['between',[$start_time,$end_time]];
        }
        return $map;
    }
    /**
     * @直播打赏总条数
     */
    public function get_live_count($map){
        $count = DB::name('gift_earnings')->alias('a')
            ->join('__MEMBER__ b','a.anchor_id = b.member_id','left')
            ->where($map)
            ->count();
        return $count;
    }

    /**
     * @直播打赏总额
     */
    public function get_live_ticket($map,$code){
        $count = DB::name('gift_earnings')->alias('a')
            ->join('__MEMBER__ b','a.anchor_id = b.member_id','left')
            ->where($map)
            ->sum($code);
        return $count;
    }

    /**
     * 今日销售收益
     */
    public function today_sell(){
        $params = Request::instance()->param();
        $tv = Db::name('television')->where(['tv_id'=>$this->tv_id])->find();
        $map  = $this->get_order_where($params);
        $where = $map;
        switch ($tv['tv_type']){
            case 1://省级电视台
                $map['a.level_three_tv|a.spread_id|a.spread_tv'] = $this->tv_id;
                $code = 'level_three_amount';
                $string = 'level_three_tv';
                break;
            case 2://城市台
                $map['a.level_two_tv|a.spread_id|a.spread_tv'] = $this->tv_id;
                $code = 'level_two_amount';
                $string = 'level_two_tv';
                break;
            case 3://城市台
                $map['a.level_one_tv|a.spread_id|a.spread_tv'] = $this->tv_id;
                $code = 'level_one_amount';
                $string = 'level_one_tv';
                break;

        }
        $today = date("Y-m-d 00:00:00",time());
        $map['a.create_time'] = ['gt',$today];
        $where['a.create_time'] = ['gt',$today];
        $count = $this->get_order_count($map);
        $sum = $this->get_order_sum($map,$string,$code);
        $num  = $params['num'];
        if(empty($num)){
            $num = 10;
        }
        $list = DB::name('order_goods_settlement')->alias('a')
            ->field('a.*,b.merchants_name,b.merchants_img,b.contact_name')
            ->join('__MERCHANTS__ b','a.merchants_id = b.member_id','left')
            ->where($map)
            ->order("a.create_time desc")
            ->paginate($num,false,["query"=>$params]);
        if($params['act'] =='download'){
            $dat = DB::name('order_goods_settlement')->alias('a')
                ->field('a.*,b.merchants_name,b.merchants_img,b.contact_name')
                ->join('__MERCHANTS__ b','a.merchants_id = b.member_id','left')
                ->where($map)
                ->order("a.create_time desc")
                ->select();
            $str = '商品收益'.date('YmdHis');
            header('Content-Type: application/download');
            header("Content-type:application/vnd.ms-excel");
            header("Content-Disposition:attachment;filename={$str}.csv");
            header('Cache-Control:must-revalidate,post-check=0,pre-check=0');
            header('Expires:0');
            header('Pragma:public');
            echo "\xEF\xBB\xBF"."序号,商家信息,结算金额,商家,商家比例,商家电视台,商家电视台比例,用户电视台,用户电视台比例,总的电视台,总的电视台比例,区县电视台,区县电视台比例,城市电视台,城市电视台比例,省级电视台,省级电视台比例,时间\n";
            foreach ($dat as $k=>$v) {
                if($v['spread_id'] != $this->tv_id){
                    $v["spread_amount"] =  '';
                    $v["spread_ratio"] =  '';
                }
                if($v['spread_tv'] != $this->tv_id){
                    $v["spread_tv_amount"] =  '';
                    $v["spread_tv_ratio"] =  '';
                }
                if($v['level_one_tv'] != $this->tv_id){
                    $v["level_one_ratio"] =  '';
                    $v["level_one_amount"] =  '';
                }
                if($v['level_two_tv'] != $this->tv_id){
                    $v["level_two_amount"] =  '';
                    $v["level_two_ratio"] =  '';
                }
                if($v['level_three_tv'] != $this->tv_id){
                    $v["level_three_amount"] =  '';
                    $v["level_three_ratio"] =  '';
                }
                $key = $k + 1;
                echo $key . ","
                    . $v["merchants_name"] . "\t,"
                    . $v["settlement_price"] . "\t,"
                    . $v["merchants_amount"] . "\t,"
                    . $v["merchants_ratio"] . "\t,"
                    . $v["spread_amount"] . "\t,"
                    . $v["spread_ratio"] . "\t,"
                    . $v["spread_tv_amount"] . "\t,"
                    . $v["spread_tv_ratio"] . "\t,"
                    . $v["seller_amount"] . "\t,"
                    . $v["seller_ratio"] . "\t,"
                    . $v["level_one_amount"] . "\t,"
                    . $v["level_one_ratio"] . "\t,"
                    . $v["level_two_amount"] . "\t,"
                    . $v["level_two_ratio"] . "\t,"
                    . $v["level_three_amount"] . "\t,"
                    . $v["level_three_ratio"] . "\t,"
                    . $v["create_time"] . "\t,"
                    . "\n";
            }
            exit;
        }
        $page = $list->render();
        $this->assign(['list'=>$list,'count'=>$count,'page'=>$page,'sum'=>$sum,'string'=>$string,'tv_id'=>$this->tv_id]);
        return $this->fetch();
    }
    /**
     * 昨日销售收益
     */
    public function yesterday_sell(){
        $params = Request::instance()->param();
        $tv = Db::name('television')->where(['tv_id'=>$this->tv_id])->find();
        $map  = $this->get_order_where($params);
        $where  = $this->get_order_where($params);
        switch ($tv['tv_type']){
            case 1://省级电视台
                $map['a.level_three_tv|a.spread_id|a.spread_tv'] = $this->tv_id;
                $code = 'level_three_amount';
                $string = 'level_three_tv';
                break;
            case 2://城市台
                $map['a.level_two_tv|a.spread_id|a.spread_tv'] = $this->tv_id;
                $code = 'level_two_amount';
                $string = 'level_two_tv';
                break;
            case 3://城市台
                $map['a.level_one_tv|a.spread_id|a.spread_tv'] = $this->tv_id;
                $code = 'level_one_amount';
                $string = 'level_one_tv';
                break;

        }
        $yesterday = date("Y-m-d 00:00:00",strtotime("-1 day"));
        $today = date("Y-m-d 00:00:00",time());
        $map['a.create_time'] = ['between',[$yesterday,$today]];
        $where['a.create_time'] = ['between',[$yesterday,$today]];
        $count = $this->get_order_count($map);
        $sum = $this->get_order_sum($where,$string,$code);
        $num  = $params['num'];
        if(empty($num)){
            $num = 10;
        }
        $list = DB::name('order_goods_settlement')->alias('a')
            ->field('a.*,b.merchants_name,b.merchants_img,b.contact_name')
            ->join('__MERCHANTS__ b','a.merchants_id = b.member_id','left')
            ->where($map)
            ->order("a.create_time desc")
            ->paginate($num,false,["query"=>$params]);
        if($params['act'] =='download'){
            $dat = DB::name('order_goods_settlement')->alias('a')
                ->field('a.*,b.merchants_name,b.merchants_img,b.contact_name')
                ->join('__MERCHANTS__ b','a.merchants_id = b.member_id','left')
                ->where($map)
                ->order("a.create_time desc")
                ->select();
            $str = '商品收益'.date('YmdHis');
            header('Content-Type: application/download');
            header("Content-type:application/vnd.ms-excel");
            header("Content-Disposition:attachment;filename={$str}.csv");
            header('Cache-Control:must-revalidate,post-check=0,pre-check=0');
            header('Expires:0');
            header('Pragma:public');
            echo "\xEF\xBB\xBF"."序号,商家信息,结算金额,商家,商家比例,商家电视台,商家电视台比例,用户电视台,用户电视台比例,总的电视台,总的电视台比例,区县电视台,区县电视台比例,城市电视台,城市电视台比例,省级电视台,省级电视台比例,时间\n";
            foreach ($dat as $k=>$v) {
                if($v['spread_id'] != $this->tv_id){
                    $v["spread_amount"] =  '';
                    $v["spread_ratio"] =  '';
                }
                if($v['spread_tv'] != $this->tv_id){
                    $v["spread_tv_amount"] =  '';
                    $v["spread_tv_ratio"] =  '';
                }
                if($v['level_one_tv'] != $this->tv_id){
                    $v["level_one_ratio"] =  '';
                    $v["level_one_amount"] =  '';
                }
                if($v['level_two_tv'] != $this->tv_id){
                    $v["level_two_amount"] =  '';
                    $v["level_two_ratio"] =  '';
                }
                if($v['level_three_tv'] != $this->tv_id){
                    $v["level_three_amount"] =  '';
                    $v["level_three_ratio"] =  '';
                }
                $key = $k + 1;
                echo $key . ","
                    . $v["merchants_name"] . "\t,"
                    . $v["settlement_price"] . "\t,"
                    . $v["merchants_amount"] . "\t,"
                    . $v["merchants_ratio"] . "\t,"
                    . $v["spread_amount"] . "\t,"
                    . $v["spread_ratio"] . "\t,"
                    . $v["spread_tv_amount"] . "\t,"
                    . $v["spread_tv_ratio"] . "\t,"
                    . $v["seller_amount"] . "\t,"
                    . $v["seller_ratio"] . "\t,"
                    . $v["level_one_amount"] . "\t,"
                    . $v["level_one_ratio"] . "\t,"
                    . $v["level_two_amount"] . "\t,"
                    . $v["level_two_ratio"] . "\t,"
                    . $v["level_three_amount"] . "\t,"
                    . $v["level_three_ratio"] . "\t,"
                    . $v["create_time"] . "\t,"
                    . "\n";
            }
            exit;
        }
        $page = $list->render();
        $this->assign(['list'=>$list,'count'=>$count,'page'=>$page,'sum'=>$sum,'string'=>$string,'tv_id'=>$this->tv_id]);
        return $this->fetch();
    }
    /**
     *全部销售收益
     */
    public function all_sell(){
        $params = Request::instance()->param();
        $tv = Db::name('television')->where(['tv_id'=>$this->tv_id])->find();
        $map  = $this->get_order_where($params);
        $where  = $this->get_order_where($params);
        switch ($tv['tv_type']){
            case 1://省级电视台
                $map['a.level_three_tv|a.spread_id|a.spread_tv'] = $this->tv_id;
                $code = 'level_three_amount';
                $string = 'level_three_tv';
                break;
            case 2://城市台
                $map['a.level_two_tv|a.spread_id|a.spread_tv'] = $this->tv_id;
                $code = 'level_two_amount';
                $string = 'level_two_tv';
                break;
            case 3://城市台
                $map['a.level_one_tv|a.spread_id|a.spread_tv'] = $this->tv_id;
                $code = 'level_one_amount';
                $string = 'level_one_tv';
                break;

        }
        $count = $this->get_order_count($map);
        $num  = $params['num'];
        if(empty($num)){
            $num = 10;
        }
        $sum = $this->get_order_sum($where,$string,$code);
        $start_time = $params["start_time"];
        $end_time = $params["end_time"];
        //时间
        if($start_time && !$end_time){
            $map["a.create_time"] = ["gt",urldecode($start_time)];
        }
        if(!$end_time && $end_time){
            $map["a.create_time"] = ['lt',urldecode($end_time)];
        }
        if(!$end_time && $end_time){
            $start_time = urldecode($start_time);
            $end_time = urldecode($end_time);
            $map["a.create_time"] = ['between','between',[$start_time,$end_time]];
        }
        $list = DB::name('order_goods_settlement')->alias('a')
            ->field('a.*,b.merchants_name,b.merchants_img,b.contact_name')
            ->join('__MERCHANTS__ b','a.merchants_id = b.member_id','left')
            ->where($map)
            ->order("a.create_time desc")
            ->paginate($num,false,["query"=>$params]);
        if($params['act'] =='download'){
            $dat = DB::name('order_goods_settlement')->alias('a')
                ->field('a.*,b.merchants_name,b.merchants_img,b.contact_name')
                ->join('__MERCHANTS__ b','a.merchants_id = b.member_id','left')
                ->where($map)
                ->order("a.create_time desc")
                ->select();
            $str = '商品收益'.date('YmdHis');
            header('Content-Type: application/download');
            header("Content-type:application/vnd.ms-excel");
            header("Content-Disposition:attachment;filename={$str}.csv");
            header('Cache-Control:must-revalidate,post-check=0,pre-check=0');
            header('Expires:0');
            header('Pragma:public');
            echo "\xEF\xBB\xBF"."序号,商家信息,结算金额,商家,商家比例,商家电视台,商家电视台比例,用户电视台,用户电视台比例,总的电视台,总的电视台比例,区县电视台,区县电视台比例,城市电视台,城市电视台比例,省级电视台,省级电视台比例,时间\n";
            foreach ($dat as $k=>$v) {
                if($v['spread_id'] != $this->tv_id){
                    $v["spread_amount"] =  '';
                    $v["spread_ratio"] =  '';
                }
                if($v['spread_tv'] != $this->tv_id){
                    $v["spread_tv_amount"] =  '';
                    $v["spread_tv_ratio"] =  '';
                }
                if($v['level_one_tv'] != $this->tv_id){
                    $v["level_one_ratio"] =  '';
                    $v["level_one_amount"] =  '';
                }
                if($v['level_two_tv'] != $this->tv_id){
                    $v["level_two_amount"] =  '';
                    $v["level_two_ratio"] =  '';
                }
                if($v['level_three_tv'] != $this->tv_id){
                    $v["level_three_amount"] =  '';
                    $v["level_three_ratio"] =  '';
                }
                $key = $k + 1;
                echo $key . ","
                    . $v["merchants_name"] . "\t,"
                    . $v["settlement_price"] . "\t,"
                    . $v["merchants_amount"] . "\t,"
                    . $v["merchants_ratio"] . "\t,"
                    . $v["spread_amount"] . "\t,"
                    . $v["spread_ratio"] . "\t,"
                    . $v["spread_tv_amount"] . "\t,"
                    . $v["spread_tv_ratio"] . "\t,"
                    . $v["seller_amount"] . "\t,"
                    . $v["seller_ratio"] . "\t,"
                    . $v["level_one_amount"] . "\t,"
                    . $v["level_one_ratio"] . "\t,"
                    . $v["level_two_amount"] . "\t,"
                    . $v["level_two_ratio"] . "\t,"
                    . $v["level_three_amount"] . "\t,"
                    . $v["level_three_ratio"] . "\t,"
                    . $v["create_time"] . "\t,"
                    . "\n";
            }
            exit;
        }
        $page = $list->render();
        $this->assign(['list'=>$list,'count'=>$count,'page'=>$page,'sum'=>$sum,'string'=>$string,'tv_id'=>$this->tv_id]);
        return $this->fetch();
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
    /**
     * 今日直播收益
     */
    public function today_live(){
        $params = Request::instance()->param();
        $map = $this->get_live_where($params);
        $tv = Db::name('television')->where(['tv_id'=>$this->tv_id])->find();

        switch ($tv['tv_type']){
            case 1://省级电视台
                $map['a.level_three_tv|a.spread_tv'] = $this->tv_id;
                $code = 'level_three_amount';
                $string = 'level_three_tv';
                break;
            case 2://城市台
                $map['a.level_two_tv|a.spread_tv'] = $this->tv_id;
                $code = 'level_two_amount';
                $string = 'level_two_tv';
                break;
            case 3://区县台
                $map['a.level_one_tv|a.spread_tv'] = $this->tv_id;
                $code = 'level_one_amount';
                $string = 'level_one_tv';
                break;

        }
        $today = date("Y-m-d 00:00:00",time());
        $map['a.create_time'] = ['gt',$today];
        $count = $this->get_live_count($map);
        $sum = $this->get_live_ticket($map,$code);
        $num  = $params['num'];
        if(empty($num)){
            $num = 10;
        }
        $list = DB::name('gift_earnings')->alias('a')
             ->field('a.*,b.header_img,b.phone,b.username,c.e_ticket')
             ->join('__MEMBER__ b','a.anchor_id=b.member_id','left')
             ->join('th_give_gift c','a.give_gift_id = c.give_gift_id')
             ->where($map)
             ->order("a.create_time desc")
             ->paginate($num,false,["query"=>$params]);
        $page = $list->render();
        if($params['act'] =='download'){
            $dat = DB::name('gift_earnings')->alias('a')
                ->field('a.*,b.header_img,b.phone,b.username,c.e_ticket')
                ->join('__MEMBER__ b','a.anchor_id = b.member_id','left')
                ->join('th_give_gift c','a.give_gift_id = c.give_gift_id')
                ->where($map)
                ->order("a.create_time desc")
                ->select();
            $str = '直播收益'.date('YmdHis');
            header('Content-Type: application/download');
            header("Content-type:application/vnd.ms-excel");
            header("Content-Disposition:attachment;filename={$str}.csv");
            header('Cache-Control:must-revalidate,post-check=0,pre-check=0');
            header('Expires:0');
            header('Pragma:public');
            echo "\xEF\xBB\xBF"."序号,主播账号,礼物总值,平台收益,平台比例,用户电视台,用户电视台比例,区县收益,区县比例,市级收益,市级比例,省级收益,省级比例,时间\n";
            foreach ($dat as $k=>$v) {
                if($v['spread_tv'] != $this->tv_id){
                    $v["spread_tv_amount"] =  '';
                    $v["spread_tv_ratio"] =  '';
                }
                if($v['level_one_tv'] != $this->tv_id){
                    $v["level_one_ratio"] =  '';
                    $v["level_one_amount"] =  '';
                }
                if($v['level_two_tv'] != $this->tv_id){
                    $v["level_two_amount"] =  '';
                    $v["level_two_ratio"] =  '';
                }
                if($v['level_three_tv'] != $this->tv_id){
                    $v["level_three_amount"] =  '';
                    $v["level_three_ratio"] =  '';
                }
                $key = $k + 1;
                echo $key . ","
                    . $v["username"] . "\t,"
                    . $v["phone"] . "\t,"
                    . $v["e_ticket"] . "\t,"
                    . $v["platform_amount"] . "\t,"
                    . $v["platform_ratio"] . "\t,"
                    . $v["spread_tv_amount"] . "\t,"
                    . $v["spread_tv_ratio"] . "\t,"
                    . $v["level_one_amount"] . "\t,"
                    . $v["level_one_ratio"] . "\t,"
                    . $v["level_two_amount"] . "\t,"
                    . $v["level_two_ratio"] . "\t,"
                    . $v["level_three_amount"] . "\t,"
                    . $v["level_three_ratio"] . "\t,"
                    . $v["create_time"] . "\t,"
                    . "\n";
            }
            exit;
        }
        $this->assign(['list'=>$list,'count'=>$count,'page'=>$page,'sum'=>$sum,'string'=>$string,'tv_id'=>$this->tv_id]);
        return $this->fetch();
    }
    /**
     *昨天直播收益
     */
    public function yesterday_live(){
        $params = Request::instance()->param();
        $map = $this->get_live_where($params);
        $tv = Db::name('television')->where(['tv_id'=>$this->tv_id])->find();
        switch ($tv['tv_type']){
            case 1://省级电视台
                $map['a.level_three_tv|a.spread_tv'] = $this->tv_id;
                $code = 'level_three_amount';
                break;
            case 2://城市台
                $map['a.level_two_tv|a.spread_tv'] = $this->tv_id;
                $code = 'level_two_amount';
                break;
            case 3://城市台
                $map['a.level_one_tv|a.spread_tv'] = $this->tv_id;
                $code = 'level_one_amount';
                break;

        }
        $yesterday = date("Y-m-d 00:00:00",strtotime("-1 day"));
        $today = date("Y-m-d 00:00:00",time());
        $map['a.create_time'] = ['between',[$yesterday,$today]];
        $count = $this->get_live_count($map);
        $sum = $this->get_live_ticket($map,$code);
        $num  = $params['num'];
        if(empty($num)){
            $num = 10;
        }
        $list = DB::name('gift_earnings')->alias('a')
            ->field('a.*,b.header_img,b.phone,b.username,c.e_ticket')
            ->join('__MEMBER__ b','a.anchor_id = b.member_id','left')
            ->join('th_give_gift c','a.give_gift_id = c.give_gift_id')
            ->where($map)
            ->order("a.create_time desc")
            ->paginate($num,false,["query"=>$params]);
        $page = $list->render();
        if($params['act'] =='download'){
            $dat = DB::name('gift_earnings')->alias('a')
                ->field('a.*,b.header_img,b.phone,b.username,c.e_ticket')
                ->join('__MEMBER__ b','a.anchor_id = b.member_id','left')
                ->join('th_give_gift c','a.give_gift_id = c.give_gift_id')
                ->where($map)
                ->order("a.create_time desc")
                ->select();
            $str = '直播收益'.date('YmdHis');
            header('Content-Type: application/download');
            header("Content-type:application/vnd.ms-excel");
            header("Content-Disposition:attachment;filename={$str}.csv");
            header('Cache-Control:must-revalidate,post-check=0,pre-check=0');
            header('Expires:0');
            header('Pragma:public');
            echo "\xEF\xBB\xBF"."序号,主播账号,礼物总值,平台收益,平台比例,用户电视台,用户电视台比例,区县收益,区县比例,市级收益,市级比例,省级收益,省级比例,时间\n";
            foreach ($dat as $k=>$v) {
                if($v['spread_tv'] != $this->tv_id){
                    $v["spread_tv_amount"] =  '';
                    $v["spread_tv_ratio"] =  '';
                }
                if($v['level_one_tv'] != $this->tv_id){
                    $v["level_one_ratio"] =  '';
                    $v["level_one_amount"] =  '';
                }
                if($v['level_two_tv'] != $this->tv_id){
                    $v["level_two_amount"] =  '';
                    $v["level_two_ratio"] =  '';
                }
                if($v['level_three_tv'] != $this->tv_id){
                    $v["level_three_amount"] =  '';
                    $v["level_three_ratio"] =  '';
                }
                $key = $k + 1;
                echo $key . ","
                    . $v["username"] . "\t,"
                    . $v["phone"] . "\t,"
                    . $v["e_ticket"] . "\t,"
                    . $v["platform_amount"] . "\t,"
                    . $v["platform_ratio"] . "\t,"
                    . $v["spread_tv_amount"] . "\t,"
                    . $v["spread_tv_ratio"] . "\t,"
                    . $v["level_one_amount"] . "\t,"
                    . $v["level_one_ratio"] . "\t,"
                    . $v["level_two_amount"] . "\t,"
                    . $v["level_two_ratio"] . "\t,"
                    . $v["level_three_amount"] . "\t,"
                    . $v["level_three_ratio"] . "\t,"
                    . $v["create_time"] . "\t,"
                    . "\n";
            }
            exit;
        }
        $this->assign(['list'=>$list,'count'=>$count,'page'=>$page,'sum'=>$sum,'tv_id'=>$this->tv_id]);
        return $this->fetch();
    }
    /**
     * 全部直播收益
     */
    public function all_live(){
        $params = Request::instance()->param();
        $map = $this->get_live_where($params);
        $tv = Db::name('television')->where(['tv_id'=>$this->tv_id])->find();
        switch ($tv['tv_type']){
            case 1://省级电视台
                $map['a.level_three_tv|a.spread_tv'] = $this->tv_id;
                $code = 'level_three_amount';
                break;
            case 2://城市台
                $map['a.level_two_tv|a.spread_tv'] = $this->tv_id;
                $code = 'level_two_amount';
                break;
            case 3://城市台
                $map['a.level_one_tv|a.spread_tv'] = $this->tv_id;
                $code = 'level_one_amount';
                break;

        }
        $num  = $params['num'];
        if(empty($num)){
            $num = 10;
        }
        $count = $this->get_live_count($map);
        $sum = $this->get_live_ticket($map,$code);
        $list = DB::name('gift_earnings')->alias('a')
            ->field('a.*,b.header_img,b.phone,b.username,c.e_ticket')
            ->join('__MEMBER__ b','a.anchor_id = b.member_id','left')
            ->join('th_give_gift c','a.give_gift_id = c.give_gift_id','left')
            ->where($map)
            ->order("a.create_time desc")
            ->paginate($num,false,["query"=>$params]);
        if($params['act'] =='download'){
            $dat = DB::name('gift_earnings')->alias('a')
                ->field('a.*,b.header_img,b.phone,b.username,c.e_ticket')
                ->join('__MEMBER__ b','a.anchor_id = b.member_id','left')
                ->join('th_give_gift c','a.give_gift_id = c.give_gift_id')
                ->where($map)
                ->order("a.create_time desc")
                ->select();
            $str = '直播收益'.date('YmdHis');
            header('Content-Type: application/download');
            header("Content-type:application/vnd.ms-excel");
            header("Content-Disposition:attachment;filename={$str}.csv");
            header('Cache-Control:must-revalidate,post-check=0,pre-check=0');
            header('Expires:0');
            header('Pragma:public');
            echo "\xEF\xBB\xBF"."序号,主播账号,礼物总值,平台收益,平台比例,用户电视台,用户电视台比例,区县收益,区县比例,市级收益,市级比例,省级收益,省级比例,时间\n";
            foreach ($dat as $k=>$v) {
                if($v['spread_tv'] != $this->tv_id){
                    $v["spread_tv_amount"] =  '';
                    $v["spread_tv_ratio"] =  '';
                }
                if($v['level_one_tv'] != $this->tv_id){
                    $v["level_one_ratio"] =  '';
                    $v["level_one_amount"] =  '';
                }
                if($v['level_two_tv'] != $this->tv_id){
                    $v["level_two_amount"] =  '';
                    $v["level_two_ratio"] =  '';
                }
                if($v['level_three_tv'] != $this->tv_id){
                    $v["level_three_amount"] =  '';
                    $v["level_three_ratio"] =  '';
                }
                $key = $k + 1;
                echo $key . ","
                    . $v["username"] . "\t,"
                    . $v["phone"] . "\t,"
                    . $v["e_ticket"] . "\t,"
                    . $v["platform_amount"] . "\t,"
                    . $v["platform_ratio"] . "\t,"
                    . $v["spread_tv_amount"] . "\t,"
                    . $v["spread_tv_ratio"] . "\t,"
                    . $v["level_one_amount"] . "\t,"
                    . $v["level_one_ratio"] . "\t,"
                    . $v["level_two_amount"] . "\t,"
                    . $v["level_two_ratio"] . "\t,"
                    . $v["level_three_amount"] . "\t,"
                    . $v["level_three_ratio"] . "\t,"
                    . $v["create_time"] . "\t,"
                    . "\n";
            }
            exit;
        }
        $page = $list->render();
        $this->assign(['list'=>$list,'count'=>$count,'page'=>$page,'sum'=>$sum,'tv_id'=>$this->tv_id]);
        return $this->fetch();
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
}