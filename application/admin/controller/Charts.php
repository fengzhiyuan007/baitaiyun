<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/11/17
 * Time: 下午4:01
 */

namespace app\admin\controller;

use think\Request;
use think\Db;
use think\Session;
class Charts extends Base
{
    public function month(){
        $month = date("Y-m",time());
        $this->assign(['month'=>$month]);
        return $this->fetch();
    }
    /**
     *@月活跃
     */
    public function month_code(){
        $code = input('code');
        !empty($code)   ?  $code = strtotime($code) : $code = time();
        $month = date("Y-m",$code);
        $stamp1 = strtotime($month);
        $stamp2 = strtotime("+1 month",$stamp1);
        $date_count = ($stamp2 - $stamp1)/24/3600;
        $a = [];        //活跃数据
        $first = date("d",$stamp1);
        $b = [$first];        //日期数据
        for($i=0;$i<$date_count;$i++){
            $start = strtotime("+{$i} day",$stamp1);
            $end = $i+1;
            $end = strtotime("+{$end} day",$stamp1);
//            $a1 = M('IntoApp')->where(['intime'=>['between',[$start,$end]]])
//                ->group('user_id')->count();   //某天活跃度
            $a1 = Db::query("select count(*) as a1 from (select count(*)  from `th_into_app` where `intime`
                between {$start} and {$end} group by `user_id`) a ") ;
            $a1 = $a1[0]['a1'];
            $a1 = (int)($a1);
            array_push($a,$a1);
            if($i+1<$date_count){
                $next = date("d",$end);
                array_push($b,$next);
            }
        }

//        $c = M('IntoApp')->where(['intime'=>['between',[$stamp1,$stamp2]]])
//            ->group('user_id')->count(); //当月总活跃
        $c = Db::query("select count(*) as c from (select count(*) from `th_into_app` where `intime`
             between $stamp1 and $stamp2 group by `user_id`) a ");
        $c = $c[0]['c'];
        $c = (int)($c);
        success(['a'=>$a,'b'=>$b,'c'=>$c]);
    }

    /**
     *@日活跃
     */
    public function day(){
        $month = date("Y-m-d",time());
        $this->assign(['month'=>$month]);
        return $this->fetch();
    }

    /**
     *@日活跃
     */
    public function day_code(){
        $code = input('code');
        !empty($code)   ?  $code = strtotime($code) : $code = time();
        $day = date("Y-m-d",$code);

        $stamp1 = strtotime($day);
        $stamp2 = strtotime("+1 day",$stamp1);
        $a = [];        //活跃数据
        $first = date("H:i",$stamp1);
        $b = [$first];        //日期数据
        for($i=0;$i<24;$i++){
            $start = strtotime("+{$i} hour",$stamp1);
            $end = $i+1;
            $end = strtotime("+{$end} hour",$stamp1);
            $a1 = Db::name('IntoApp')->where(['intime'=>['between',[$start,$end]],'date'=>$day])->count();
            $a1 = (int)$a1;
            array_push($a,$a1);
            $next = date("H:i",$end);
            array_push($b,$next);
        }

        /*        $c = M('IntoApp')->where(['intime'=>['between',[$stamp1,$stamp2]]])->count(); //当月总活跃*/
        $c = Db::query("select count(*) as c from (select count(*) from `th_into_app` where `intime`
             between $stamp1 and $stamp2 group by `user_id`) a ");
        $c = $c[0]['c'];
        $c = (int)($c);
        success(['a'=>$a,'b'=>$b,'c'=>$c]);
    }
}