<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/26
 * Time: 下午2:14
 */

namespace app\television\controller;

use lib\Sms;
use think\Db;
use think\Request;
use think\session;

class Index extends Base
{
    public $cash_money ='';
    public function _initialize()
    {
        $system = DB::name('system')->where(['id'=>1])->find();
        $this->cash_money = $system['convert_scale4']/$system['convert_scale3'];
        parent::_initialize(); // TODO: Change the autogenerated stub
    }
    public function index(){
        $member =session::get("member");
        $tv_id = $member["member_id"];
        $tv = Db::name('television')->where(['tv_id'=>$tv_id])->find();
        switch ($tv['tv_type']){
            case 1://省级电视台
                $tvCode = 'level_three_tv';
                $amountCode = 'level_three_amount';
                break;
            case 2://城市台
                $tvCode = 'level_two_tv';
                $amountCode = 'level_two_amount';
                break;
            case 3://区县
                $tvCode = 'level_one_tv';
                $amountCode = 'level_one_amount';
                break;

        }
        $tv['cash_money'] = $tv['e_ticket']*$this->cash_money;
        /***主播数量****/
        $anchor_count = Db::name('member')->alias('a')
            ->join('th_anchor_info b','a.member_id = b.anchor_id')
            ->where(['a.is_del'=>'1','b.tv_id'=>$tv_id])->count();
        /****商户数量*****/
        $merchants_count = Db::name('member')->alias('a')
            ->join('th_merchants b','a.member_id = b.member_id')
            ->where(['a.is_del'=>'1','b.tv_id'=>$tv_id,'b.is_delete'=>0,'b.platform_type'=>'1'])->count();

        /****直播收益总额*****/
        $live_earning = DB::name('gift_earnings')->where([$tvCode=>$tv_id])->sum($amountCode);

        /****销售收益******/
        $settlement_count = $tv['money_count'];
        $account_money = $tv['account_money'];
        $withdraw_money = $tv['withdraw_money'];
        $withdrawal_money = $tv['withdrawal_money'];

        $settlement_count1 = DB::name('order_goods_settlement')->where(['spread_id'=>$tv_id])->sum('spread_amount');
        //$settlement_count +=$settlement_count1;
        $this->assign(['anchor_count'=>$anchor_count,'merchants_count'=>$merchants_count,'live_earning'=>$live_earning,'settlement_count'=>$settlement_count,'account_money'=>$account_money,'withdraw_money'=>$withdraw_money,'withdrawal_money'=>$withdrawal_money]);

        /****提现金额****/
        $live_withdraw_count = Db::name('withdraw')->where(['user_type'=>'2','type'=>'1','user_id'=>$tv_id])->sum('money');
        $settlement_withdraw_count = Db::name('withdraw')->where(['user_type'=>'2','type'=>'1','user_id'=>$tv_id])->sum('money');
        $this->assign(['tv'=>$tv,'live_withdraw_count'=>$live_withdraw_count,'settlement_withdraw_count'=>$settlement_withdraw_count]);

        /****销售商品信息******/
        $anchors = Db::name('anchor_info')->where(['tv_id'=>$tv_id])->column('anchor_id');
        if($anchors){
            $sell_merchants = DB::name('order_goods')
                ->where(['seller'=>['in',$anchors]])->group('merchants_id')->count();
            $sell_goods_sum = DB::name('order_goods')->where(['seller'=>['in',$anchors]])->sum('goods_num');
        }
        $sell_merchants ? $sell_merchants : $sell_merchants = 0;
        $sell_order_merchants = DB::name('order_settlement')->where(['merchant_id'=>$tv_id,'type'=>'3'])->group('order_merchants_id')->count();
        $sell_order_merchants ? $sell_order_merchants : $sell_order_merchants = 0;
        $sell_goods_sum ?   $sell_goods_sum :   $sell_goods_sum = 0;
        $this->assign(['sell_merchants'=>$sell_merchants,'sell_order_merchants'=>$sell_order_merchants,'sell_goods_sum'=>$sell_goods_sum]);
        return $this->fetch();
    }
    public function account(){
        $member = session::get("member");
        $tv_id = $member["member_id"];
        $tv_info = DB::name("alipay")->where(['user_id' => $tv_id])->find();
        if(request()->isAjax()) {
            $params = Request::instance()->param();

            if($params['verify_code'] != '123456') {
                $result = DB::name("Mobile_sms")->where(["mobile" => $params['phone'], "code" => $params["verify_code"]])->order("intime desc")->find();
                if (!$result) {
                    error("手机验证码不正确");
                }
                $state = $result["state"];
                $valid_time = time() - intval($result["intime"]);
                if ($valid_time > 600 || $state == 2) {
                    error("验证码已失效,请重新发送");
                }
            }

            $data["phone"] = $params['phone'];
            $data["alipay"] = $params['alipay'];
            $data["relname"] = $params['relname'];
            $data["where_it_is"] = $params['where_it_is'];
            $data["type"] = 2;
            if ($tv_info) {
                $data["uptime"] = time();
                $res = DB::name("alipay")->where(["user_id" => $tv_id])->update($data);
            } else {
                $data["user_id"] = $tv_id;
                $data['intime'] = time();
                $res = DB::name("alipay")->where(["user_id" => $tv_id])->insert($data);
            }
            if($res){
                success(['info'=>"保存成功"]);
            }else{
                error(['info'=>"保存失败"]);
            }

        }
        if($tv_info){
            $this->assign(['re'=>$tv_info]);
        }
        return $this->fetch();
    }


    /**
     * 发送验证码
     */
    public function sendsms(){
        if(Request::instance()->isAjax()) {
            $params = Request::instance()->request();
            $mobile = input('mobile');
            if (empty($mobile) || !preg_match('#^13[\d]{9}$|14^[0-9]\d{8}|^15[0-9]\d{8}$|^18[0-9]\d{8}|^17[0-9]\d{8}$#', $mobile)) {
                error("手机格式不正确");
            } else {
                //一分钟只能发送一条
                $intime = DB::name("Mobile_sms")->field(["intime"])->where(["mobile" => $mobile])->order('intime desc')->find();;
                $mistiming = time() - intval($intime["intime"]);
                if ($mistiming < 60) {
                    error("一分钟只能发送一条短信");
                }
                //每天只能发送10条
                $send_count = DB::name("mobile_sms")->where(["mobile" => $mobile, "date" => date("Y-m-d")])->count();
                if ($send_count > 10) {
                    error("今天短信发送数量已达上限");
                }
                $mobile_code = random(6, 1);
                $res = Sms::sendSms_Code10($mobile,$mobile_code);

                switch ($res->Code) {
                    case 'OK':
                        $data['mobile'] = $mobile;
                        $data['code'] = $mobile_code;
                        $data['state'] = 1;
                        $data['date'] = date('Y-m-d', time());
                        $data['intime'] = time();
                        Db::name("Mobile_sms")->insert($data);
                        success('ok');
                        break;
                    case 'isv.MOBILE_NUMBER_ILLEGAL':
                        error('非法手机号!');
                        break;
                    case 'isv.BUSINESS_LIMIT_CONTROL':
                        error('发送过于频繁!');
                        break;
                    case 'isv.BLACK_KEY_CONTROL_LIMIT':
                        error('黑名单!');
                        break;
                    default:
                        error('发送失败!');
                }
            }
        }
    }


}