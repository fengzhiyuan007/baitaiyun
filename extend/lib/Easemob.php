<?php
namespace lib;
class Easemob{
    private $client_id = 'YXA6Lqb_QPELEee0GfWbERWWWg';
    private $client_secret = 'YXA6S28A-Ww9gAW_2mcF_AmrqGlQ-rE';
    private $org_name = "1184171027115484";
    private $app_name ='bty';
    private $url = '';

    //-------------------------------------------相关配置参数--------------------------------------------------------------//
    /**
     * 初始化参数
     * @param array $options
     * @param $options ['client_id']
     * @param $options ['client_secret']
     * @param $options ['org_name']
     * @param $options ['app_name']
     */
    public function __construct(){
        $options =[
            'client_id' => 'YXA6Lqb_QPELEee0GfWbERWWWg',
            'client_secret' => 'YXA6S28A-Ww9gAW_2mcF_AmrqGlQ-rE',
            'org_name' => "1184171027115484",
            'app_name' =>'bty',
            'url' => '',
        ];
        $this->client_id = isset ($options ['client_id']) ? $options ['client_id'] : '';
        $this->client_secret = isset ($options ['client_secret']) ? $options ['client_secret'] : '';
        $this->org_name = isset ($options ['org_name']) ? $options ['org_name'] : '';
        $this->app_name = isset ($options ['app_name']) ? $options ['app_name'] : '';
        if (!empty ($this->org_name) && !empty ($this->app_name)) {
            $this->url = 'https://a1.easemob.com/' . $this->org_name . '/' . $this->app_name;
        }
    }
    /**
     * 环信的cur方法封装
     */
    function huanxin_curl_request($url, $body, $header = array(), $method = "POST") {
        array_push ( $header, 'Accept:application/json' );
        array_push ( $header, 'Content-Type:application/json' );
        $ch = curl_init ();
        curl_setopt ( $ch, CURLOPT_CONNECTTIMEOUT, 60 );
        curl_setopt ( $ch, CURLOPT_URL, $url );
        curl_setopt ( $ch, CURLOPT_RETURNTRANSFER, 1 );
        // curl_setopt($ch, $method, 1);

        switch (strtoupper($method)) {
            case "GET" :
                curl_setopt ( $ch, CURLOPT_HTTPGET, true );
                break;
            case "POST" :
                curl_setopt ( $ch, CURLOPT_POST, true );
                break;
            case "PUT" :
                curl_setopt ( $ch, CURLOPT_CUSTOMREQUEST, "PUT" );
                break;
            case "DELETE" :
                curl_setopt ( $ch, CURLOPT_CUSTOMREQUEST, "DELETE" );
                break;
        }

        curl_setopt ( $ch, CURLOPT_USERAGENT, 'SSTS Browser/1.0' );
        curl_setopt ( $ch, CURLOPT_ENCODING, 'gzip' );
        curl_setopt ( $ch, CURLOPT_SSL_VERIFYPEER, FALSE );
        curl_setopt ( $ch, CURLOPT_SSL_VERIFYHOST, 2);
        if (isset ( $body {3} ) > 0) {
            curl_setopt ( $ch, CURLOPT_POSTFIELDS, $body );
        }
        if (count ( $header ) > 0) {
            curl_setopt ( $ch, CURLOPT_HTTPHEADER, $header );
        }
        $ret = curl_exec ( $ch );
        $err = curl_error ( $ch );
        curl_close ( $ch );
        // clear_object($ch);
        // clear_object($body);
        // clear_object($header);
        if ($err) {
            return $err;
        }
        return $ret;
    }
    /**
     *
     * curl方法的封装
     */
    public function postCurl($url,$body,$header=[],$type="POST"){
        //1.创建一个curl资源
        $ch = curl_init();
        //2.设置URL和相应的选项
        curl_setopt($ch,CURLOPT_URL,$url);//设置url
        //1)设置请求头
        array_push($header, 'Accept:application/json');
        array_push($header,'Content-Type:application/json');
        array_push($header, 'http:multipart/form-data');
        //设置为false,只会获得响应的正文(true的话会连响应头一并获取到)
        curl_setopt($ch,CURLOPT_HEADER,0);
        curl_setopt ( $ch, CURLOPT_TIMEOUT,5); // 设置超时限制防止死循环
        //设置发起连接前的等待时间，如果设置为0，则无限等待。
        curl_setopt($ch,CURLOPT_CONNECTTIMEOUT,5);
        //将curl_exec()获取的信息以文件流的形式返回，而不是直接输出。
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        //2)设备请求体
        if (count($body)>0) {
            //$b=json_encode($body,true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $body);//全部数据使用HTTP协议中的"POST"操作来发送。
        }
        //设置请求头
        if(count($header)>0){
            curl_setopt($ch,CURLOPT_HTTPHEADER,$header);
        }
        //上传文件相关设置
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);// 对认证证书来源的检查
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);// 从证书中检查SSL加密算

        //3)设置提交方式
        switch($type){
            case "GET":
                curl_setopt($ch,CURLOPT_HTTPGET,true);
                break;
            case "POST":
                curl_setopt($ch,CURLOPT_POST,true);
                break;
            case "PUT"://使用一个自定义的请求信息来代替"GET"或"HEAD"作为HTTP请                                                      求。这对于执行"DELETE" 或者其他更隐蔽的HTT
                curl_setopt($ch,CURLOPT_CUSTOMREQUEST,"PUT");
                break;
            case "DELETE":
                curl_setopt($ch,CURLOPT_CUSTOMREQUEST,"DELETE");
                break;
        }

        //4)在HTTP请求中包含一个"User-Agent: "头的字符串。-----必设
        curl_setopt($ch, CURLOPT_USERAGENT, 'SSTS Browser/1.0');
        curl_setopt($ch, CURLOPT_ENCODING, 'gzip');
        curl_setopt ( $ch, CURLOPT_USERAGENT, 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)' ); // 模拟用户使用的浏览器
        //5)


        //3.抓取URL并把它传递给浏览器
        $res=curl_exec($ch);
        $result=json_decode($res,true);
        //4.关闭curl资源，并且释放系统资源
        curl_close($ch);
        if(empty($result))
            return $res;
        else
            return $result;
    }
    //*********************************************************************环信直播的操作*******************************************************************//
    /**
     * 获取token
     */
    function getTokens($force = false)
    {
        $url = $this->url."/token";
        $options=array(
            "grant_type"=>"client_credentials",
            "client_id"=> $this->client_id,//huanxin_get_client_id(),
            "client_secret"=> $this->client_secret//huanxin_get_client_secret()
        );
        //json_encode()函数，可将PHP数组或对象转成json字符串，使用json_decode()函数，可以将json字符串转换为PHP数组或对象
        $body=json_encode($options);
        $url = $this->url.'/token';
        $i = true;
        while($i) {
            $tokenResult = $this->postCurl($url,$body);
            if($tokenResult){
                break;
            }
        }
        return "Authorization:Bearer ". $tokenResult["access_token"];
        //return "Authorization:Bearer YWMtG_u2OH1tEeWK7IWc3Nx2ygAAAVHjWllhTpavYYyhaI_WzIcHIQ9uitTvsmw";
    }
    /**
     * /**
     * 授权注册
     * @param $username //hx_username
     * @param $password //hx_password
     * @return bool
     */
    public function huanxin_zhuce($hx_username='',$hx_password=''){
        $url = $this->url . "/users";
        //自定义环信用户名和密码
        if(empty($hx_username)){
            $chars = "abcdefghijklmnopqrstuvwxyz123456789";
            mt_srand(10000000*(double)microtime());
            for ($i = 0, $str = '', $lc = strlen($chars)-1; $i < 12; $i++){
                $str .= $chars[mt_rand(0, $lc)];
            }
            $hx_username =$str;
        }
        if(empty($hx_password)){
            $hx_password="123456";
        }
        $param = array(
            "username" => $hx_username,
            "password" => $hx_password
        );
        $res = $this->huanxin_curl_request($url, json_encode($param));
        $tokenResult = json_decode($res, true);
        if($tokenResult["error"]=='duplicate_unique_property_exists'){
            return false;
        }
        $tokenResult["password"] = $param["password"];
        $huanxin_uuid = $tokenResult["entities"][0]["uuid"];
        $huanxin_username = $tokenResult["entities"][0]["username"];
        $huanxin_password = $param["password"];
        if (!($huanxin_uuid && $huanxin_username)) {
            return false;
        } else {
            return true;
        }
    }
    /*
    * 创建聊天室
    * @param $options
    * @return mixed
    */
    function createChatRoom($options){
        $url=$this->url."/chatrooms";
        $header=array($this->getTokens());
        $body=json_encode($options);
        $result=$this->postCurl($url,$body,$header);
        // 房间号'room_id'=>$result['data']['id'],
        return $result;
    }
    /*
    * 添加聊天室成员
    */
    function adduserChatRoom($usernames,$chatroomid){
        $url=$this->url."/chatrooms/$chatroomid/users";
        $header=array($this->getTokens());
        $body=json_encode(['usernames'=>[$usernames]]);
        $result=$this->postCurl($url,$body,$header);
        return $result;
    }
    /**
     *发送文本消息
     */
    function sendText($sender, $receiver, $msg,$ext)
    {
        $url = $this->url."/messages";
        $header=array($this->getTokens());
        $body = array(
            'target_type' => 'chatrooms',
            'target' => array(
                '0' => $receiver
            ),
            'msg' => array(
                'type' => "txt",
                'msg' => $msg
            ),
            'from' => $sender,
            'ext' => $ext
        );
        $result=$this->postCurl($url,json_encode($body),$header,'POST');
        return $result;
    }
}