<?php
namespace app\api\controller;
use lib\Easemob;
use Qiniu\QiniuPili;
use think\Controller;
use think\View;
use think\Db;
use \think\Request;
use think\Session;
class Cli extends Common
{
    protected $spread = 0.03;
    /**
     *@列出七牛正在直播的流，不在里面则改变直播状态。
     */
    public function check_online(){
        //获取七牛哪里的活跃流(array)
        $qn = new QiniuPili();
        $streamKey_list = $qn->listLiveStreams();
        //获取直播列表正在直播的视频数量
        $count =$live = DB::name('Live')->where(['live_status' => '1'])->count();
        //进行分页循环处理
        $num = ceil($count/50);
        for ($i = 0; $i < $num; $i++) {
            $live = DB::name('Live')->field("live_id, user_id, play_img,title,room_id,lebel,intime,stream_key")->where(['live_status' => '1'])->limit($i*50,50)->select();
            if (empty($live)) break;
            foreach ($live as $k => $v) {
                //循环判断直播表里面正在直播的流是否在七牛上
                if(!in_array($v['stream_key'],$streamKey_list)){
                    //如果不在修改为下线状态并且进行视频保存
                    DB::name('Live')->where(['live_id'=>$v['live_id']])->update(['live_status'=>2,'is_normal_exit'=>2,'end_time'=>time(),'uptime'=>time()]);
                    //保存保存直播视频
                    DB::name("Merchants")->where(["member_id"=>$v["user_id"]])->update(["live_id"=>0]);
                    DB::name('member')->where(["member_id"=>$v["user_id"]])->update(['mlive_id'=>0]);
                    $fname = $qn->save_vido($v['stream_key']);
                    if(!empty($fname["error"])){
                        if ($fname['fname']) {
                            $data = [
                                'live_id' => $v['live_id'],
                                'user_id' => $v['user_id'],
                                'play_img' => $v['play_img'],
                                'title' => $v['title'],
                                'url' => config('speed_domain') . $fname['fname'],
                                'intime' => time(),
                                'room_id' => $v['room_id'],
                                'date'=>date('Y-m-d',time()),
                                'lebel'=>$v['lebel'],
                                'livewindow_type' => 1,
                                'stream_key' => $v['stream_key'],
                                'live_time' => $v["intime"],
                            ];
                            //如果回放中存在的进行结束时间的修改
                            $live_id = DB::name("live_store")->where(["stream_key" =>$data["stream_key"]])->value('live_id');

                            if(!$live_id){
                                DB::name('Live_store')->insert($data);
                            }else{
                                DB::name("Live_store")->update(["end_time"=>time(),'uptime'=>time()]);
                            }
                        }
                    }
                }else{
                    //如果在修改为直播状态并且进行视频保存
                    DB::name("Merchants")->where(["member_id"=>$v["user_id"]])->update(["live_id"=>$v['live_id']]);
                    DB::name('Live')->where(['live_id'=>$v['live_id']])->update(['live_status'=>1,'is_normal_exit'=>1,'uptime'=>time(),"end_time" => 0]);
                }
            }
            set_time_limit(0);
        }
    }

    /***
     * 每过2分钟一个僵尸粉,如果直播间人数超过10人,则不加僵尸粉
     */
    public function add_fans(){
        //获取直播间可以设置的僵尸粉的数量
        $most_num = DB::name('System')->where(['id'=>1])->value('live_most_num');
        $one_minutes_num = DB::name("system")->where(["id"=>1])->value("one_minutes_num");
        $hx = new Easemob();
        $count = DB::name('Live')->where(['live_status' => '1'])->count();
        $live_ids = Db::name('Live')->where(['live_status' => '1'])->column('live_id');
        $pagesize = 50;
        $page = ceil($count/$pagesize);
        for ($i = 0; $i < $page; $i++) {
            set_time_limit(0);
            //获取正在直播的值的直播间
            $live = DB::name('Live')->where(['live_status' => '1'])->limit($i*$pagesize,$pagesize)->select();
            if (!$live) break;
            foreach($live as $k=>$v){
                $count = DB::name('Live_number')->where(['live_id'=>$v['live_id']])->count();
                if($count<$most_num){
                    $live_number = DB::name('Live_number')->where(['live_id'=>$v['live_id']])->select();
                    if ($live_number){
                        //获取直播间现在的人数
                        $user_ids = array_map(function($v){ return $v['user_id2'];},$live_number);
                        //设置每个频率时间段添加的僵尸粉
                        $fans = DB::name('member')->where(['is_fans'=>2,'member_id'=>['not in',$user_ids]])->order('rand()')->limit($one_minutes_num)->select();
                        if ($fans){
                            foreach ($fans as $a=>$b){
                                $not_fans[] = $b['member_id'];
                                $live_num[] = [
                                    'live_id'=>$v['live_id'],
                                    'user_id'=>$v['user_id'],
                                    'user_id2'=>$b['member_id'],
                                    'intime'=>time()
                                ];
                                $liveIds[] = $v['live_id'];
                            }
                            $hx->adduserChatRoom($fans[0]['hx_username'],$v['room_id']); //其中一个加入聊天室
                            //$get_gradeinfo = get_gradeinfo($fans[0]['grade']);
                            $ext = [
                                'user_id'=>$fans[0]['member_id'],
                                'username'=>$fans[0]['username'],
                                'userimg'=>$fans[0]['header_img'],
                                'intoroom'=>"1",
//                                'usergrade'=>$fans[0]['grade'],
//                                'authName'=>""
                            ];
                            $re = $hx->sendText($fans[0]['hx_username'],$v['room_id'],"进入了直播间",$ext);   //给聊天室发消息
                        }
                    }else{
                        if ($fans){
                            foreach ($fans as $a=>$b){
                                $not_fans[] = $b['member_id'];
                                $live_num[] = [
                                    'live_id'=>$v['live_id'],
                                    'user_id'=>$v['user_id'],
                                    'user_id2'=>$b['member_id'],
                                    'intime'=>time()
                                ];
                                $liveIds[] = $v['live_id'];
                            }
                            $hx->adduserChatRoom($fans[0]['hx_username'],$v['room_id']); //其中一个加入聊天室
                            //$get_gradeinfo = get_gradeinfo($fans[0]['grade']);
                            $ext = [
                                'user_id'=>$fans[0]['member_id'],
                                'username'=>$fans[0]['username'],
                                'userimg'=>$fans[0]['header_img'],
                                'intoroom'=>"1",
//                                'usergrade'=>$fans[0]['grade'],
//                                'authName'=>""
                            ];
                            $hx->sendText($fans[0]['hx_username'],$v['room_id'],"进入了直播间",$ext);   //给聊天室发消息
                        }
                    }
                }
            }
            if(!empty($liveIds)){
                DB::name('Live')->where(['live_id'=>['in',$liveIds]])->setInc('nums');
                DB::name('Live')->where(['live_id'=>['in',$liveIds]])->setInc('watch_nums');
            }
            if(!empty($live_num)){
                Db::name('live_number')->insertAll($live_num);
            }
            if(!empty($not_fans)){
                Db::name('Live_number')->where(['user_id2'=>['in',$not_fans],'live_id'=>['not in',$live_ids]])->delete();
            }
        }
    }
    /**
     * 批量注册僵尸粉
     */
    public function reg_fans(){
        $count = DB::name("member")->where(["is_fans"=>2])->count();
        $page = ceil($count/50);
        $hx = new Easemob();
        for ($i=0;$i<$page;$i++){
            $fans_list = DB::name("member")->field("hx_username,member_id,hx_password,hx_password")->where(["is_fans"=>2])->limit($i*50,50)->select();
            foreach ($fans_list as $k=>$v) {
                $re = $hx->huanxin_zhuce($v["hx_username"], '123456');
                if(!$re){
                    continue;
                }
            }
        }
    }

    /**
     *订单结算
     */
    public function order_goods_settlement(){

        $filename = './order_goods_settlement.txt';
        if (!file_exists($filename)) {
            return "不存在";
        }
        if (!is_readable($filename)) {
            return '不可读';
        }
        if (!is_writable($filename)) {
            return '不可写';
        }

        $fh = fopen($filename, "a");         //打开文件
        fwrite($fh, date('Y-m-d H:i:s',time())."\n\n");        //写入文件
        fclose($fh);

        //file_put_contents('order_goods_settlement.txt',date('Y-m-d H:i:s',time()));
        //exit;
        $time = time();
        $date = date("Y-m-d",$time);
        $system = Db::name('system')->where(['id'=>1])->find();
        $create_time = date("Y-m-d H:i:s",$time);
        //$orderWhere['a.receive_time'] = ['between',['2017-12-01 00:00:00',date('Y-m-d H:i:s',$time)]]; //收货时间
        if ($_GET['sign'] == '123456789'){
            $orderWhere['a.receive_time'] = ['between',['2017-12-01 00:00:00',date('Y-m-d H:i:s',$time)]]; //收货时间
        } else {
            $orderWhere['a.receive_time'] = ['between',['2017-12-01 00:00:00',date("Y-m-d H:i:s",$time-7*24*3600)]];
        }


        $orderWhere['a.settlement_state'] = '0';
        // 订单表 商户表 会员表
        // sell_scale 平台销售收益
        // tv_sell_scale 电视台销售收益
        // spread_scale 电视台引流收益
        $order = Db::name('order_merchants')->alias('a')
            ->field('a.*,b.tv_id,b.tv_sell_scale,b.sell_scale,b.spread_scale,c.tv_id as spread_tv')
            ->join('th_merchants b','a.merchants_id = b.member_id')
            ->join('th_member c','a.member_id = c.member_id')
            ->where($orderWhere)
            ->select(); //查询已完成订单
        //dump($order);exit;
        if($order) {
            Db::startTrans(); // ???
            $goods_settlement = array();
            $i = 0;
            foreach ($order as $k => $v) {
                $orderGoods = Db::name('order_goods')->where(['order_merchants_id' => $v['order_merchants_id']])->select();
                foreach ($orderGoods as $key => $val) {
                    $sale_ratio = DB::name('goods')->where(["goods_id" => $val['goods_id']])->value('sale_ratio');//查询商品推广者提成比例
                    $goods_settlement[$i]['merchants_id'] = $v['merchants_id'];
                    $goods_settlement[$i]['order_goods_id'] = $val['order_goods_id'];
                    $goods_settlement[$i]['order_merchant_id'] = $v['order_merchants_id'];
                    $settlement_price = ($val['specification_price'] * $val['goods_num'] - $val['returns_money']) * $v['order_actual_price'] / $v['goods_total_price'];//商品结算总额
                    if ($settlement_price > 0) {
                        if(!empty($v['spread_tv'])){
                            $goods_settlement[$i]['spread_tv'] = $v['spread_tv'];
                            $goods_settlement[$i]['spread_tv_ratio'] = $system['spread_scale1'];
                            $goods_settlement[$i]['spread_tv_amount'] = $settlement_price*$system['spread_scale1']/100;
                            Db::name('television')->where(['tv_id' => $v['spread_tv']])->setInc('money_count', $goods_settlement[$i]['spread_tv_amount']);
                        }

                        $goods_settlement[$i]['settlement_price'] = $settlement_price;
                        if ($v['sell_scale']) {
                            $sell_scale = $v['sell_scale'];
                        } else {
                            $sell_scale = $system['sell_scale'];
                        }

                        if($sell_scale>=$system['spread_scale1'] && !empty($v['spread_tv'])){ // ??? 有引流
//                            $goods_settlement[$i]['platform_ratio'] = $sell_scale - $system['spread_scale1'];   //平台结算比例
//                            $platform_amount = $sell_scale - $system['spread_scale1'] * $settlement_price / 100;    //平台结算总额
//                            $goods_settlement[$i]['platform_amount'] = $platform_amount;    //平台结算总额
                            $goods_settlement[$i]['platform_ratio'] = $sell_scale;   //平台结算比例
                            $platform_amount = $sell_scale * $settlement_price / 100;    //平台结算总额
                            $goods_settlement[$i]['platform_amount'] = $platform_amount;    //平台结算总额
                        }else{
                            $goods_settlement[$i]['platform_ratio'] = $sell_scale;   //平台结算比例
                            $platform_amount = $sell_scale * $settlement_price / 100;    //平台结算总额
                            $goods_settlement[$i]['platform_amount'] = $platform_amount;    //平台结算总额
                        }

                        //有引流
                        if ($v['tv_id'] && $v['spread_scale']) {   //电视台引流的商家
                            $goods_settlement[$i]['spread_id'] = $v['tv_id'];
                            $goods_settlement[$i]['spread_ratio'] = $v['spread_scale'];  //引流分成比
                            $goods_settlement[$i]['spread_amount'] = $settlement_price * $v['spread_scale']/100;
                            Db::name('television')->where(['tv_id' => $v['tv_id']])->setInc('cash_money', $goods_settlement[$i]['spread_amount']);
                            Db::name('television')->where(['tv_id' => $v['tv_id']])->setInc('account_money', $goods_settlement[$i]['spread_amount']);
                            Db::name('television')->where(['tv_id' => $v['tv_id']])->setInc('money_count', $goods_settlement[$i]['spread_amount']);
                        }
                        if ($val['seller']) { //有销售者
                            $anchor = Db::name('anchor_info')->where(['anchor_id' => $val['seller']])->find();//判断销售者是否主播
                            $goods_settlement[$i]['seller'] = $val['seller'];
                            if ($anchor) {
                                if ($anchor['tv_id']) {//电视台主播
                                    //$goods_settlement[$i]['seller_ratio'] = $sale_ratio;//推广者提成比例
                                    $goods_settlement[$i]['seller_amount'] = $settlement_price * $sale_ratio/100;
                                    if ($sale_ratio > 0) {
                                        $tv_relation = Db::name('television_relation')->alias('a')
                                            ->field('a.*,b.tv_type')
                                            ->join('th_television b','a.tv_id = b.tv_id')
                                            ->where(['a.tv_id' => $anchor['tv_id']])->find();
                                        if ($tv_relation) {
                                            if ($tv_relation['shop_ratio'] > 0) {//自己电视台结算
                                                $tv_money1 = $settlement_price * $tv_relation['shop_ratio'] * $sale_ratio / 10000;
                                                Db::name('television')->where(['tv_id' => $tv_relation['tv_id']])->setInc('cash_money', $tv_money1);
                                                Db::name('television')->where(['tv_id' => $tv_relation['tv_id']])->setInc('account_money', $tv_money1);
                                                Db::name('television')->where(['tv_id' => $tv_relation['tv_id']])->setInc('money_count', $tv_money1);
                                                switch ($tv_relation['tv_type']){
                                                    case 1: //省
                                                        $goods_settlement[$i]['level_three_tv'] = $anchor['tv_id'];
                                                        $goods_settlement[$i]['level_three_ratio'] = $tv_relation['shop_ratio'];
                                                        $goods_settlement[$i]['level_three_amount'] = $tv_money1;
                                                        break;
                                                    case 2://市
                                                        $goods_settlement[$i]['level_two_tv'] = $anchor['tv_id'];
                                                        $goods_settlement[$i]['level_two_ratio'] = $tv_relation['shop_ratio'];
                                                        $goods_settlement[$i]['level_two_amount'] = $tv_money1;
                                                        break;
                                                    case 3://区
                                                        $goods_settlement[$i]['level_one_tv'] = $anchor['tv_id'];
                                                        $goods_settlement[$i]['level_one_ratio'] = $tv_relation['shop_ratio'];
                                                        $goods_settlement[$i]['level_one_amount'] = $tv_money1;
                                                        break;
                                                }
                                            }
                                            if ($tv_relation['city_shop_ratio'] > 0 && $tv_relation['city_tv_id']) { //城市市电视台结算
                                                $tv_money2 = $settlement_price * $tv_relation['city_shop_ratio'] * $sale_ratio / 10000;
                                                Db::name('television')->where(['tv_id' => $tv_relation['city_tv_id']])->setInc('cash_money', $tv_money2);
                                                Db::name('television')->where(['tv_id' => $tv_relation['city_tv_id']])->setInc('account_money', $tv_money2);
                                                Db::name('television')->where(['tv_id' => $tv_relation['city_tv_id']])->setInc('money_count', $tv_money2);
                                                $goods_settlement[$i]['level_two_tv'] = $tv_relation['city_tv_id'];
                                                $goods_settlement[$i]['level_two_ratio'] = $tv_relation['city_shop_ratio'];
                                                $goods_settlement[$i]['level_two_amount'] = $tv_money2;
                                            }

                                            if ($tv_relation['province_shop_ratio'] > 0 && $tv_relation['province_tv_id']) { //省级电视台结算
                                                $tv_money3 = $settlement_price * $tv_relation['province_shop_ratio'] * $sale_ratio / 10000;
                                                Db::name('television')->where(['tv_id' => $tv_relation['province_tv_id']])->setInc('cash_money', $tv_money3);
                                                Db::name('television')->where(['tv_id' => $tv_relation['province_tv_id']])->setInc('account_money', $tv_money3);
                                                Db::name('television')->where(['tv_id' => $tv_relation['province_tv_id']])->setInc('money_count', $tv_money3);
                                                $goods_settlement[$i]['level_three_tv'] = $tv_relation['province_tv_id'];
                                                $goods_settlement[$i]['level_three_ratio'] = $tv_relation['province_shop_ratio'];
                                                $goods_settlement[$i]['level_three_amount'] = $tv_money3;
                                            }

                                        }
                                        $goods_settlement[$i]['other_amount'] = $settlement_price * $sale_ratio/100 - $tv_money1 - $tv_money2 - $tv_money3;
                                    }

                                    $merchants_amount = $settlement_price - $goods_settlement[$i]['spread_amount'] - $settlement_price * $sale_ratio/100 - $goods_settlement[$i]['platform_amount']-$goods_settlement[$i]['spread_tv_amount'];
                                    $goods_settlement[$i]['merchants_amount'] = $merchants_amount;
                                    $goods_settlement[$i]['merchants_ratio'] = sprintf('%.2f', $merchants_amount / $settlement_price * 100);
                                    $result = Db::name('member')->where(['member_id' => $v['merchants_id']])->setInc('amount', $merchants_amount);
                                    if (!$result) {
                                        Db::rollback();
                                        error("结算失败");
                                    }
                                } else { //平台主播
                                    if ($val['sale_ratio'] > 0) { // 推广者|销售者提成
                                        $goods_settlement[$i]['seller_ratio'] = $sale_ratio;//推广者|销售者提成比例
                                        $seller_amount = sprintf('%.2f', $settlement_price * $sale_ratio / 100);
                                        $goods_settlement[$i]['seller_amount'] = $seller_amount;
                                    }
                                    //商家所得金额 = 商品价格 - spread_amount(商家推广者费用) - $seller_amount(推广者|销售者提成) - platform_amount(平台费) - spread_tv_amount(商家所属电视台)
                                    $merchants_amount = $settlement_price - $goods_settlement[$i]['spread_amount'] - $seller_amount - $goods_settlement[$i]['platform_amount']-$goods_settlement[$i]['spread_tv_amount'];
                                    $goods_settlement[$i]['merchants_amount'] = $merchants_amount;
                                    $goods_settlement[$i]['merchants_ratio'] = sprintf('%.2f', $merchants_amount / $settlement_price * 100);
                                    $result = Db::name('member')->where(['member_id' => $v['merchants_id']])->setInc('amount', $merchants_amount); //商家提成
                                    if (!$result) {
                                        Db::rollback();
                                        error("结算失败");
                                    }
                                }
                            } else {  //推广者是主播自己
                                if ($val['sale_ratio'] > 0) {//其他商家推广
                                    $goods_settlement[$i]['seller_ratio'] = $sale_ratio;//推广者提成比例
                                    $seller_amount = sprintf('%.2f', $settlement_price * $sale_ratio / 100);
                                    $goods_settlement[$i]['seller_amount'] = $seller_amount;
                                }
                                $merchants_amount = $settlement_price - $goods_settlement[$i]['spread_amount'] - $seller_amount - $goods_settlement[$i]['platform_amount']-$goods_settlement[$i]['spread_tv_amount'];
                                $goods_settlement[$i]['merchants_amount'] = $merchants_amount;
                                $goods_settlement[$i]['merchants_ratio'] = sprintf('%.2f', $merchants_amount / $settlement_price * 100);
                                $result = Db::name('member')->where(['member_id' => $v['merchants_id']])->setInc('amount', $merchants_amount);
                                if (!$result) {
                                    Db::rollback();
                                    error("结算失败");
                                }
                            }
                        } else {
                            $merchants_amount = $settlement_price - $goods_settlement[$i]['spread_amount'] - $goods_settlement[$i]['platform_amount']-$goods_settlement[$i]['spread_tv_amount'];
                            $goods_settlement[$i]['merchants_amount'] = $merchants_amount;
                            $goods_settlement[$i]['merchants_ratio'] = sprintf('%.2f', $merchants_amount / $settlement_price * 100);
                            $result = Db::name('member')->where(['member_id' => $v['merchants_id']])->setInc('amount', $merchants_amount);
                            if (!$result) {
                                Db::rollback();
                                error("结算失败");
                            }
                        }
                    }
                    $goods_settlement[$i]['order_goods_id'] ? $goods_settlement[$i]['order_goods_id'] : $goods_settlement[$i]['order_goods_id'] = '0';
                    $goods_settlement[$i]['order_merchant_id'] ? $goods_settlement[$i]['order_merchant_id'] : $goods_settlement[$i]['order_merchant_id'] = '0';
                    $goods_settlement[$i]['settlement_price'] ? $goods_settlement[$i]['settlement_price'] : $goods_settlement[$i]['settlement_price'] = '0';
                    $goods_settlement[$i]['platform_ratio'] ? $goods_settlement[$i]['platform_ratio'] : $goods_settlement[$i]['platform_ratio'] = '0';
                    $goods_settlement[$i]['platform_amount'] ? $goods_settlement[$i]['platform_amount'] : $goods_settlement[$i]['platform_amount'] = '0';
                    $goods_settlement[$i]['merchants_id'] ? $goods_settlement[$i]['merchants_id'] : $goods_settlement[$i]['merchants_id'] = '0';
                    $goods_settlement[$i]['merchants_ratio'] ? $goods_settlement[$i]['merchants_ratio'] : $goods_settlement[$i]['merchants_ratio'] = '0';
                    $goods_settlement[$i]['merchants_amount'] ? $goods_settlement[$i]['merchants_amount'] : $goods_settlement[$i]['merchants_amount'] = '0';
                    $goods_settlement[$i]['spread_id'] ? $goods_settlement[$i]['spread_id'] : $goods_settlement[$i]['spread_id'] = '0';
                    $goods_settlement[$i]['spread_ratio'] ? $goods_settlement[$i]['spread_ratio'] : $goods_settlement[$i]['spread_ratio'] = '0';
                    $goods_settlement[$i]['spread_amount'] ? $goods_settlement[$i]['spread_amount'] : $goods_settlement[$i]['spread_amount'] = '0';

                    $goods_settlement[$i]['seller'] ? $goods_settlement[$i]['seller'] : $goods_settlement[$i]['seller'] = '0';
                    $goods_settlement[$i]['seller_ratio'] ? $goods_settlement[$i]['seller_ratio'] : $goods_settlement[$i]['seller_ratio'] = '0';
                    $goods_settlement[$i]['seller_amount'] ? $goods_settlement[$i]['seller_amount'] : $goods_settlement[$i]['seller_amount'] = '0';
                    $goods_settlement[$i]['level_one_tv'] ? $goods_settlement[$i]['level_one_tv'] : $goods_settlement[$i]['level_one_tv'] = '0';
                    $goods_settlement[$i]['level_one_ratio'] ? $goods_settlement[$i]['level_one_ratio'] : $goods_settlement[$i]['level_one_ratio'] = '0';
                    $goods_settlement[$i]['level_one_amount'] ? $goods_settlement[$i]['level_one_amount'] : $goods_settlement[$i]['level_one_amount'] = '0';
                    $goods_settlement[$i]['level_two_tv'] ? $goods_settlement[$i]['level_two_tv'] : $goods_settlement[$i]['level_two_tv'] = '0';
                    $goods_settlement[$i]['level_two_ratio'] ? $goods_settlement[$i]['level_two_ratio'] : $goods_settlement[$i]['level_two_ratio'] = '0';
                    $goods_settlement[$i]['level_two_amount'] ? $goods_settlement[$i]['level_two_amount'] : $goods_settlement[$i]['level_two_amount'] = '0';
                    $goods_settlement[$i]['level_three_tv'] ? $goods_settlement[$i]['level_three_tv'] : $goods_settlement[$i]['level_three_tv'] = '0';
                    $goods_settlement[$i]['level_three_ratio'] ? $goods_settlement[$i]['level_three_ratio'] : $goods_settlement[$i]['level_three_ratio'] = '0';
                    $goods_settlement[$i]['level_three_amount'] ? $goods_settlement[$i]['level_three_amount'] : $goods_settlement[$i]['level_three_amount'] = '0';
                    $goods_settlement[$i]['other_amount'] ? $goods_settlement[$i]['other_amount'] : $goods_settlement[$i]['other_amount'] = '0';
                    $goods_settlement[$i]['spread_tv_amount'] ? $goods_settlement[$i]['spread_tv_amount'] : $goods_settlement[$i]['spread_tv_amount'] = '0';
                    $goods_settlement[$i]['spread_tv'] ? $goods_settlement[$i]['spread_tv'] : $goods_settlement[$i]['spread_tv'] = '0';
                    $goods_settlement[$i]['spread_tv_ratio'] ? $goods_settlement[$i]['spread_tv_ratio'] : $goods_settlement[$i]['spread_tv_ratio'] = '0';
                    $i++;
                }

                $result = Db::name('order_merchants')->where(['order_merchants_id' => $v['order_merchants_id']])->update(['settlement_state' => 1]);
                if (!$result) {
                    Db::rollback();
                    error("结算失败");
                }
            }
            $goods_settlement = array_values($goods_settlement);
            if (!empty($goods_settlement)) {
                foreach ($goods_settlement as $v){
                    $arr[]=[
                        'order_goods_id' => $v['order_goods_id'],
                        'order_merchant_id' => $v['order_merchant_id'],
                        'settlement_price' => $v['settlement_price'],
                        'platform_ratio' => $v['platform_ratio'],
                        'platform_amount' => $v['platform_amount'],
                        'merchants_id' => $v['merchants_id'],
                        'merchants_ratio' => $v['merchants_ratio'],
                        'merchants_amount' => $v['merchants_amount'],
                        'spread_id' => $v['spread_id'],
                        'spread_ratio' => $v['spread_ratio'],
                        'spread_amount' => $v['spread_amount'],
                        'seller' => $v['seller'],
                        'seller_ratio' => $v['seller_ratio'],
                        'seller_amount' => $v['seller_amount'],
                        'level_one_tv' => $v['level_one_tv'],
                        'level_one_ratio' => $v['level_one_ratio'],
                        'level_one_amount' => $v['level_one_amount'],
                        'level_two_tv' => $v['level_two_tv'],
                        'level_two_ratio' => $v['level_two_ratio'],
                        'level_two_amount' => $v['level_two_amount'],
                        'level_three_tv' => $v['level_three_tv'],
                        'level_three_ratio' => $v['level_three_ratio'],
                        'level_three_amount' => $v['level_three_amount'],
                        'other_amount' => $v['other_amount'],
                        'create_time' => $create_time,
                        'date' => $date,
                        'spread_tv_amount' => $v['spread_tv_amount'],
                        'spread_tv' => $v['spread_tv'],
                        'spread_tv_ratio' => $v['spread_tv_ratio'],
                    ];
                }

                $result = Db::name('order_goods_settlement')->insertAll($arr);
                if (!$result) {
                    Db::rollback();
                    error("结算失败");
                } else {
                    Db::commit();
                    success("结算成功");
                }
            }
        }else{
            success('空');
        }
    }
}