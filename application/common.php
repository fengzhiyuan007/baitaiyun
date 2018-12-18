<?php
error_reporting(E_ERROR | E_PARSE );//过滤错误
// +----------------------------------------------------------------------
// | ThinkPHP [ WE CAN DO IT JUST THINK ]
// +----------------------------------------------------------------------
// | Copyright (c) 2006-2016 http://thinkphp.cn All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: 流年 <liu21st@gmail.com>
// +----------------------------------------------------------------------

// 应用公共文件
/**
 * curl_get请求
 * @param $url
 * @return mixed
 */
function curl_get($url){
        $ch = curl_init();
        //设置超时
        curl_setopt($ch,CURLOPT_TIMEOUT, "60");
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch,CURLOPT_SSL_VERIFYPEER,FALSE);
        curl_setopt($ch,CURLOPT_SSL_VERIFYHOST,FALSE);
        curl_setopt($ch, CURLOPT_HEADER, FALSE);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        //运行curl，结果以jason形式返回
        $res = curl_exec($ch);
        curl_close($ch);
        return $res;
}
/**
 * 产生随机的字符串
 * @param int $length
 * @param int $numeric
 * @return string
 */
function random($length = 6, $numeric = 0)
{
    PHP_VERSION < '4.2.0' && mt_srand((double)microtime() * 1000000);
    if ($numeric) {
        $hash = sprintf('%0' . $length . 'd', mt_rand(0, pow(10, $length) - 1));
    } else {
        $hash = '';
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghjkmnpqrstuvwxyz';
        $max = strlen($chars) - 1;
        for ($i = 0; $i < $length; $i++) {
            $hash .= $chars[mt_rand(0, $max)];
        }
    }
    return $hash;
}
/*
 * 成功处理函数
 */
function success($arr){
    //header("Content-type:text/html;charset=utf-8");
    header('Content-type: application/json');
    $d = [
        'status' 	=> 'ok',
        'data'		=> $arr
    ];
    $d = json_encode($d,JSON_UNESCAPED_UNICODE);
    $d = str_replace('null','""',$d);
    echo $d;
    exit;
} 
/**
 * @param $arr
 */
function error($arr){
    $data = [
        'status'    =>  'error',
        'data'      =>  $arr,
    ];
    echo  json_encode($data,JSON_UNESCAPED_UNICODE);
    exit();
}

function pending($arr){
    echo  json_encode([
        'status'=> 'pending',
        'data'=> $arr
    ]);
    exit();
}

/**
* @随机生成8位数字
*/
function get_number(){
    $a = range(0,9);
    for($i=0;$i<8;$i++){
        $b[] = array_rand($a);
    }
    $rs=join("",$b);
    return $rs;
}

/**
 * 生成用户的uuid
 * @return string
 */
function get_guid(){
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

/**
 *@生成uuid
 */
function uuid($prefix = '')
{
    $chars = md5(uniqid(mt_rand(), true));
    $uuid  = substr($chars,0,8) . '-';
    $uuid .= substr($chars,8,4) . '-';
    $uuid .= substr($chars,12,4) . '-';
    $uuid .= substr($chars,16,4) . '-';
    $uuid .= substr($chars,20,12);
    return $prefix . $uuid;
}

/**
 *@日期
 */
function translate_date($date){
    $today = strtotime(date("Y-m-d",time()));
    $time = strtotime($date);
    $value = $time - $today;
    if($value>0){
        $minutes = ceil((time()-$time)/60);
        if($minutes <=3 ){
            return '刚刚';
        }elseif(3<$minutes && $minutes<60){
            return $minutes.'分钟前';
        }else{
            $hour =  floor($minutes/60);
            return $hour.'小时前';
        }
    }else{
        if($today-$time<24*3600){
            return '昨天';
        }else{
            return date("Y-m-d",$time);
        }
    }
}

//验证码验证
function check_verify($code, $id = ''){
    $captcha = new \think\captcha\Captcha();
    return $captcha->check($code, $id);
}

//获取ip地址
function get_ip()
{
    global $ip;
    if(getenv("HTTP_CLIENT_IP")){
        $ip = getenv("HTTP_CLIENT_IP");
    }else if(getenv("HTTP_X_FORWARDED_FOR")){
        $ip = getenv("HTTP_X_FORWARDED_FOR");
    }elseif(getenv("REMOTE_ADDR")){
        $ip = getenv("REMOTE_ADDR");
    }else{
        $ip = "Unknow";
    }
    return $ip;
}

/**
 * 获取客户端IP地址
 * @param integer $type 返回类型 0 返回IP地址 1 返回IPV4地址数字
 * @param boolean $adv 是否进行高级模式获取（有可能被伪装）
 * @return mixed
 */
//function get_client_ip($type = 0,$adv=false) {
//    $type       =  $type ? 1 : 0;
//    static $ip  =   NULL;
//    if ($ip !== NULL) return $ip[$type];
//    if($adv){
//        if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
//            $arr    =   explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
//            $pos    =   array_search('unknown',$arr);
//            if(false !== $pos) unset($arr[$pos]);
//            $ip     =   trim($arr[0]);
//        }elseif (isset($_SERVER['HTTP_CLIENT_IP'])) {
//            $ip     =   $_SERVER['HTTP_CLIENT_IP'];
//        }elseif (isset($_SERVER['REMOTE_ADDR'])) {
//            $ip     =   $_SERVER['REMOTE_ADDR'];
//        }
//    }elseif (isset($_SERVER['REMOTE_ADDR'])) {
//        $ip     =   $_SERVER['REMOTE_ADDR'];
//    }
//    // IP地址合法验证
//    $long = sprintf("%u",ip2long($ip));
//    $ip   = $long ? array($ip, $long) : array('0.0.0.0', 0);
//    return $ip[$type];
//}

//加密
function my_encrypt($data) {
    return md5(config('AUTH_CODE') . md5($data));
}

//打印变量
function pre($content) {
    echo "<pre>";
    print_r($content);
    echo "</pre>";
}

/**
 * @计算两个时间戳相差的月份
 */
function get_month_value($time1,$time2){
    $year1  = date("Y",$time1);   // 时间1的年份
    $month1 = date("m",$time1);   // 时间1的月份
    $year2  = date("Y",$time2);   // 时间2的年份
    $month2 = date("m",$time2);   // 时间2的月份
    // 相差的月份
    $value =  ($year2 * 12 + $month2) - ($year1 * 12 + $month1);
    return $value;
}

function array_to_xml($arr){
    $xml = "<root>";
    foreach ($arr as $key=>$val){
        if(is_array($val)){
            $xml.="<".$key.">".array_to_xml($val)."</".$key.">";
        }else{
            $xml.="<".$key.">".$val."</".$key.">";
        }
    }
    $xml.="</root>";
    return $xml;
}

function arrayToXml($arr,$dom=0,$item=0){
    if (!$dom){
        $dom = new DOMDocument("1.0");
    }
    if(!$item){
        $item = $dom->createElement("root");
        $dom->appendChild($item);
    }
    foreach ($arr as $key=>$val){
        $itemx = $dom->createElement(is_string($key)?$key:"item");
        $item->appendChild($itemx);
        if (!is_array($val)){
            $text = $dom->createTextNode($val);
            $itemx->appendChild($text);

        }else {
            arrayToXml($val,$dom,$itemx);
        }
    }
    return $dom->saveXML();
}

//二维数组根据值分组
function array_group_by($arr, $key)
{
    $grouped = [];
    foreach ($arr as $value) {
        $grouped[$value[$key]][] = $value;
    }
    // Recursively build a nested grouping if more parameters are supplied
    // Each grouped array value is grouped according to the next sequential key
    if (func_num_args() > 2) {
        $args = func_get_args();
        foreach ($grouped as $key => $value) {
            $parms = array_merge([$value], array_slice($args, 2, func_num_args()));
            $grouped[$key] = call_user_func_array('array_group_by', $parms);
        }
    }
    return $grouped;
}

//毫秒级时间戳
function getMillisecond() {
    list($t1, $t2) = explode(' ', microtime());
    return (float)sprintf('%.0f',(floatval($t1)+floatval($t2))*1000);
}

function qrcodeLogo($url='',$logo='',$filepath,$level=3,$size=20){
        Vendor('phpqrcode.phpqrcode');//引入PHPQrcode
        $Level =intval($level) ;//容错级别
        $matrixPointSize = intval($size);//生成图片大小
        //生成二维码图片
        $object = new \QRcode();
        $time = time();
        $object::png($url, $filepath, $Level, $matrixPointSize, 2,true);
        $QR = $filepath;
        if ($logo !== FALSE) {
            $QR = imagecreatefromstring(file_get_contents($QR));
            $logo = imagecreatefromstring(file_get_contents($logo));
            $QR_width = imagesx($QR);//二维码图片宽度
            $QR_height = imagesy($QR);//二维码图片高度
            $logo_width = imagesx($logo);//logo图片宽度
            $logo_height = imagesy($logo);//logo图片高度
            $logo_qr_width = $QR_width / 6;
            $scale = $logo_width/$logo_qr_width;
            $logo_qr_height = $logo_height/$scale;
            $from_width = ($QR_width - $logo_qr_width) / 2;
            //重新组合图片并调整大小
            imagecopyresampled($QR, $logo, $from_width, $from_width, 0, 0, $logo_qr_width,
                $logo_qr_height, $logo_width, $logo_height);
        }
        //输出图片
        $path = '/qrcode/logo/' . time() . rand(100, 999) . '_qrcode.png';
        $result = imagepng($QR, '.'.$path);
        return $path;

}

/**
 *@param $url 地址
 *@param $filepath 保存地址
 */
//生成二维码
function qrcode($url,$filepath, $level=3,$size=4){
    if(!$url) return false;
    //加载二维码类
    Vendor('phpqrcode.phpqrcode');
    //容错级别
    $errorCorrectionLevel =intval($level) ;
    $matrixPointSize = intval($size);//生成图片大小
    //生成二维码图片
    $object = new QRcode();

    $result = $object->png($url, $filepath, $errorCorrectionLevel, $matrixPointSize, 2, true);
    return $result;
}

/**
+-----------------------------------------------------------------------------------------
 * 删除目录及目录下所有文件或删除指定文件
+-----------------------------------------------------------------------------------------
 * @param str $path   待删除目录路径
 * @param int $delDir 是否删除目录，1或true删除目录，0或false则只删除文件保留目录（包含子目录）
+-----------------------------------------------------------------------------------------
 * @return bool 返回删除状态
+-----------------------------------------------------------------------------------------
 */
function delDirAndFile($path, $delDir = FALSE) {
    $handle = opendir($path);
    if ($handle) {
        while (false !== ( $item = readdir($handle) )) {
            if ($item != "." && $item != "..")
                is_dir("$path/$item") ? delDirAndFile("$path/$item", $delDir) : unlink("$path/$item");
        }
        closedir($handle);
        if ($delDir)
            return rmdir($path);
    }else {
        if (file_exists($path)) {
            return unlink($path);
        } else {
            return FALSE;
        }
    }
}

/**
 * 快速文件数据读取和保存 针对简单类型数据 字符串、数组
 * @param string $name 缓存名称
 * @param mixed $value 缓存值
 * @param string $path 缓存路径
 * @return mixed
 */
function set_config($name, $value='', $path=WEB_ROOT) {
    static $_cache  = array();
    $filename       = $path . $name . '.php';
    if ('' !== $value) {
        if (is_null($value)) {
            // 删除缓存
            return false !== strpos($name,'*')?array_map("unlink", glob($filename)):unlink($filename);
        } else {
            // 缓存数据
            $dir            =   dirname($filename);
            // 目录不存在则创建
            if (!is_dir($dir))
                mkdir($dir,0755,true);
            $_cache[$name]  =   $value;
            return file_put_contents($filename, strip_whitespace("<?php\treturn " . var_export($value, true) . ";?>"));
        }
    }
    if (isset($_cache[$name]))
        return $_cache[$name];
    // 获取缓存数据
    if (is_file($filename)) {
        $value          =   include $filename;
        $_cache[$name]  =   $value;
    } else {
        $value          =   false;
    }
    return $value;
}


