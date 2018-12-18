<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/27
 * Time: 上午10:19
 */

namespace app\admin\model;


use think\Model;

class Common extends Model
{
    // 设置当前模型的数据库连接
    // 设置当前模型的数据库连接
//    protected $connection = [
//        // 数据库类型
//        'type'        => 'mysql',
//        // 服务器地址
//        'hostname'    => '127.0.0.1',
//        // 数据库名
//        'database'    => 'thinkphp',
//        // 数据库用户名
//        'username'    => 'root',
//        // 数据库密码
//        'password'    => '',
//        // 数据库编码默认采用utf8
//        'charset'     => 'utf8',
//        // 数据库表前缀
//        'prefix'      => 'think_',
//        // 数据库调试模式
//        'debug'       => false,
//    ];
    protected $domain_url;
    protected function initialize(){
        parent::initialize();
        $this->domain_url = config('domain');
    }

    protected function domain($url){
        if(strpos($url,'http://') !== false){
            return $url;
        }else{
            return $this->domain_url.$url;
        }
    }
}