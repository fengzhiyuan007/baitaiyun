<?php
namespace app\api\controller;
use lib\Easemob;
use lib\Upload;
use think\Controller;
use think\View;
use think\Db;
use opensearch;
use \think\Session;
use \think\Request;
use WeChat\Jssdk;

class Login extends Common
{
    private $cdkey = "8SDK-EMY-6699-RHRPN";
    private $password = "647039";
    protected $system = array();
    public function _initialize()
    {
        $this->system = Db::name('system')->where(['id'=>'1'])->find();
        parent::_initialize(); // TODO: Change the autogenerated stub
    }

    /**
     * @助通短信发送
     */
    protected  function zhutong_sendSMS($content,$mobile){
        //$url 		= "http://api.zthysms.com/sendSms.do";//提交地址
        $url 		= "http://www.ztsms.cn/sendNSms.do";//提交地址
        $username 	= "ZATest";//用户名
        $password 	= "Zhengan88";//原密码
        // 初始化
        vendor('zhutong.zhutong');
        $data = array(
            'content' 	=> $content,//短信内容
            'mobile' 	=> $mobile,//手机号码
            'productid' => '676767',//产品id
            'xh'		=> ''//小号
        );
        $sendAPI = new \sendAPI($url, $username, $password);
        $sendAPI->data = $data;//初始化数据包
        $return = $sendAPI->sendSMS('POST');//GET or POST
        return $return;
    }
    /**
     * qq.wei
     */
    public function  bindingaccount(){
        $member = $this->checklogin();
        $params = Request::instance()->param();
        !empty($params['wx_unionid']) ? $wx_unionid = $params['wx_unionid'] : $wx_unionid = false;
        !empty($params['openid']) ? $openid = $params['openid'] : $openid = false;
        !empty($params['type']) ? $type = $params['type'] : error("参数错误");
        if(!$wx_unionid && !$openid){
            error("绑定信息有误");
        }
        if($type==1){
            $res = DB::name("member")->where(['member_id'=>$member['member_id'],'wx_openid'=>$openid])->find();
            if($res){
               error("此账号已被其他账号绑定");
            }
        }
        if($type==2) {
            $res = DB::name("member")->where(['member_id' => $member['member_id'], 'qq_openid' => $openid])->find();
            if ($res) {
                error("此账号已被其他账号绑定");
            }
        }
        switch ($type){
            case 1:
                $data['wx_openid'] = $openid;
                $data['wx_unionid'] = $wx_unionid;
                break;
            case 2:
                $data['qq_openid'] = $openid;
                break;
        }
        $update = DB::name("member")->where(["member_id"=>$member['member_id']])->update($data);
        if($update){
            success("绑定成功");
        }else{
            error("绑定失败");
        }
    }

    /**
     * 发送验证码
     */
    public function sendSMS($mobile=""){
        $params = Request::instance()->request();
        $mobile = $params["mobile"];
        if(!empty($params["state"])){
            switch ($params["state"]){
                case 1: $openid= "wx_openid";break;
                case 2:$openid = "qq_openid";break;
                case 3:$openid = "wo_openid";break;
            }
            $m_res = DB::name("Member")->where(["phone"=>$mobile])->value($openid);
            if($m_res){
                error("该手机已被其他账号绑定");
            }
        }
        if(!empty($params['type'])){
            $member = DB::name("Member")->where(['phone'=>$mobile])->find();
            if($member){
                error("该手机已注册不能绑定");
            }
        }

        if (empty($mobile) || !preg_match('#^13[\d]{9}$|14^[0-9]\d{8}|^15[0-9]\d{8}$|^18[0-9]\d{8}|^17[0-9]\d{8}$#', $mobile)) {
            error("手机格式不正确");
        }else{
            //一分钟只能发送一条
            $intime = DB::name("Mobile_sms")->field(["intime"])->where(["mobile"=>$mobile])->order('intime desc')->find();;
            $mistiming = time()-intval($intime["intime"]);
            if($mistiming<60){
                error("一分钟只能发送一条短信");
            }
            //每天只能发送10条
            $send_count = DB::name("mobile_sms")->where(["mobile"=>$mobile,"date"=>date("Y-m-d")])->count();
            if($send_count>10) {
                error("今天短信发送数量已达上限");
            }

            $mobile_code = random(6, 1);
            $content = "您的验证码为".$mobile_code.",如非本人操作请忽略此消息。【百台云】";
        }
        $gateway = $this->zhutong_sendSMS($content,$mobile);
        $arr = explode(',',$gateway);
        //$result = substr($gateway,0,2);
        switch ($arr['0']){
            case 1:
                $data['mobile'] = $mobile;
                $data['code'] = $mobile_code;
                $data['state'] = 1;
                $data['date'] = date('Y-m-d',time());
                $data['intime'] = time();
                Db::name("Mobile_sms")->insert($data);
                success('验证码发送成功');
                break;
            case 12:
                error('提交号码错误!');
                break;
            case 13:
                error('短信内容为空!');
                break;
            case 17:
                error('一分钟内一个手机号只能发两次!');
                break;
            case 19:
                error('号码为黑号!');
                break;
            case 26:
                error('一小时内只能发五条!');
                break;
            case 27:
                error('一天一手机号只能发20条');
                break;
            default:
                error('发送失败!');
        }
    }
    /**
     * 注册和登录
     */
    public function message_login(){
        $param = Request::instance()->request();
        $log = empty($param["log"]) ? '116.42669': $param["log"];
        $lag = empty($param["lag"]) ? '39.917149': $param["lag"];
        if(empty($param["mobile"]) || !(preg_match("/^1[34578]{1}\d{9}$/",$param["mobile"])) || empty($param["yzm"])){
            error("验证不正确");
        }
        $mobile = $param["mobile"];
        $tv_id = $param['tv_id'];
        //获取默认验证码
        $default_verify = DB::name("system")->where(["id"=>1])->value("default_verify");
        //判断验证码是否有效期
        if($param['yzm'] != $default_verify) {
            $result = DB::name("Mobile_sms")->where(["mobile" => $mobile, "code" => $param["yzm"]])->order("intime desc")->find();
            if (!$result) {
                error("验证码不正确");
            }
            $state = $result["state"];
            $valid_time = time() - intval($result["intime"]);
            if ($valid_time > 600 || $state == 2) {
                error("验证码已失效,请重新发送");
            }
        }
        /**
         * 用户定位
         */
        if($log && $lag){
            $gwd = $lag.','.$log;
            $baidu_apikey =DB::name('system')->where(['id'=>'1'])->value('baidu_apikey');
            $file_contents = file_get_contents('http://api.map.baidu.com/geocoder/v2/?ak='.$baidu_apikey.'&location='.$gwd.'&output=json');
            $rs = json_decode($file_contents,true);
            $sheng = $rs['result']['addressComponent']['province'];
            $shi = $rs['result']['addressComponent']['city'];
            $qu = $rs['result']['addressComponent']['district'];
            $address = $rs['result']['formatted_address'];
        }
        $user = DB::name("member")->where(["phone"=>$mobile])->find();
        if($user){
            //用户存在的时候
            if($user['is_del']==2){
                error('账号被限制,请联系平台!');
            }else{
                $member_token = uniqid();
                $user["app_token"] = $member_token;
                $user["img"] = $user["header_img"];
                $merchants = DB::name("merchants")->where("member_id",$user["member_id"])->find();
                if($merchants){
                    $user["apply_state"] = $merchants["apply_state"];
                    $user["pay_state"] = $merchants["pay_state"];
                }else{
                    $user["apply_state"] = '0';
                    $user["pay_state"] = '0';
                }
                DB::name("member")->where(["member_id"=>$user["member_id"]])->update(["app_token"=>$member_token,'log'=>$log,'lag'=>$lag]);
                DB::name("mobile_sms")->where(["mobile_sms_id"=>$result['mobile_sms_id']])->update(["state"=>2]);
                success($user);
            }
        }else{
            //用户不存在的时候
            $photo = config('domain')."/uploads/touxiang/touxiang.png";
            $chars = "abcdefghijklmnopqrstuvwxyz123456789";
            mt_srand(10000000*(double)microtime());
            for ($i = 0, $str = '', $lc = strlen($chars)-1; $i < 12; $i++){
                $str .= $chars[mt_rand(0, $lc)];

            }
            $hx_password="123456";
            $hx = new Easemob();
            $result = $hx->huanxin_zhuce($str,$hx_password); //环信注册
            if(!$result){
                error("授权注册失败");
            }
            $data = [
                'app_token'=>uniqid(),
                'phone'=>$mobile,
                'uuid'=>get_guid(),
                'header_img'=>$photo,
                'username'=>"游荡者GA".$mobile,
                'ID'=>get_number(),
                'intime'=>time(),
                'alias'=>$str,
                'sex'=>1,
                'signature'=>"这个人很懒什么都没有留下！！",
                'hx_username'=>$str,
                'hx_password'=>$hx_password,
                'province'=>$sheng,
                'city'=>$shi,
                'area'=>$qu,
                'address'=>$address,
            ];
            !empty($tv_id)  &&  $data['tv_id'] = $tv_id;
            if ($member_id=DB::name('member')->insertGetId($data)){
                //验证成功进行状态修改
                DB::name("mobile_sms")->where(["mobile_sms_id"=>$result['mobile_sms_id']])->update(["state"=>2]);
                $user = DB::name('member')->where(['member_id'=>$member_id])->find();
                $user['img'] = $user["header_img"];
                $user["apply_state"] = '0';
                $user["pay_state"] = '0';
                success($user);
            }else {
                error('失败!');
            }
        }
    }
    /**
     *第三方登录判断
     */
    public  function is_exist_member(){
        $params =Request::instance()->param();
        $state = empty($params["state"]) ? error("参数错误") : $params["state"];
        $openid = empty($params["openid"]) ?error("无法获取用户信息") : $params["openid"];
        $wx_unionid = $params['wx_unionid'];
        switch ($state){
            case 1:
                if($wx_unionid){
                    $data['wx_unionid'] = $wx_unionid;
                }else{
                    $data['wx_openid'] = $openid;
                };
                break;
            case 2:
                $data['qq_openid'] = $openid;
                break;
            case 3:
                $data['wo_openid'] = $openid;
                break;
        }
        $user = DB::name("Member")->where($data)->find();
        if($user){
            //用户存在的时候
            if($user['is_del']==2){
                error('账号被限制,请联系平台!');
            }else{
                $member_token = uniqid();
                $user["app_token"] = $member_token;
                $merchants = DB::name("merchants")->where("member_id",$user["member_id"])->find();
                if($merchants){
                    $user["apply_state"] = $merchants["apply_state"];
                    $user["pay_state"] = $merchants["pay_state"];
                }else{
                    $user["apply_state"] = '0';
                    $user["pay_state"] = '0';
                }
                $update["app_token"] = $member_token;
                $update["uptime"] = time();
                DB::name("member")->where(["member_id"=>$user["member_id"]])->update($update);
                success($user);
            }
        }else{
            success(["status"=>'0']);
        }
    }

    /**
     * @第三方登陆（微信，qq）
     * @state 1:微信  2：qq    3:微博
     */
    public function third_login(){
        $params = Request::instance()->request();
        $params['log'] && $log = $params['log'];
        $params['lag'] && $lag = $params['lag'];
        $openid = empty($params['openid']) ? error("无法获取用户信息") : $params["openid"];
        $wx_unionid = $params['wx_unionid'];
        $state =empty($params['state']) ? error("参数错误") : $params["state"];
        $mobile = preg_match("/^1[34578]{1}\d{9}$/",$params["mobile"]) ? $params["mobile"] : error("手机号不合法");
        if(!in_array($state,array(1,2,3))){
            error("参数不符合要求");
        }
        switch ($state){
            case 1:
                $data['wx_openid'] = $openid;
                $open_type = "wx_openid";
                $data['wx_unionid'] = $wx_unionid;
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
        $default_verify = DB::name("system")->where(["id"=>1])->value("default_verify");
        //判断验证码是否有效期
        if($params['yzm'] != $default_verify) {
            $result = DB::name("Mobile_sms")->where(["mobile" => $mobile, "code" => $params["yzm"]])->order("intime desc")->find();
            if (!$result) {
                error("验证码不正确");
            }
            $state = $result["state"];
            $valid_time = time() - intval($result["intime"]);
            if ($valid_time > 600 || $state == 2) {
                error("验证码已失效,请重新发送");
            }
        }
        /**
         * 用户定位
         */
        if($log && $lag){
            $gwd = $lag.','.$log;
            $baidu_apikey =DB::name('system')->where(['id'=>'1'])->value('baidu_apikey');
            $file_contents = file_get_contents('http://api.map.baidu.com/geocoder/v2/?ak='.$baidu_apikey.'&location='.$gwd.'&output=json');
            $rs = json_decode($file_contents,true);
            $sheng = $rs['result']['addressComponent']['province'];
            $shi = $rs['result']['addressComponent']['city'];
            $qu = $rs['result']['addressComponent']['district'];
            $address = $rs['result']['formatted_address'];
        }else{
            $sheng = '';
            $shi = '';
            $qu = '';
            $address = '';
        }
        /**进行账号检测**/
        $bind_phone = DB::name("Member")->where(["phone"=>$params["mobile"]])->find();
        if($bind_phone){
            /**是否绑定其他账号**/
            $m_res = DB::name("Member")->where(["member_id"=>$bind_phone["member_id"]])->value($open_type);
            if($m_res){
               error("该账号已绑定其它手机");
            }else{
                $data["app_token"] = uniqid();
                $data["log"] = $log;
                $data["lag"] = $lag;
                $data["uptime"] = time();
                $up_res = DB::name("Member")->where(["member_id"=>$bind_phone["member_id"]])->update($data);
                if($up_res){
                    $user = DB::name("Member")->where(["member_id"=>$bind_phone["member_id"]])->find();
                    $user["img"] = $user["header_img"];
                    $merchants = DB::name("merchants")->where("member_id",$user["member_id"])->find();
                    if($merchants){
                        $user["apply_state"] = $merchants["apply_state"];
                        $user["pay_state"] = $merchants["pay_state"];
                    }else{
                        $user["apply_state"] = '0';
                        $user["pay_state"] = '0';
                    }
                    success($user);
                }else{
                    error("登录失败");
                }
            }
        }else{
            $member = Db::name('Member')->where($data)->find();
            if($member){    //存在该信息但没有绑定手机号
                $result = Db::name('member')->where(['member_id'=>$member['member_id']])->update(['phone'=>$mobile]);
                if($result){
                    success($member);
                }else{
                    error('失败!');
                }
            }else {
                $sex = empty($params["sex"]) ? 1 : $params["sex"];
                $username = empty($params["username"]) ? "bty_" . $mobile : $params["username"];
                $header_img = empty($params["header_img"]) ? config('domain') . "/uploads/touxiang/touxiang.png" : $params["header_img"];
                $chars = "abcdefghijklmnopqrstuvwxyz123456789";
                mt_srand(10000000 * (double)microtime());
                for ($i = 0, $str = '', $lc = strlen($chars) - 1; $i < 12; $i++) {
                    $str .= $chars[mt_rand(0, $lc)];
                }
                $hx_password = "123456";
                $data = [
                    $open_type => $openid,
                    'phone' => $mobile,
                    'app_token' => uniqid(),
                    'uuid' => get_guid(),
                    'header_img' => $header_img,
                    'username' => $username,
                    'ID' => get_number(),
                    'intime' => time(),
                    'alias' => $str,
                    'sex' => $sex,
                    'signature' => "这个人很懒什么都没有留下！！",
                    'hx_username' => $str,
                    'hx_password' => $hx_password,
                    'province' => $sheng,
                    'city' => $shi,
                    'area' => $qu,
                    'address' => $address,
                ];
                if($wx_unionid){
                    $data['wx_unionid'] = $wx_unionid;
                }
                if ($member_id = DB::name('member')->insertGetId($data)) {
                    $hx = new Easemob();
                    $result = $hx->huanxin_zhuce($str, $hx_password); //环信注册
                    if (!$result) {
                        error("授权注册失败");
                    }
                    $user = DB::name('member')->where(['member_id' => $member_id])->find();
                    $user['img'] = $user["header_img"];
                    $user["apply_state"] = '0';
                    $user["pay_state"] = '0';
                    success($user);
                } else {
                    error('失败!');
                }
            }
        }
    }
    /*
     * 微信网页授权登录
     */
    public function weixin(){
        //header("Content-type: text/html; charset=utf-8");

        $url = cookie('url');
        $tv_id = cookie('tv_id');
        $code = input('code');
        if(!$code){
            $APPID = $this->system['appid'];
            $REDIRECT_URI = config('domain').url('login/weixin');
            file_put_contents('1111a.txt',$REDIRECT_URI);
            $scope='snsapi_userinfo';
            $url='https://open.weixin.qq.com/connect/oauth2/authorize?appid='.$APPID.'&redirect_uri='.urlencode($REDIRECT_URI).'&response_type=code&scope='.$scope.'&state=wx'.'#wechat_redirect';
            header("Location:".$url);
            exit;
        }else{
            $appid = $this->system['appid'];
            $secret = $this->system['appsecret'];
            $get_token_url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid='.$appid.'&secret='.$secret.'&code='.$code.'&grant_type=authorization_code';
            $ch = curl_init();
            curl_setopt($ch,CURLOPT_URL,$get_token_url);
            curl_setopt($ch,CURLOPT_HEADER,0);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1 );
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
            $res = curl_exec($ch);
            curl_close($ch);
            $json_obj = json_decode($res,true);
            //根据openid和access_token查询用户信息
            $access_token = $json_obj['access_token'];
            $openid = $json_obj['openid'];
            $get_user_info_url = 'https://api.weixin.qq.com/sns/userinfo?access_token='.$access_token.'&openid='.$openid.'&lang=zh_CN';

            $ch = curl_init();
            curl_setopt($ch,CURLOPT_URL,$get_user_info_url);
            curl_setopt($ch,CURLOPT_HEADER,0);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1 );
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
            $res = curl_exec($ch);
            curl_close($ch);

            //解析json
            $arr = json_decode($res,true);
            if($arr['openid']){
                $Userdata = Db::name('Member');
                if($arr['unionid']){
                    $map['wx_unionid']=$arr['unionid'];
                }else{
                    $map['pwx_openid']=$arr['openid'];
                }
                $user = $Userdata->where($map)->find();
                if(!$user){
                    $chars = "abcdefghijklmnopqrstuvwxyz123456789";
                    mt_srand(10000000*(double)microtime());
                    for ($i = 0, $str = '', $lc = strlen($chars)-1; $i < 12; $i++){
                        $str .= $chars[mt_rand(0, $lc)];

                    }
                    $hx_password="123456";
                    $hx = new Easemob();
                    $result = $hx->huanxin_zhuce($str,$hx_password); //环信注册
                    if(!$result){
                        error("授权注册失败");
                    }
                    if($arr['unionid']){
                        $adddata['wx_unionid'] = $arr['unionid'];
                    }
                    if($tv_id){
                        $adddata['tv_id'] = $tv_id;
                    }
                    $adddata['hx_username'] = $str;
                    $adddata['hx_password'] = $hx_password;
                    $adddata['app_token'] = uniqid();
                    $adddata['pwx_openid'] = $arr['openid'];
                    $adddata['username'] = $arr['nickname'];
                    $adddata['header_img'] = $arr['headimgurl'];
                    $adddata['signature'] = "这个人很懒什么都没有留下！！";
                    $adddata['intime'] = time();
                    $result = Db::name('Member')->insertGetId($adddata);
                    $user = Db::name('Member')->where(['member_id'=>$result])->find();
                }else{
                    if(!$user['pwx_openid']){
                        $Userdata->where(['member_id'=>$user['member_id']])->update(['pwx_openid'=>$arr['openid']]);
                        $user = $Userdata->where(['member_id'=>$user['member_id']])->find();
                    }
                }
                cookie('user',json_encode($user));
                header("Location:".$url);
                die;
            }else{
                error("登录失败");
            }
        }
    }

    public function getjssdk()
    {
        $url = input('url');
        $url = urldecode($url);
        $jssdk = new Jssdk($this->system['appid'], $this->system['appsecret']);
        $signPackage = $jssdk->GetSignPackage($url);
        success($signPackage);
    }

    /**
     *图片上传
     * @dirname //头像上传路径
     */
    public function upload(){
        $up = new Upload();
        $up->upload('touxiang');
    }

    public function upload_img(){
        $up = new Upload();
        $up->upload_img('touxiang');
    }

    public function edit_huanxin(){
        $count = Db::name('Member')->where(['hx_username'=>['eq','']])->count();
        $number = ceil($count / 50);
        for ($a = 0; $a < $number; $a++) {
            $user = Db::name('Member')->where(['hx_username'=>['eq','']])->limit($a * 50, 50)->select();
            foreach ($user as $k => $v) {
                $chars = "abcdefghijklmnopqrstuvwxyz0123456789";
                for ($i = 0, $str = '', $lc = strlen($chars) - 1; $i < 12; $i++) {
                    $str .= $chars[mt_rand(0, $lc)];
                }
                for ($i = 0, $str1 = '', $lc = strlen($chars) - 1; $i < 13; $i++) {
                    $str1 .= $chars[mt_rand(0, $lc)];
                }
                $hx_password = "123456";
                $data['hx_password'] = $hx_password;
                $data['hx_username'] = $str;
                $data['alias'] = $str;
                $hx = new Easemob();
                $result = $hx->huanxin_zhuce($str,$hx_password); //环信注册
                if ($result) {
                    $result = Db::name('Member')->where(['member_id' => $v['member_id']])->update($data);
                }else{
                    error("错误");
                    die;
                }
            }
        }
    }
}