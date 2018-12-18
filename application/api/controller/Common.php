<?php
namespace app\api\controller;
use think\Controller;
use think\View;
use think\Db;
use opensearch;
use \think\Session;
use \think\Request;

class Common extends Controller
{
    protected $member;
    public $url='';
    public function _initialize(){
        header('Content-Type: application/json');
        header("Content-type:text/html;charset=utf-8");
        header("Access-Control-Allow-Origin:*");
        define('CONTROLLER_NAME',Request::instance()->controller());
        define('MODULE_NAME',Request::instance()->module());
        define('ACTION_NAME',Request::instance()->action());

        $this->url = config('domain');
        $text="\n\n".date("y-m-d H:i:s",time())."\n".$_SERVER["QUERY_STRING"]."\rpost:\r".var_export($_POST,true)."\rget:\r".var_export($_GET,true)."\rfile:\r".var_export($_FILES,true);
        file_put_contents("logo.txt", $text, FILE_APPEND);
    }
    public function get_guid(){
        mt_srand((double)microtime()*10000);
        $charid = strtoupper(md5(uniqid(rand(), true)));
        $hyphen = chr(45);
        $uuid =  substr($charid, 0, 8).$hyphen
            .substr($charid, 8, 4).$hyphen
            .substr($charid,12, 4).$hyphen
            .substr($charid,16, 4).$hyphen
            .substr($charid,20,12) ;
        return strtolower($uuid);
    }
    public function api_return($code,$msg,$data=''){
        header('Content-Type: application/json');
        echo json_encode(array('code'=>$code?:'999','msg'=>$msg?:'未知错误','data'=>$data));
        exit();
    }

    public function _empty(){
        return error("操作失败");
    }

    protected function set_pages($page_data,$pageurl) {
        $this->assign('page_vars', $page_data);
        $this->assign('page_url', $pageurl);
        $pagehtml = $this->fetch('public:page');
        $this->assign('page', $pagehtml);
    }

    /**
     * @return array|false|mixed|\PDOStatement|string|\think\Model
     */
    function checklogin()
    {
        $param = Request::instance()->request();
        if(empty($param['uid']) || empty($param['token'])){
            pending("token failed");
        }
        $data["member_id"] = $param["uid"];
        $data["app_token"] = $param["token"];
        $rel = DB::name("member")->where($data)->find();
        if (!$rel) {
            pending("token failed");
        } else {
            if ($rel['is_del'] == 2) {
                error("账号被禁止登录");
            } else {
                //如果是会员,判断会员是否到期,到期变成普通会员
//                if ($rel['type'] == 2) {
//                    if ($rel['expiration_time'] < time()) {
//                        DB::name('member')->where(['member_id' => $param["uid"]])->update(['type' => 1, 'uptime' => time()]);
//                    }
//                }
                $day = date("Y-m-d");
                $check =Db::name('IntoApp')->where(['user_id'=>$rel['member_id'],'date'=>$day])->find();
                if(!$check){
                    Db::name('IntoApp')->insert(['intime'=>time(),'user_id'=>$rel['member_id'],'date'=>$day]);
                }else{
                    Db::name('IntoApp')->where(['into_app'=>$check['into_app']])->update(['intime'=>time()]);
                }
                return $rel;
            }
        }
    }
    //判断是否正正数
    protected function isSignlessInteger($string){
        if ((floor($string) - $string) !==0){
            return true;
        }else{
            return false;
        }
    }
    //根据地址获取经纬度
    protected function getLonLat($address){
        $ak =DB::name('system')->where(['id'=>'1'])->value('baidu_apikey');
        $api = 'http://api.map.baidu.com/geocoder/v2/?ak='.$ak.'&output=json&address='.$address;

        $position = file_get_contents($api);
        $position = json_decode($position, true);
        $array = $position['result']['location'];
        $position = array($array['lng'],$array['lat']);//经度，纬度
        return $position;
    }

    protected function time2Units ($time) //计算时间
    {
        $year   = floor($time / 60 / 60 / 24 / 365);
        $time  -= $year * 60 * 60 * 24 * 365;
        $month  = floor($time / 60 / 60 / 24 / 30);
        $time  -= $month * 60 * 60 * 24 * 30;
        $week   = floor($time / 60 / 60 / 24 / 7);
        $time  -= $week * 60 * 60 * 24 * 7;
        $day    = floor($time / 60 / 60 / 24);
        $time  -= $day * 60 * 60 * 24;
        $hour   = floor($time / 60 / 60);
        $time  -= $hour * 60 * 60;
        $minute = floor($time / 60);
        $time  -= $minute * 60;
        $second = $time;
        $elapse = '';

        $unitArr = array('年'  =>'year', '个月'=>'month',  '周'=>'week', '天'=>'day',
            '小时'=>'hour', '分钟'=>'minute', '秒'=>'second'
        );

        foreach ( $unitArr as $cn => $u )
        {
            if ( $$u > 0 )
            {
                $elapse = $$u . $cn;
                break;
            }
        }

        return $elapse;
    }

    protected function timediff($begin_time,$end_time)
    {
        if($begin_time < $end_time){
            $starttime = $begin_time;
            $endtime = $end_time;
        }else{
            $starttime = $end_time;
            $endtime = $begin_time;
        }

        //计算天数
        $timediff = $endtime-$starttime;
        $days = intval($timediff/86400);
        //计算小时数
        $remain = $timediff%86400;//取消注释后下一行的变量改为$remain，则是去掉天数后剩余的小时数，分钟及描述同理
        $hours = intval($timediff/3600);
        //计算分钟数
        $mins = intval(($timediff-$days*86400-$hours*3600)/60);
        //$mins = intval($timediff/60);
        //计算秒数
        //$secs = $timediff-$days*86400-$hours*3600-$remain*60;
        $days   ?   $days = $days.'天'   :   $days = '';
        $hours  ?   $hours = $hours.'小时'    :   $hours = '';
        $mins   ?   $mins = $mins.'分'   :   $mins = '';
        return $days.$hours.$mins;
    }
    /**
     *@写入用户余额记录
     */
    protected function set_amount($member_id,$amount,$type,$content){
        $data['member_id'] = $member_id;
        $data['amount'] =   $amount;
        $data['type']   =   $type;
        $data['content']    = $content;
        $data['intime'] =   date("Y-m-d H:i:s",time());
        $result = Db::name('AmountRecord')->insert($data);
        if($result){
            return true;
        }else{
            return false;
        }
    }

    /**
     *写入用户钻石记录
     * @param $member_id用户id
     * @param $type 1加2减
     * @param $content 内容备注
     * @param $diamond 钻石
     * @param $zeng 赠送的钻石
     */
    protected function insertDiamondRecord($member_id,$type,$content='',$diamond=0,$zeng=0){
        $data['member_id'] = $member_id;
        $data['type']   =   $type;
        $data['content']    = $content;
        $data['diamond'] =   $diamond;
        $data['zeng'] =   $zeng;
        $data['intime'] =   date("Y-m-d H:i:s",time());
        $result = Db::name('diamond_record')->insert($data);
        if($result){
            return true;
        }else{
            return false;
        }
    }

    //图像变模糊
    function gaussian_blur($srcImg,$savepath=null,$savename=null,$blurFactor=3){
        $gdImageResource = image_create_from_ext($srcImg);
        $srcImgObj = blur($gdImageResource,$blurFactor);
        $temp = pathinfo($srcImg);
        $name = $temp['basename'];
        $path = $temp['dirname'];
        $exte = $temp['extension'];
        $savename = $savename ? $savename : $name;
        $savepath = $savepath ? $savepath : $path;
        $savefile = $savepath .'/'. $savename;
        $srcinfo = @getimagesize($srcImg);
        switch ($srcinfo[2]) {
            case 1: imagegif($srcImgObj, $savefile); break;
            case 2: imagejpeg($srcImgObj, $savefile); break;
            case 3: imagepng($srcImgObj, $savefile); break;
            default: return '保存失败'; //保存失败
        }

        return $savefile;
        imagedestroy($srcImgObj);
    }

    /**
     * Strong Blur
     *
     * @param  $gdImageResource  图片资源
     * @param  $blurFactor          可选择的模糊程度
     *  可选择的模糊程度  0使用   3默认   超过5时 极其模糊
     * @return GD image 图片资源类型
     * @author Martijn Frazer, idea based on http://stackoverflow.com/a/20264482
     */
    function blur($gdImageResource, $blurFactor = 3)
    {
        // blurFactor has to be an integer
        $blurFactor = round($blurFactor);

        $originalWidth = imagesx($gdImageResource);
        $originalHeight = imagesy($gdImageResource);

        $smallestWidth = ceil($originalWidth * pow(0.5, $blurFactor));
        $smallestHeight = ceil($originalHeight * pow(0.5, $blurFactor));

        // for the first run, the previous image is the original input
        $prevImage = $gdImageResource;
        $prevWidth = $originalWidth;
        $prevHeight = $originalHeight;

        // scale way down and gradually scale back up, blurring all the way
        for($i = 0; $i < $blurFactor; $i += 1)
        {
            // determine dimensions of next image
            $nextWidth = $smallestWidth * pow(2, $i);
            $nextHeight = $smallestHeight * pow(2, $i);

            // resize previous image to next size
            $nextImage = imagecreatetruecolor($nextWidth, $nextHeight);
            imagecopyresized($nextImage, $prevImage, 0, 0, 0, 0,
                $nextWidth, $nextHeight, $prevWidth, $prevHeight);

            // apply blur filter
            imagefilter($nextImage, IMG_FILTER_GAUSSIAN_BLUR);

            // now the new image becomes the previous image for the next step
            $prevImage = $nextImage;
            $prevWidth = $nextWidth;
            $prevHeight = $nextHeight;
        }

        // scale back to original size and blur one more time
        imagecopyresized($gdImageResource, $nextImage,
            0, 0, 0, 0, $originalWidth, $originalHeight, $nextWidth, $nextHeight);
        imagefilter($gdImageResource, IMG_FILTER_GAUSSIAN_BLUR);

        // clean up
        imagedestroy($prevImage);

        // return result
        return $gdImageResource;
    }

    //数组转对象
    function arrayToObject($arr){
        if(is_array($arr)){
            return (object) array_map(__FUNCTION__, $arr);
        }else{
            return $arr;
        }
    }


    /**
    +----------------------------------------------------------
     * 功能：字符串截取指定长度
     * leo.li hengqin2008@qq.com
    +----------------------------------------------------------
     * @param string    $string      待截取的字符串
     * @param int       $len         截取的长度
     * @param int       $start       从第几个字符开始截取
     * @param boolean   $suffix      是否在截取后的字符串后跟上省略号
    +----------------------------------------------------------
     * @return string               返回截取后的字符串
    +----------------------------------------------------------
     */
    function cutStr($str, $len = 100, $start = 0, $suffix = 1) {
        $str = strip_tags(trim(strip_tags($str)));
        $str = str_replace(array("\n", "\t"), "", $str);
        $strlen = mb_strlen($str);
        while ($strlen) {
            $array[] = mb_substr($str, 0, 1, "utf8");
            $str = mb_substr($str, 1, $strlen, "utf8");
            $strlen = mb_strlen($str);
        }
        $end = $len + $start;
        $str = '';
        for ($i = $start; $i < $end; $i++) {
            $str.=$array[$i];
        }
        return count($array) > $len ? ($suffix == 1 ? $str . "&hellip;" : $str) : $str;
    }

    /**
    +----------------------------------------------------------
     * 功能：检测一个目录是否存在，不存在则创建它
    +----------------------------------------------------------
     * @param string    $path      待检测的目录
    +----------------------------------------------------------
     * @return boolean
    +----------------------------------------------------------
     */
    function makeDir($path) {
        return is_dir($path) or (makeDir(dirname($path)) and @mkdir($path, 0777));
    }

    /**
    +----------------------------------------------------------
     * 将一个字符串部分字符用*替代隐藏
    +----------------------------------------------------------
     * @param string    $string   待转换的字符串
     * @param int       $bengin   起始位置，从0开始计数，当$type=4时，表示左侧保留长度
     * @param int       $len      需要转换成*的字符个数，当$type=4时，表示右侧保留长度
     * @param int       $type     转换类型：0，从左向右隐藏；1，从右向左隐藏；2，从指定字符位置分割前由右向左隐藏；3，从指定字符位置分割后由左向右隐藏；4，保留首末指定字符串
     * @param string    $glue     分割符
    +----------------------------------------------------------
     * @return string   处理后的字符串
    +----------------------------------------------------------
     */
    function hideStr($string, $bengin = 0, $len = 4, $type = 0, $glue = "@") {
        if (empty($string))
            return false;
        $array = array();
        if ($type == 0 || $type == 1 || $type == 4) {
            $strlen = $length = mb_strlen($string);
            while ($strlen) {
                $array[] = mb_substr($string, 0, 1, "utf8");
                $string = mb_substr($string, 1, $strlen, "utf8");
                $strlen = mb_strlen($string);
            }
        }
        switch ($type) {
            case 1:
                $array = array_reverse($array);
                for ($i = $bengin; $i < ($bengin + $len); $i++) {
                    if (isset($array[$i]))
                        $array[$i] = "*";
                }
                $string = implode("", array_reverse($array));
                break;
            case 2:
                $array = explode($glue, $string);
                $array[0] = hideStr($array[0], $bengin, $len, 1);
                $string = implode($glue, $array);
                break;
            case 3:
                $array = explode($glue, $string);
                $array[1] = hideStr($array[1], $bengin, $len, 0);
                $string = implode($glue, $array);
                break;
            case 4:
                $left = $bengin;
                $right = $len;
                $tem = array();
                for ($i = 0; $i < ($length - $right); $i++) {
                    if (isset($array[$i]))
                        $tem[] = $i >= $left ? "*" : $array[$i];
                }
                $array = array_chunk(array_reverse($array), $right);
                $array = array_reverse($array[0]);
                for ($i = 0; $i < $right; $i++) {
                    $tem[] = $array[$i];
                }
                $string = implode("", $tem);
                break;
            default:
                for ($i = $bengin; $i < ($bengin + $len); $i++) {
                    if (isset($array[$i]))
                        $array[$i] = "*";
                }
                $string = implode("", $array);
                break;
        }
        return $string;
    }

    /**
    +----------------------------------------------------------
     * 将一个字符串转换成数组，支持中文
    +----------------------------------------------------------
     * @param string    $string   待转换成数组的字符串
    +----------------------------------------------------------
     * @return string   转换后的数组
    +----------------------------------------------------------
     */
    function strToArray($string) {
        $strlen = mb_strlen($string);
        while ($strlen) {
            $array[] = mb_substr($string, 0, 1, "utf8");
            $string = mb_substr($string, 1, $strlen, "utf8");
            $strlen = mb_strlen($string);
        }
        return $array;
    }

    /**
     * @判断提交的字符串中是否有敏感词
     * @有敏感词就替换
     */
    function is_sensitive_word($content){
        $str = Db::name('System')->where(['id'=>'1'])->value('sensitive_word');
        $rs = explode(',',$str);
        foreach ($rs as $k=>$v) {
            //$content = str_replace('**',$v,$content);
            if(strpos($content,$v) !== false){
               return error('内容含有敏感文字'.$v.'，请更换');
               break;
            }
        }
        return $content;
    }

    /*
 * @param $type 1系统消息；2订单消息；3其他消息
 * 写入消息
 * */
    function set_message($member_id,$message,$type,$order_id){
        $data['member_id'] = $member_id;
        $data['intime'] = date("Y-m-d H:i:s",time());
        $data['message'] = $message;
        $data['order_id'] = $order_id;
        $data['type'] = $type;
        $result = Db::name('Message')->insert($data);
        if($result){
            return true;
        }else{
            return false;
        }
    }



}
