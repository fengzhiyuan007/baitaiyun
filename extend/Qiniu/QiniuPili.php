<?php
namespace Qiniu;
require_once("Qiniu/Pili/Utils.php");
require_once("Qiniu/Pili/HttpResponse.php");
require_once("Qiniu/Pili/HttpRequest.php");
require_once("Qiniu/Pili/Mac.php");
require_once("Qiniu/Pili/Config.php");
require_once("Qiniu/Pili/Transport.php");
require_once("Qiniu/Pili/Stream.php");
require_once("Qiniu/Pili/Hub.php");
require_once("Qiniu/Pili/Client.php");
require_once("Qiniu/Pili/RoomClient.php");
class  QiniuPili{
    private $ak = '';
    private $sk='';
    private $hubName = "";
    private $publishurl = "";
    private $playurl='';

    /**
     * 初始化参数
     * QinqiuPpi constructor.
     * @param array $options
     * @param $options ['ak']
     * @param $options ['sk']
     * @param $options ['hubName'] //存储空间//防止直播卡顿尽量设置为加速域名
     * @param $options ['domian']  //域名
     */
    public function __construct($options = [])
    {
        $options= [
            'ak' => 'pZZF0OwUS-6imgKpBHgQlYGZgaRfuGXrzk9WEjHd',
            'sk' => 'Oy4g6ZE9fa6NXCki-3stTgFUVqL9grunk1__MqqF',
            'hubName'=>'100ytv',
            'publishurl'=>'pili-publish.100ytv.com',
            'playurl'=>'pili-live-rtmp.100ytv.com'

        ];
        $this->ak = isset($options["ak"]) ? $options["ak"] : '';
        $this->sk = isset($options["sk"]) ? $options["sk"] : '';
        $this->hubName = isset($options["hubName"]) ? $options["hubName"] : '';
        $this->publishurl = isset($options["publishurl"]) ? $options["publishurl"] : '';
        $this->playurl = isset($options["playurl"]) ? $options["playurl"] : '';
    }

    /**
     * @直播推流地址、播放地址
     */
    function push_address(){
        $ak = $this->ak;
        $sk = $this->sk;
        $hubName = $this->hubName;
        //创建hub
        $mac = new \Qiniu\Pili\Mac($ak, $sk);
        $client = new \Qiniu\Pili\Client($mac);
        $hub = $client->hub($hubName);
        //获取stream
        $streamKey = "php-sdk-test" . time();
        $stream = $hub->stream($streamKey);

        /**
         * 获取stream相关信息
         */
        try {
            //创建stream
            $resp = $hub->create($streamKey);
            //获取stream info
            $resp = $stream->info();
            //列出所有流
            $resp = $hub->listStreams("php-sdk-test", 1, "");
            //列出正在直播的流
            $resp = $hub->listLiveStreams("php-sdk-test", 1, "");

        } catch (\Exception $e) {
            // echo "Error:", $e, "\n";
        }

        try {
            //启用流
            $stream->enable();
            $status = $stream->liveStatus();
        } catch (\Exception $e) {
            // echo "Error:", $e, "\n";
        }
        //RTMP 推流地址
        $url = \Qiniu\Pili\RTMPPublishURL($this->publishurl, $hubName, $streamKey, 3600, $ak, $sk);
        //RTMP 直播放址
        $url2 = \Qiniu\Pili\RTMPPlayURL($this->playurl, $hubName, $streamKey);
        //HLS 直播地址
        $url3 = \Qiniu\Pili\HLSPlayURL($this->playurl, $hubName, $streamKey);
        $result = array('url'=>$url,'url2'=>$url2,'m3u8'=>$url3,'streamKey'=>$streamKey);
        return $result;
    }
    /**
     * @七牛创建房间
     */
    function creatroom($id,$room_name){
        $ak = $this->ak;
        $sk = $this->sk;
        //创建hub
        $mac = new \Qiniu\Pili\Mac($ak, $sk);
        $client = new \Qiniu\Pili\RoomClient($mac);
        try {
            $client->createRoom($id,$room_name);
            $room = $client->getRoom($room_name);
            //鉴权的有效时间: 24个小时.
            $token = $client->roomToken($room_name, $id, 'admin', (time()+3600*24));
        } catch (\Exception $e) {
            //echo "Error:", $e, "\n";
        }
       // $result = ['room_id'=>$room['owner_id'],'room_name'=>$room['room_name'],'token'=>$token];
        $result = ['room_id'=>123,'room_name'=>123,'token'=>123];
        return $result;
    }

    /**
     * 保存视频
     */
    public function save_vido($streamKey){
        $ak = $this->ak;
        $sk = $this->sk;
        $hubName = $this->hubName;
        //创建hub
        $mac = new \Qiniu\Pili\Mac($ak, $sk);
        $client = new \Qiniu\Pili\Client($mac);
        $hub = $client->hub($hubName);
        //获取stream
        $stream = $hub->stream($streamKey);
        //删除流
        $result = $stream->disable();
        //保存直播数据
        $fname = $stream->save(0,0);
        return $fname;
    }
    /**
     *获取七牛的活跃流
     */
    public function listLiveStreams(){
        $ak = $this->ak;
        $sk = $this->sk;
        $hubName = $this->hubName;
        //创建hub
        $mac = new \Qiniu\Pili\Mac($ak, $sk);
        $client = new \Qiniu\Pili\Client($mac);
        $hub = $client->hub($hubName);
        $stream_arr = $hub->listLiveStreams("php-sdk-test", 100000, "");
        $stream_list = $stream_arr["keys"];
        return $stream_list;

    }
    /*
    * 添加聊天室成员
 */
    function adduserChatRoom($usernames,$chatroomid){
        $url="https://a1.easemob.com/".huanxin_get_org_name()."/".huanxin_get_app_name()."/chatrooms/$chatroomid/users";
        $header=array(getTokens());
        $body=json_encode(['usernames'=>[$usernames]]);
        $result=postCurl($url,$body,$header);
        return $result;
    }
}

