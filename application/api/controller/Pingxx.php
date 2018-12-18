<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/10/14
 * Time: 下午3:33
 */

namespace app\api\controller;
use Pingpp\Pingpp;
use Pingpp\Charge;
require('../extend/Pingpp/init.php');
use think\Request;
use think\Db;
class Pingxx extends Common
{

    /**
     * pingxx支付
     * @param $orderNo
     * @param $type
     * @param $openid
     */
    private $system ='';
    public function _initialize(){
        parent::_initialize();
        $this->system = Db::name('system')->where(['id'=>'1'])->find();
    }

    /*充值*/
    public function ping(){
        if (Request::instance()->isPost()) {
            $member = $this->checklogin();
            $data['member_id'] = $member['member_id'];
            $price_list_id = input('price_list_id');
            $openid = input('openid');
            $type = input('type');
            $note = Db::name('PriceList')->where(['price_list_id' => $price_list_id])->find();
            if (!$note) error("参数错误");
            $data['amount'] = $note['price'];
            $data['meters'] = $note['diamond'];
            $data['zeng'] = $note['zeng'];
            $data['pay_number'] = date("YmdHis", time()) . rand(100000, 999999);
            $data['pay_type'] = $type;

            if (empty($data['pay_type'])) $data['pay_type'] = 'wx';
            if (strpos($data['pay_type'], 'alipay') !== false) $data['pay_type'] = 'alipay';
            if (strpos($data['pay_type'], 'wx') !== false) $data['pay_type'] = 'wx';
            if (strpos($data['pay_type'], 'applepay') !== false) $data['pay_type'] = 'applepay';
            $data['intime'] = date("Y-m-d H:i:s", time());
            $result = Db::name("Recharge")->insert($data);
            if (!$result) {
                error("下单失败");
            } else {
               $this->pings($type, $data['pay_number'] . "A" . time(), ($data['amount'] * 100), $openid);
               // $this->pings($type, $data['pay_number'] . "A" . time(), (0.01 * 100), $openid);
            }
        }

    }

    /**
     *商城确认订单支付
     */
    public function ping1(){
        if (Request::instance()->isPost()) {
            $member = $this->checklogin();
            $order_no   = input('order_no');
            $type       = input('type');
            $openid     = input('openid');
            //$res = $order_no.$type.$openid;
            //file_put_contents('ceshi.txt',$res);
            $order = Db::name('order')->where(['order_no' => $order_no,'member_id'=>$member['member_id']])->find();
            if (!$order) error("订单错误");
            $this->pings($type, $order_no . "B" . time(), $order['order_actual_price'] * 100, $openid);
            // $this->pings($type, $order_no . "B" . time(), 0.01 * 100, $openid);
        }
    }

    /**
     *商城待支付订单支付
     */
    public function ping2(){
        if (Request::instance()->isPost()) {
            $member = $this->checklogin();
            $order_no   = input('order_no');
            $type       = input('type');
            $openid     = input('openid');
            $order = Db::name('order_merchants')->where(['order_no' => $order_no,'member_id'=>$member['member_id']])->find();
            if (!$order) error("订单错误");
            $this->pings($type, $order_no . "C" . time(), $order['order_actual_price'] * 100, $openid);
            // $this->pings($type, $order_no . "C" . time(), 0.01 * 100, $openid);
        }
    }

    /**
     *商户订金支付
     */
    public function ping3($order_no,$amount,$type,$openid){
         $this->pings($type, $order_no . "D" . time(), $amount * 100, $openid);
    }

    function pings($type,$order_number,$amount,$openid)
    {
        Pingpp::setApiKey($this->system['secretkey']);
        \Pingpp\Pingpp::setPrivateKeyPath(__DIR__ . '/your_rsa_private_key.pem');
        if($type==null){
            $type="wx";
        }
        switch ($type) {
            case 'alipay_wap':
                $extra = array(
                    'success_url' => 'http://jipiao.tstmobile.com/mobile/#/account',
                    'cancel_url' => 'http://jipiao.tstmobile.com/mobile/#/account'
                );
                break;
            case 'alipay':
                $extra = array();
                break;
            case 'alipay_pc_direct':
                $extra = array(
                    'success_url' => 'http://www.mychnyx.com/wap/index.html#/offline_record'
                );
                break;
            case 'upmp_wap':
                $extra = array(
                    'result_url' => 'http://www.mychnyx.com/api.php/pingxx/callback'
                );
                break;
            case 'bfb_wap':
                $extra = array(
                    'result_url' => 'http://www.mychnyx.com/api.php/pingxx/callback',
                    'bfb_login' => true
                );
                break;
            case 'upacp_wap':
                $extra = array(
                    'result_url' => 'http://www.mychnyx.com/api.php/pingxx/callback'
                );
                break;
            case 'upacp_pc':
                $extra = array(
                    'result_url' => 'http://www.mychnyx.com/wap/index.html#/offline_record'
                );
                break;
            case 'wx_pub':
                $extra = array(
                    'open_id' => $openid
                );
                break;
            case 'wx_pub_qr':
                $extra = array(
                    'product_id' => 'Productid'
                );
                break;
            case 'wx':
                $extra = array(
                );
                break;
        }

        if($amount==null)
        {
            $amount=1;
        }
        if($order_number==null){
            $order_number="m".time();
        }

        try {
            $ch = Charge::create([
                'order_no' => $order_number,
                'amount' => $amount,
                'channel' => $type,
                'currency' => 'cny',
                'client_ip' => get_ip(),
                'subject' => "百台云订单",
                'body' => 'Your Body',
                'app' => ['id' => $this->system['apiid']],
                'extra'=> $extra
            ]);
            //$ch = json_decode($ch,true);
            success($ch);
        } catch (\Pingpp\Error\Base $e) {
            header('Status: ' . $e->getHttpStatus());
            $data = json_decode($e->getHttpBody(),true);
            error($data);
        }
    }

    /**
     *@退款
     */
    public function return_money($amount,$charge){
        vendor("Pingpp.init");
        Pingpp::setApiKey($this->system['secretkey']);
        \Pingpp\Pingpp::setPrivateKeyPath(__DIR__ . '/your_rsa_private_key.pem');
        // 创建退款
        try {
            // 通过发起一次退款请求创建一个新的 refund 对象，只能对已经发生交易并且没有全额退款的 charge 对象发起退款
            $ch = \Pingpp\Charge::retrieve($charge);
            $re = $ch->refunds->create(array(
                'description'=>'Refund Description',
                'amount'    => $amount * 100
            ));
            return $re;// 输出 Ping++ 返回的退款对象 Refund;
        } catch (\Pingpp\Error\Base $e) {
            //header('Status: ' . $e->getHttpStatus());
            return $e->getHttpBody();
        }
    }

    /**
     *@商城订单支付返回值
     */
    public function payCallback()
    {
        $result = json_decode(file_get_contents('php://input'), true);
        $text = "\n\n" . date("Y-m-d H:i:s", time()) . "\n" . var_export($result, true);
        file_put_contents("callback.txt", $text, FILE_APPEND);
        if ($result['type'] == 'charge.succeeded') {
            if (strpos($result['data']['object']['order_no'], 'A') != false) {     //确认订单支付
                $data['pay_state'] = 2;
                $data['pay_return'] = json_encode($result);
                $data['uptime'] = date("Y-m-d H:i:s", time());
                $a = explode("A", $result["data"]["object"]['order_no']);
                $record = Db::name('Recharge')->where(['pay_number' => $a[0]])->find();
                if($record && $record['pay_state'] == '1') {
                    file_put_contents("order.txt", $a[0], FILE_APPEND);
                    $s = Db::name('Recharge')->where(['pay_number' => $a[0]])->update($data);
                    if ($s) {
                        $member = Db::name('member')->where(['member_id' => $record['member_id']])->find();
                        $money = $result['data']['object']['amount'] / 100; //支付金额
                        $diamond = $member['b_diamond'] + $record['meters'] + $record['zeng'];    //充值币相加
                        $this->insertDiamondRecord($member['member_id'], '1', '充值', $record['meters'], $record['zeng']);
                        Db::name('member')->where(['member_id' => $member['member_id']])->update(['b_diamond' => $diamond]);

                        //交易记录
                        $tradeRecord['member_id'] = $member['member_id'];
                        $tradeRecord['order_no'] = $a[0];
                        $tradeRecord['type'] = 2;
                        $tradeRecord['intime'] = date("Y-m-d H:i:s", time());
                        $tradeRecord['pay_no'] = $result["data"]["object"]['order_no'];
                        $tradeRecord['amount'] = $money;
                        $tradeRecord['pay_return'] = json_encode($result);
                        Db::name('TradeRecord')->insert($tradeRecord);
                        $this->change_grade($member['member_id']);
                        success("支付成功");
                    } else {
                        error("支付失败");
                    }
                }
            } else if (strpos($result['data']['object']['order_no'], 'B') != false) {     //确认订单支付
                $a = explode("B", $result["data"]["object"]['order_no']);
                $type = $result["data"]["object"]['channel'];
                if (strpos($type, 'alipay') !== false) {
                    $code['pay_way'] = '支付宝';
                } else if (strpos($type, 'wx') !== false) {
                    $code['pay_way'] = '微信';
                }
                file_put_contents("order.txt", json_encode($a[0]), FILE_APPEND);
                $order = Db::name('order')->where(['order_no' => $a[0]])->find();
                if ($order && $order['order_state'] == 'wait_pay') {
                    $data['order_state'] = 'wait_send';
                    $data['uptime'] = date("Y-m-d H:i:s", time());
                    //$data['returns'] = json_encode($result);
                    $s = Db::name('order')->where(['order_no' => $a[0]])->update($data);
                    if ($s) {
                        $code['order_state'] = 'wait_send';
                        $code['update_time'] = date("Y-m-d H:i:s", time());
                        $code['pay_time'] = date("Y-m-d H:i:s", time());
                        $code['ping_no'] = $result["data"]["object"]['order_no'];   //ping++订单号
                        $code['pay_no'] = $result["data"]["object"]['order_no'];
                        //$code['amount'] = $result['data']['object']['amount'] / 100;
                        $code['pay_charge'] = json_encode($result);
                        $result = Db::name('order_merchants')->where(['order_id' => $order['order_id']])->update($code);
                        $member = Db::name('member')->where(['member_id' => $order['member']])->find();
                        $order_goods = Db::name('order_goods')->where(['order_id' => $order['order_id']])->select();
                        $goodsNum = 0;
                        foreach ($order_goods as $v) {
                            $goods = Db::name('goods')->where(['goods_id' => $v['goods_id']])->find();
                            if ($goods) {
                                $merchant = Db::name('merchants')->where(['member_id' => $goods['member_id']])->find();
                                $goodsInfo['total_sales'] = $goods['total_sales'] + $v['goods_num'];
                                $goodsInfo['month_sales'] = $goods['month_sales'] + $v['goods_num'];
                                $goodsInfo['day_sales'] = $goods['day_sales'] + $v['goods_num'];
                                $merchantInfo['total_sales'] = $merchant['total_sales'] + $v['goods_num'];
                                $merchantInfo['month_sales'] = $merchant['month_sales'] + $v['goods_num'];
                                $merchantInfo['day_sales'] = $merchant['day_sales'] + $v['goods_num'];
                                Db::name('merchants')->where(['member_id' => $goods['member_id']])->update($merchantInfo);
                                if ($goods['goods_stock'] > $v['goods_num']) {
                                    $goodsInfo['goods_stock'] = $goods['goods_stock'] - $v['goods_num'];
                                    Db::name('goods')->where(['goods_id' => $v['goods_id']])->update($goodsInfo);
                                    if ($v['specification_id']) {
                                        $specification = Db::name('goods_relation_specification')->where(['specification_id' => $v['specification_id']])->find();
                                        if ($specification) {
                                            if ($specification['specification_stock'] > $v['goods_num']) {
                                                $goodsSpecification['specification_stock'] = $specification['specification_stock'] - $v['goods_num'];
                                            } else {
                                                $goodsSpecification['specification_stock'] = '0';
                                            }
                                            $goodsSpecification['specification_sales'] = $specification['specification_sales'] + $v['goods_num'];
                                        }
                                        Db::name('goods_relation_specification')->where(['specification_id' => $v['specification_id']])->update($goodsSpecification);
                                    }
                                } else {
                                    $goodsInfo['goods_stock'] = '0';
                                    Db::name('goods')->where(['goods_id' => $v['goods_id']])->update($goodsInfo);
                                }
                            }
                        }
                        //交易记录
                        $tradeRecord['member_id'] = $member['member_id'];
                        $tradeRecord['order_no'] = $a[0];
                        $tradeRecord['type'] = 1;
                        $tradeRecord['intime'] = date("Y-m-d H:i:s", time());
                        $tradeRecord['pay_no'] = $result["data"]["object"]['order_no'];
                        $tradeRecord['amount'] = $result['data']['object']['amount'] / 100;
                        $tradeRecord['pay_return'] = json_encode($result);
                        Db::name('TradeRecord')->insert($tradeRecord);
                        $this->change_grade($member['member_id']);
                        success("支付成功");
                    } else {
                        error("支付失败");
                    }
                }
            } else if (strpos($result['data']['object']['order_no'], 'C') !== false) {   //待支付订单支付
                $a = explode("C", $result["data"]["object"]['order_no']);
                $type = $result["data"]["object"]['channel'];
                if (strpos($type, 'alipay') !== false) {
                    $code['pay_way'] = '支付宝';
                } else if (strpos($type, 'wx') !== false) {
                    $code['pay_way'] = '微信';
                }
                file_put_contents("order.txt", json_encode($a[0]), FILE_APPEND);
                $order = Db::name('order_merchants')->where(['order_no' => $a[0]])->find();
                if ($order && $order['order_state'] == 'wait_pay') {
                    $code['order_state'] = 'wait_send';
                    $code['update_time'] = date("Y-m-d H:i:s", time());
                    $code['pay_time'] = date("Y-m-d H:i:s", time());
                    $code['ping_no'] = $result["data"]["object"]['order_no'];   //ping++订单号
                    $code['pay_no'] = $result["data"]["object"]['order_no'];
                    //$code['amount'] = $result['data']['object']['amount'] / 100;
                    $code['pay_charge'] = json_encode($result);
                    $result = Db::name('order_merchants')->where(['order_merchants_id' => $order['order_merchants_id']])->update($code);
                    $member = Db::name('member')->where(['member_id' => $order['member']])->find();
                    $order_goods = Db::name('order_goods')->where(['order_merchants_id' => $order['order_merchants_id']])->select();
                    foreach ($order_goods as $v) {
                        $goods = Db::name('Goods')->where(['goods_id' => $v['goods_id']])->find();
                        if ($goods) {
                            $merchant = Db::name('merchants')->where(['member_id' => $goods['member_id']])->find();
                            $goodsInfo['total_sales'] = $goods['total_sales'] + $v['goods_num'];
                            $goodsInfo['month_sales'] = $goods['month_sales'] + $v['goods_num'];
                            $goodsInfo['day_sales'] = $goods['day_sales'] + $v['goods_num'];
                            $merchantInfo['total_sales'] = $merchant['total_sales'] + $v['goods_num'];
                            $merchantInfo['month_sales'] = $merchant['month_sales'] + $v['goods_num'];
                            $merchantInfo['day_sales'] = $merchant['day_sales'] + $v['goods_num'];
                            Db::name('merchants')->where(['member_id' => $goods['member_id']])->update($merchantInfo);
                            if ($goods['goods_stock'] > $v['goods_num']) {
                                $goodsInfo['goods_stock'] = $goods['goods_stock'] - $v['goods_num'];
                                Db::name('goods')->where(['goods_id' => $v['goods_id']])->update($goodsInfo);
                                if ($v['specification_id']) {
                                    $specification = Db::name('goods_relation_specification')->where(['specification_id' => $v['specification_id']])->find();
                                    if ($specification) {
                                        if ($specification['specification_stock'] > $v['goods_num']) {
                                            $goodsSpecification['specification_stock'] = $specification['specification_stock'] - $v['goods_num'];
                                        } else {
                                            $goodsSpecification['specification_stock'] = '0';
                                        }
                                        $goodsSpecification['specification_sales'] = $specification['specification_sales'] + $v['goods_num'];
                                    }
                                    Db::name('goods_relation_specification')->where(['specification_id' => $v['specification_id']])->update($goodsSpecification);
                                }
                            } else {
                                $goodsInfo['goods_stock'] = '0';
                                Db::name('goods')->where(['goods_id' => $v['goods_id']])->update($goodsInfo);
                            }
                        }
                    }

                    //交易记录
                    $tradeRecord['member_id'] = $member['member_id'];
                    $tradeRecord['order_no'] = $a[0];
                    $tradeRecord['type'] = 1;
                    $tradeRecord['intime'] = date("Y-m-d H:i:s", time());
                    $tradeRecord['pay_no'] = $result["data"]["object"]['order_no'];
                    $tradeRecord['amount'] = $result['data']['object']['amount'] / 100;
                    $tradeRecord['pay_return'] = json_encode($result);
                    Db::name('TradeRecord')->insert($tradeRecord);
                    $this->change_grade($member['member_id']);
                    success("支付成功");
                }
            } else if (strpos($result['data']['object']['order_no'], 'D') !== false) {   //待支付订单支付
                $a = explode("D", $result["data"]["object"]['order_no']);
                $type = $result["data"]["object"]['channel'];
                if (strpos($type, 'alipay') !== false) {
                    $code['pay_way'] = '支付宝';
                } else if (strpos($type, 'wx') !== false) {
                    $code['pay_way'] = '微信';
                }
                file_put_contents("order.txt", $a[0], FILE_APPEND);
                $order = Db::name('merchants_deposit_order')->where(['order_no' => $a[0]])->find();
                if ($order && $order['order_state'] == 'wait_pay') {
                    $code['order_state'] = 'end';
                    $code['update_time'] = date("Y-m-d H:i:s", time());
                    $code['pay_time'] = date("Y-m-d H:i:s", time());
                    //$code['amount'] = $result['data']['object']['amount'] / 100;
                    $code['pay_charge'] = json_encode($result);
                    Db::name('merchants_deposit_order')->where(['deposit_id' => $order['deposit_id']])->update($code);
                    Db::name('member')->where(['member_id' => $order['member']])->update(['type'=>'2']);
                    Db::name('merchants')->where(['member_id' => $order['member']])->update(['pay_state'=>'1']);
                    success("支付成功");
                } else {
                    error("支付失败");
                }
            }else {
                error("支付失败");
            }
        }
    }





    /**
     *根据用户消费额提升等级
     */
    protected  function change_grade($member_id=''){
        $amount = Db::name('TradeRecord')->where(['member_id'=>$member_id])->sum('amount');
        $grade_config = Db::name('Grade')->where(['value'=>['elt',$amount]])->order('grade_id desc')->find();
        $grade = 1;
        if($grade_config){
            $grade = $grade_config['grade_id'];
        }
        Db::name('Member')->where(['member_id'=>$member_id])->update(['grade'=>$grade]);
    }

    /**
     * @apple_recharge 苹果充值
     */
    public function apple_recharge(){
        $member = $this->checklogin();
        $price_list_id = input('price_list_id');
        $note = Db::name('PriceList')->where(['price_list_id' => $price_list_id])->find();
        if (empty($note)) error("参数错误");
        if (!$note) error("参数错误");
        $data['member_id'] = $member['member_id'];
        $data['amount'] = $note['price'];
        $data['meters'] = $note['diamond'];
        $data['zeng'] = $note['zeng'];
        $data['pay_number'] = date("YmdHis", time()) . rand(100000, 999999);
        $data['pay_type'] = 'applepay';
        $data['pay_state'] = 2;
        $data['intime'] = date("Y-m-d H:i:s", time());
        $result = Db::name("Recharge")->insert($data);
        if($result){
            $this->insertDiamondRecord($member['member_id'], '1', '充值', $note['diamond'], $note['zeng']);
            $b_diamond = $member['b_diamond'] + $note['diamond'] + $note['zeng'];    //充值币相加
            Db::name('member')->where(['member_id'=>$member['member_id']])->update(['b_diamond'=>$b_diamond]);
            //交易记录
            $tradeRecord['member_id'] = $member['member_id'];
            $tradeRecord['order_no'] = $data['pay_number'];
            $tradeRecord['type'] = 1;
            $tradeRecord['intime'] = date("Y-m-d H:i:s", time());
            $tradeRecord['pay_no'] = $data['pay_number'];
            $tradeRecord['amount'] = $data['amount'];
            $tradeRecord['pay_return'] = '';
            Db::name('TradeRecord')->insert($tradeRecord);
            $this->change_grade($member['member_id']);
            success("充值成功");
        }else{
            error("充值失败");
        }

    }

}