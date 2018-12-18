<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/11/15
 * Time: 下午5:52
 */

namespace app\admin\model;
use app\common\model\Live as commonLive;
class Live extends commonLive{
    public function demo(){
        return $this->live_test();
    }
}