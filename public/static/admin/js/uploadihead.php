<?php include_once("image.php") ?>
<?php
error_reporting(0);
define('__BASE__', dirname(__FILE__));
if (!empty($_FILES)) {
	$tempFile = $_FILES['Filedata']['tmp_name'];
	$targetPath = $_SERVER['DOCUMENT_ROOT'] . $_REQUEST['folder'] . '/';

	$new_file_name = 'head.jpg';
	$targetFile =  str_replace('//','/',$targetPath) . $new_file_name;
      mkdir(str_replace('//','/',$targetPath), 0755, true);

		//防止中文文件名乱码
		move_uploaded_file($tempFile,iconv('utf-8','gbk', $targetFile));

		//返回文件相对地址


//$water = 'water.gif';
$img = new image();

$img->param($targetFile)->thumb($targetFile,100,100,0,1);

echo get_relative_path($targetFile);


}


 function new_name($filename){
	$ext = pathinfo($filename);
	$ext = $ext['extension'];
	
	$name = basename($filename,$ext); 
	$name = md5($name.time()).'.'.$ext;
	return $name;
	
 }


 function get_relative_path($path,$dir = 'data'){
 	$strlen = strlen(substr(__BASE__, 0, 17));
 	$path = substr($path, $strlen);
	return '/'.substr($path,strpos($path,$dir),strlen($path ));
 }
?>