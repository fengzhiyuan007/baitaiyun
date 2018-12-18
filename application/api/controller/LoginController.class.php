<?php
/**
 * Created by PhpStorm.
 * User: admin
 * Date: 2016/10/17
 * Time: 15:26
 */

namespace Api\Controller;
class LoginController extends CommonController
{
    /**
     *@注册
     *@param
     */
    public function register(){
        if(IS_POST){
            $data = $_POST;
//            if($data['accept'] !=1)         error("未接受用户协议!");
            if(empty($data['phone']))       error("手机号不能为空");
//            if(!preg_match('^1[3|4|5|7|8]\d{9}$', $data['phone'])) error("手机号错误");
            if(M('User')->where(['phone'=>$data['phone']])->find()) error("该手机号已注册");
            if(empty($data['verify']))      error("手机号验证码不能为空");
            if($data['verify'] != $this->system['default_verify']){
                $check = M('Code')->where(['mobile'=>$data['phone']])->find();
                if(!$check)                     error("验证码未发送");
                if($data['verify']!= $check['verify']) error("验证码错误");
                if(time()-strtotime($check['intime']) > 60*20){
                    error("验证码已过期");
                }
            }
//            if(empty($data['password']))    error("密码不能为空");
//            if(!preg_match('/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/',$data['password'])) error("请输入字母和数字组合的6-20位密码!");
//            if(empty($data['repassword']))  error("确认密码不能为空");
//            if($data['password'] !=$data['repassword']) error("两次密码输入不一致");
//            $data['password'] = myencrypt($data['password']);
            $data['intime'] = date("Y-m-d H:i;s",time());
            $chars = "abcdefghijklmnopqrstuvwxyz0123456789";
            mt_srand(10000000 * (double)microtime());
            for ($i = 0, $str = '', $lc = strlen($chars) - 1; $i < 12; $i++) {
                $str .= $chars[mt_rand(0, $lc)];
            }
            for ($i = 0, $str1 = '', $lc = strlen($chars) - 1; $i < 13; $i++) {
                $str1 .= $chars[mt_rand(0, $lc)];
            }
            $hx_password = "123456";
            $data['hx_password'] = $hx_password;
            $data['hx_username'] = $str;
            $data['img'] = '/Uploads/image/touxiang.png';
            $data['alias'] = $str;
            $data['username'] = '游客'.date('is').rand(1,99);
            huanxin_zhuce($str, $hx_password);
            //$data['is_hand'] = 1;
            $result = M('User')->add($data);
//            $url = "http://xiangba.tstmobile.com/web/#/zc?uid=".$result;
//            $middle = "./Uploads/qrcode/".md5($url).'_middle.png';
//            qrcode($url,$middle,4,5);
//            $share_qrcode = "/Uploads/qrcode/".md5($url).'_middle.png';
//            M('User')->where(['member_id'=>$result])->save(['share_qrcode'=>$share_qrcode]);
            $result ? success("注册成功!") : error("注册失败!");
            }
    }
    /**
     *第三方登录判断
     */
    public  function is_exist_member(){
        $state = I("state");
        $openid = I("openid");
        empty($state) ? error("参数错误") : true;
        empty($openid) ? error("无法获取用户信息") : true;
        switch ($state){
            case 1:$data['wx_openid'] = $openid;break;
            case 2:$data['qq_openid'] = $openid;break;
            case 3:$data['wo_openid'] = $openid;break;
        }
        $user = M("user")->where($data)->find();
        if($user){
            //用户存在的时候
            if($user['is_del']==2){
                error('账号被限制,请联系平台!');
            }else{
                $member_token = uniqid();
                $user["token"] = $member_token;
                $update["token"] = $member_token;
                $update["uptime"] = time();
                M("user")->where(["user_id"=>$user["user_id"]])->save($update);
                success($user);
            }
        }else{
            success(["status"=>0]);
        }
    }
    /**
     * @第三方登陆（微信，qq）
     * @state 1:微信  2：qq    3:微博
     */
    public function third_login(){
        $openid = I("openid");
        $state  = I("state");
        $mobile = I("mobile");
        $yzm = I("yzm");
        empty($openid) ? error("无法获取用户信息") : true;
        empty($state) ? error("参数错误") : true;
        preg_match("/^1[34578]{1}\d{9}$/",$mobile) ?  true : error("手机号不合法");
        if(!in_array($state,array(1,2,3))){
            error("参数不符合要求");
        }
        switch ($state){
            case 1:
                $data['wx_openid'] = $openid;
                $open_type = "wx_openid";
                break;
            case 2:
                $data['qq_openid'] = $openid;
                $open_type = "qq_openid";
                break;
            case 3:
                $data['wo_openid'] = $openid;
                $open_type = "wo_openid";
                break;
        }
        //获取默认验证码
        $default_verify = M("system")->where(["id"=>1])->getField("default_verify");
        //判断验证码是否有效期
        if($yzm != $default_verify) {
            $result = M("code")->where(["mobile" => $mobile, "verify" => $yzm])->order("intime desc")->find();
            if (!$result) {
                error("验证码不正确");
            }
        }
        /**进行账号检测**/
        $bind_phone = M("user")->where(["phone"=>$mobile])->find();
        if($bind_phone){
            /**是否绑定其他账号**/
            $m_res = M("user")->where(["user_id"=>$bind_phone["user_id"]])->getField($open_type);
            if($m_res){
                error("该账号已绑定其它手机");
            }else{
                $data["token"] = uniqid();
                $data["uptime"] = time();
                $up_res = M("user")->where(["user_id"=>$bind_phone["user_id"]])->save($data);
                if($up_res){
                    $user = M("user")->where(["user_id"=>$bind_phone["user_id"]])->find();
                    $user["img"] =
                    success($user);
                }else{
                    error("登录失败");
                }
            }
        }else {
            $sex = I("sex");
            $username = I("username");
            $header_img = I("header_img");
            empty($sex) ? 0 : true;
            empty($username) ? '游客' . date('is') . rand(1, 99) : true;
            empty($header_img) ? '/Uploads/image/touxiang.png' : true;
            $chars = "abcdefghijklmnopqrstuvwxyz123456789";
            mt_srand(10000000 * (double)microtime());
            for ($i = 0, $str = '', $lc = strlen($chars) - 1; $i < 12; $i++) {
                $str .= $chars[mt_rand(0, $lc)];
            }
            $hx_password = "123456";
            huanxin_zhuce($str, $hx_password);
            $data = [
                $open_type => $openid,
                'phone' => $mobile,
                'token' => uniqid(),
                'img' => $header_img,
                'username' => $username,
                'intime' => time(),
                'alias' => $str,
                'sex' => $sex,
                'hx_username' => $str,
                'hx_password' => $hx_password,
            ];
            huanxin_zhuce($str, $hx_password);
            $result = M('User')->add($data);
            if ($result) {
                success("登录成功");
            } else {
                success("登录失败");
            }
        }
    }
    public function wx_register(){
        if(IS_POST){
            $data = $_POST;
            if($data['accept'] !=1)         error("未接受用户协议!");
            if(empty($data['phone']))       error("手机号不能为空");
//            if(!preg_match('^1[3|4|5|7|8]\d{9}$', $data['phone'])) error("手机号错误");
            if(M('Member')->where(['phone'=>$data['phone']])->find()) error("该手机号已绑定");
            if(empty($data['verify']))      error("手机号验证码不能为空");
            $check = M('Code')->where(['mobile'=>$data['phone']])->find();
            if(!$check)                     error("验证码未发送");
            if($data['verify']!= $check['verify']) error("验证码错误");
            if(time()-strtotime($check['intime']) > 60*20){
                error("验证码已过期");
            }
            if(empty($data['wx_info']))     error("微信信息错误");
            $arr = json_decode($data['wx_info'],true);
            $data['openid'] = $arr['openid'];
			$data['token'] = uniqid();
			$data['intime'] = date("Y-m-d H:i:s",time());
			$data['nickname'] = $arr['nickname'];
			$data['img'] = $arr['headimgurl'];
			$data['sex'] =$arr['sex'];
			$data['province'] = $arr['province'];
			$data['city'] = $arr['city'];
            $data['username'] = '游客'.date('is').rand(1,99);
			$result = M('Member')->add($data);
			$check = M('Member')->field('member_id,token,openid')->where(['member_id'=>$result])->find();

            if($check){
                cookie('wx_info',null);
                $member = json_encode(array('uid'=>$check['member_id'],'token'=>$check['token'],'openid'=>$check['openid']));
                cookie('member',$member);
                success(array('uid'=>$check['member_id'],'token'=>$check['token'],'openid'=>$check['openid']));
            }else{
                error("注册失败!");
            }
        }
    }

    /**
     * @登录
     * @param
     */
    public function login(){
        if(IS_POST){
            $data = $_POST;
            if(empty($data['phone']))       error("手机号不能为空");
            if(empty($data['verify']))      error("验证码不能为空");
            if(empty($data['phone']) || !preg_match('/^1[3|4|5|7|8]\d{9}$/', $data['phone'])) {
                error("手机号填写错误");
            }
            if($data['verify'] != $this->system['default_verify']){
                $check = M('Code')->where(['mobile'=>$data['phone']])->find();
                if(!$check)                     error("验证码未发送");
                if($data['verify']!= $check['verify']) error("验证码错误");
                if(time()-strtotime($check['intime']) > 60*20){
                    error("验证码已过期");
                }
            }
            $user = M('User')->where(['phone'=>$data['phone']])->find();
            $token = uniqid();
            if($user){
                if($user['is_del'] == '2')    error("账号被限制，不能登录");
                $result = M('User')->where(['user_id'=>$user['user_id']])->save(['token'=>$token]);
                $user['token'] = $token;
            }else{
                $data['token'] = $token;
                $data['intime'] = date("Y-m-d H:i;s",time());
                $chars = "abcdefghijklmnopqrstuvwxyz0123456789";
                mt_srand(10000000 * (double)microtime());
                for ($i = 0, $str = '', $lc = strlen($chars) - 1; $i < 12; $i++) {
                    $str .= $chars[mt_rand(0, $lc)];
                }
                for ($i = 0, $str1 = '', $lc = strlen($chars) - 1; $i < 13; $i++) {
                    $str1 .= $chars[mt_rand(0, $lc)];
                }
                $hx_password = "123456";
                $data['hx_password'] = $hx_password;
                $data['hx_username'] = $str;
                $data['img'] = '/Uploads/image/touxiang.png';
                $data['alias'] = $str;
                $data['sex'] = '1';
                huanxin_zhuce($str, $hx_password);
                $data['ID'] = get_number7();
                //$data['is_hand'] = 1;
                $data['username'] = '会员'.date('is').rand(1,99);
                $result = M('User')->add($data);
                $user = M('User')->where(['user_id'=>$result])->find();
            }
            if($result){
                $user['img'] = $this->url.$user['img'];
                success($user);
            }else{
                error("登录失败");
            }
        }else{
            error("密码错误");
        }
    }

    /**
     *@生成优惠券
     */
    public function add_common_code(){
        if(IS_POST){
            $data = $_POST;
            if(empty($data['title'])){
                echo json_encode(array('status'=>'error','info'=>'名称不能为空'));
                die;
            }
            if(empty($data['number']))      $data['number'] = 1;
            if(!is_numeric($data['number'])){
                echo json_encode(array('status'=>'error','info'=>'数量有误'));
                die;
            }
            if($data['number']>5000){
                echo json_encode(array('status'=>'error','info'=>'生成数量过大'));
                die;
            }
            if(empty($data['end_time'])){
                echo json_encode(array('status'=>'error','info'=>'结束时间不能为空'));
                die;
            }
            for($i=0;$i<$data['number'];$i++){
                $code[] = [
                    'title' => $data['title'],
                    'title' => $data['title'],
                    'code' => uniqid_code(),
                    'goods_id' => $data['goods_id'],
                    'intime' => date("Y-m-d H:i:s",time()),
                    'end_time' => $data['end_time'],
                ];
            }
            $result = M('CouponCode')->addAll($code);
            if($result){
                echo json_encode(array('status'=>'ok','info'=>'添加兑换码成功','url'=>session('url')));
                die;
            }else{
                echo json_encode(array('status'=>'error','info'=>'添加兑换码失败'));
                die;
            }
        }else{
            $coupon = M('Coupon')->where(['type'=>2])->select();
            $this->assign(['coupon'=>$coupon]);
            $this->display();
        }
    }

    /**
     *@设置新密码
     */
    public function set_new_password(){
        if(IS_POST){
            $data = $_POST;
            if(empty($data['phone']))  error("手机号不能为空");
            if(empty($data['verify'])) error("验证码不能为空");
            $check = M('Code')->where(['mobile'=>$data['phone']])->find();
            if(!$check)                error("验证码未发送");
            if($data['verify']!= $check['verify']) error("验证码错误");
            if(time()-strtotime($check['intime']) > 60*20){
                error("验证码已过期");
            }
            $member = M('Member')->where(['phone'=>$data['phone']])->find();
            if(!$member)                 error("该手机号尚未注册");
            if($member['is_del'] == '2') error("该帐号被限制，不能进行操作");
            if(empty($data['password']))    error("密码不能为空");
            if(empty($data['repassword']))  error("确认密码不能为空");
            if(!preg_match('/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/',$data['password'])) error("请输入字母和数字组合的6-20位密码!");
            if($data['password'] != $data['repassword'])  error("两次密码不一样");
            $map['password'] = myencrypt($data['password']);
            $map['uptime']   = date("Y-m-d H:i:s",time());
            $result = M('Member')->where(['phone'=>$data['phone']])->save($map);
            if($result){
                success("修改密码成功");
            }else{
                error("修改密码失败");
            }
        }
    }

    /**
     *@验证手机密码
     */
    public function check_verify(){
        if(IS_POST){
            $data = $_POST;
            if(empty($data['phone']))  error("手机号不能为空");
            if(empty($data['verify'])) error("验证码不能为空");
            $check = M('Code')->where(['mobile'=>$data['phone']])->find();
            if(!$check)                error("验证码未发送");
            if($data['verify']!= $check['verify']) error("验证码错误");
            if(time()-strtotime($check['intime']) > 60*20){
                error("验证码已过期");
            }
            $member = M('Member')->where(['phone'=>$data['phone']])->find();
            if(!$member)                 error("该手机号尚未注册");
            if($member['is_del'] == '2') error("该帐号被限制，不能进行操作");
            success("验证成功");
        }
    }

    public function xieyi(){
        if(IS_POST){
            $xieyi = M('Notice')->field('title,content')->where(['id'=>'1'])->find();
            success($xieyi);
        }
    }

    public function check(){
        if(!preg_match('/^1[3|4|5|7|8]\d{9}$/', '13518618301')){
            error("手机号错误");
        }
    }

    public function edit_huanxin(){
        $count = M('Member')->count();
        $number = ceil($count / 50);
        for ($a = 0; $a < $number + 1; $a++) {
            $user = M('Member')->limit($a * 50, 50)->select();
            foreach ($user as $k => $v) {
                $chars = "abcdefghijklmnopqrstuvwxyz0123456789";
                mt_srand(10000000 * (double)microtime());
                for ($i = 0, $str = '', $lc = strlen($chars) - 1; $i < 12; $i++) {
                    $str .= $chars[mt_rand(0, $lc)];
                }
                for ($i = 0, $str1 = '', $lc = strlen($chars) - 1; $i < 13; $i++) {
                    $str1 .= $chars[mt_rand(0, $lc)];
                }
                $hx_password = "123456";
                $data['hx_password'] = $hx_password;
                $data['hx_username'] = $str;
//            $data['background_img'] = '/Uploads/image/touxiang/background_img.png';
                $data['alias'] = $str;
                $data['hx_username2'] = $str1;
                $data['hx_password2'] = $hx_password;
                if (huanxin_zhuce($str, $hx_password)) {
                    $result = M('Member')->where(['member_id' => $v['member_id']])->save($data);
                }else{
                    error("错误");
                    die;
                }
            }
        }
    }

    public function test(){
        $count = M('Member')->count();
        $number = ceil($count / 50);
        for ($i = 0; $i < $number + 1; $i++) {
            $user = M('Member')->limit($i * 50, 50)->select();
            foreach ($user as $k => $v) {
                $url = "http://91dreambar.com/web/#/zc?uid=".$v['member_id'];
                $middle = "./Uploads/qrcode/".md5($url).'_middle.png';
                qrcode($url,$middle,4,5);
                $url = "/Uploads/qrcode/".md5($url).'_middle.png';
                M('Member')->where(['member_id'=>$v['member_id']])->save(['share_qrcode'=>$url]);
            }
        }
    }

    public function test1(){
        $today = strtotime(date("Y-m-d",time()));
        $count = M('Share')->where(['mid'=>1,'intime'=>['gt',$today]])->count();
        if($count<6){
            $code['mid'] = 1;
            $code['share_id'] = 2;
            $code['intime'] = date("Y-m-d H:i:s");
            $code['score'] = 200;
            $result = M('Share')->add($code);
            if($result){
                M('Member')->where(['member_id'=>1])->setInc("score",200);
            }
        }
    }

}