<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/26
 * Time: 下午2:14
 */

namespace app\admin\controller;


use lib\Upload;

class Index extends Base
{
    public function index(){
//        $str = '2016年07月26日 15时35分';
//        preg_match_all('/\d/',$str,$arr);
//        $timer=implode('',$arr[0]);
//        echo $timer;die;
//        $time = strtotime('201607261535');
//        echo $time;die;
//        $aa = array();
//
//        $list = M("Order")->table("qj_order as a")->join("qj_distance as b ON a.order_id=b.`order_id`")->where("((".time()."-a.`date`< 30 AND b.distance <6) OR  (".time()."-a.`date` < 60 AND b.distance <11)) OR (".time()."-a.`date`<90 and b.distance<16) or (".time()."-a.`date`<120 and b.distance<20) or (".time()."-a.`date`>120 and b.distance>20)  AND b.`user_id`=3")->field("a.*,b.*")->select();
//        //echo M("Order")->getLastSql();die;
//        dump($list);die;
//        foreach($list as $k=>$v){
//            $dis = M('Distance')->where(array('user_id'=>3,'order_id'=>$v['order_id']))->getField('distance');
//            $time = time()-$v['date'];
//            if($dis<6 && $time<31){
//                    $aa[] = $list[$k];
//            }else if($dis>5 && $dis<11 && $time<61){
//                    $aa[] = $list[$k];
//            }else if($dis>10 && $dis<16 && $time<91){
//                    $aa[] = $list[$k];
//            }else if($dis>15 && $dis<21 && $time<121){
//                    $aa[] = $list[$k];
//            }else if($dis>20 && $time>120){
//                    $aa[] = $list[$k];
//            }
//
//        }
//        dump($aa);die;
//        $shopping = array('2' => array('shop_id'=>2,'nums'=>3),'3' => array('shop_id'=>2,'nums'=>3),'4' => array('shop_id'=>2,'nums'=>3));
//        $aa = serialize($shopping);
//        $bb = unserialize($aa);
//        echo $aa;
//        dump($bb);die;
        //服务器信息
        if (function_exists('gd_info')) {
            $gd = gd_info();
            $gd = $gd['GD Version'];
        } else {
            $gd = "不支持";
        }
        $info = array(
            '操作系统' => PHP_OS,
            '主机名IP端口' => $_SERVER['SERVER_NAME'] . ' (' . $_SERVER['SERVER_ADDR'] . ':' . $_SERVER['SERVER_PORT'] . ')',
            '运行环境' => $_SERVER["SERVER_SOFTWARE"],
            'PHP运行方式' => php_sapi_name(),
            '程序目录' => WEB_ROOT,
            'MYSQL版本' => function_exists("mysql_close") ? mysql_get_client_info() : '不支持',
            'GD库版本' => $gd,
//            'MYSQL版本' => mysql_get_server_info(),
            '上传附件限制' => ini_get('upload_max_filesize'),
            '执行时间限制' => ini_get('max_execution_time') . "秒",
            '剩余空间' => round((@disk_free_space(".") / (1024 * 1024)), 2) . 'M',
            '服务器时间' => date("Y年n月j日 H:i:s"),
            '北京时间' => gmdate("Y年n月j日 H:i:s", time() + 8 * 3600),
            '采集函数检测' => ini_get('allow_url_fopen') ? '支持' : '不支持',
            'register_globals' => get_cfg_var("register_globals") == "1" ? "ON" : "OFF",
            'magic_quotes_gpc' => (1 === get_magic_quotes_gpc()) ? 'YES' : 'NO',
            'magic_quotes_runtime' => (1 === get_magic_quotes_runtime()) ? 'YES' : 'NO',
        );
        $this->assign(['server_info'=>$info]);
        return $this->fetch();
    }

    public function test(){
        $img = 'http://dspx.tstmobile.com/uploads/thumb/1510715235962.png';
        $url = 'http://dspx.tstmobile.com/admin/login/sign_in.html';
        $qrcode_path = "/qrcode/" . time() . rand(100, 999) . '_qrcode.png';
        $result = qrcodeLogo($url,$img,'./'.$qrcode_path,8,9);
        pre($result);
        pre($qrcode_path);

        $array = getimagesize($img);
        pre($array);
    }

    public function test1(){
        $obj = New Upload();
        $img = './uploads/image/banner/20171101/4d15e87e6f509be36d74f3f54d8e25fa.jpg';
        $result = $obj->save_thumb($img,50);
        pre($result);
    }
}