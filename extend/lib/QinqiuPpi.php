<?php
namespace lib;
load_trait('\vendor\Qiniu\Pili');  // 引入traits\controller\Jump
class  QinqiuPpi{
    private $ak = '';
    private $sk='';
    private $hubName = "";
    private $domian = "";

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
            'domian'=>'',

        ];
        $this->ak = isset($options["ak"]) ? $options["ak"] : '';
        $this->sk = isset($options["sk"]) ? $options["sk"] : '';
        $this->hubName = isset($options["hubName"]) ? $options["hubName"] : '';
        $this->domian = isset($options["domian"]) ? $options["domian"] : '';
    }

    /**
     * 创建一个hub对象
     */
    public function hub(){
        $ak = $this->ak;
        $sk = $this->sk;
        $hubName = $this->hubName;
        $mac = new \Qiniu\Pili\Mac($ak, $sk);
        $client = new \Qiniu\Qiniu\Pili\Client($mac);
        $hub = $client->hub($hubName);
        var_dump($hub);exit;
        return $hub;
    }

    /**
     * Stream的相关操作及信息
     */
    public function stream($streamKey = ''){
        //获取stream
        if(empty($streamKey)){
            $streamKey = "php-sdk-test" . time();
        }else{
            $streamKey = $streamKey;
        }
        $stream = hub()->stream($streamKey);
        try {
            //创建stream
            $resp = $this->hub()->create($streamKey);
            //获取stream info
            $resp = $stream->info();
            //列出所有流
            $resp = $this->hub()->listStreams("php-sdk-test", 1, "");
            //列出正在直播的流
            $resp = $this->hub()->listLiveStreams("php-sdk-test", 1, "");
            //返回流
            return $stream;
        } catch (\Exception $e) {
            echo "Error:", $e, "\n";
        }
    }

    /**
     * 启用流
     * @return mixed
     */
    public function  stream_enable(){
        try {
            //启用流
            $stream_info = stream()->info();
            //查询直播状态
            $status = stream()->liveStatus();
            return $stream_info;
        } catch (\Exception $e) {
            echo "Error:", $e, "\n";
        }
    }
    /**
     * 获取流的信息
     * @return mixed
     */
    public function  stream_info(){
        try {
            //获取流信息
            $stream_info = stream()->info();
            //查询直播状态
            $status = stream()->liveStatus();
            return $stream_info;
        } catch (\Exception $e) {
            echo "Error:", $e, "\n";
        }
    }

    /**
     * 禁用流
     * @return mixed
     */
    public function stream_disable(){
        try {
            //禁用流
            $stream_info = stream()->disable();
            //查询直播状态
            $status = stream()->liveStatus();
            return $stream_info;
        } catch (\Exception $e) {
            echo "Error:", $e, "\n";
        }
    }

    /**
     * 保存直播回放
     * @param $start 开始时间
     * @param $end 结束时间
     */
    public function save($start,$end){
        try {
            //保存直播回放
            $fname = stream()->save($start, $end);
            //保存的直播回放地址
            $url = $this->domian . $fname['fname'];
        } catch (\Exception $e) {
            echo "Error:", $e, "\n";
        }
    }

    /**
     * 查询直播历史
     * @param $start
     * @param $end
     */
    public function stream_historyActivity($start,$end){
        try {
            //查询直播历史
            $fname = stream()->historyActivity($start, $end);
        } catch (\Exception $e) {
            echo "Error:", $e, "\n";
        }
    }
    /**
     * RTMP推流地址: RTMPPublishURL(domain, hub, streamKey, mac, expireAfterSeconds)
     *RTMP直播地址: RTMPPlayURL(domain, hub, streamKey)
     *HLS直播地址: HLSPlayURL(domain, hub, streamKey)
     *HDL直播地址: HDLPlayURL(domain, hub, streamKey)
     *截图直播地址: SnapshotPlayURL(domain, hub, streamKey)
     */
    /**
     * @param $streamKey //流
     * @return array
     */
    public function push_url($streamKey){
        $domain = $this->domian;
        $hubName = $this->hubName;
        $ak = $this->ak;
        $sk = $this->sk;
        //获取流
        $streamKey = $this->stream($streamKey);
        //RTMP 推流地址
        $url = \Qiniu\Pili\RTMPPublishURL($domain, $hubName, $streamKey, 3600, $ak, $sk);
        //RTMP 直播放址
        $url2 = \Qiniu\Pili\RTMPPlayURL($domain, $hubName, $streamKey); //rtmp格式
        //HLS 直播地址
        $url3 = \Qiniu\Pili\HLSPlayURL($domain, $hubName, $streamKey);   //m3u8格式
        //HDL直播地址
        $url4 = \Qiniu\Pili\HDLPlayURL($domain, $hubName, $streamKey);     //flv格式
        //截图直播地址:
        $url5 =  \Qiniu\Pili\SnapshotPlayURL($domain, $hubName, $streamKey);

        $result = array('url'=>$url,'rtmp'=>$url2,'m3u8'=>$url3,'streamKey'=>$streamKey,'flv'=>$url4,"play_img" =>$url5);
        return $result;
    }
}