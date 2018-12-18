<?php 
include_once("image.php") ?>
<?php
error_reporting(0);
if (!empty($_FILES)) {
	$tempFile = $_FILES['Filedata']['tmp_name'];
	$targetPath = $_SERVER['DOCUMENT_ROOT'] . $_REQUEST['folder'] . '/';
	$new_file_name = new_name( $_FILES['Filedata']['name']);
	$targetFile =  str_replace('//','/',$targetPath) . $new_file_name;
    mkdir(str_replace('//','/',$targetPath), 0755, true);
	//闃叉涓枃鏂囦欢鍚嶄贡鐮�
	move_uploaded_file($tempFile,iconv('utf-8','gbk', $targetFile));
	$img = new image();
    //绛夋瘮渚嬭鍓�
    if (!empty($_REQUEST['width']) && !empty($_REQUEST['height'])) {
        $img->param($targetFile)->thumb($targetFile, $_REQUEST['width'], $_REQUEST['height'], 0, 0);
    }
    //甯︽按鍗�
    //$water = 'water.png';
   // $img->param($targetFile)->water($targetFile,$water,9);


	//杩斿洖鏂囦欢鐩稿鍦板潃
	echo $_REQUEST['folder'] . '/'.$new_file_name;
}


 function new_name($filename){
	$ext = pathinfo($filename);
	$ext = $ext['extension'];
	$name = basename($filename,$ext); 
	$name = md5($name.time()).'.'.$ext;
	return $name;
	
 }

?>