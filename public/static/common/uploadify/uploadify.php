<?php
/*
Uploadify
Copyright (c) 2012 Reactive Apps, Ronnie Garcia
Released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/

// Define a destination
$uri = $_SERVER['REQUEST_URI'];
$a = explode("/", $uri);
$root =  "";
if($a[1]!=="Public"){
	$root =  "/".$a[1];
}

$targetFolder = $root.'/Public/upload/'.$_POST['dir']; // Relative to the root

//iconv('utf-8','gbk', $targetFile);

$fileTypes = array("jpg","png","gif","docx","zip","rar"); // File extensions
if (!empty($_FILES) ) {
	$tempFile = $_FILES['Filedata']['tmp_name'];
	$targetPath = $_SERVER['DOCUMENT_ROOT'] . $targetFolder;
	
	$new_file_name = new_name( $_FILES['Filedata']['name']);
	
	$targetFile = rtrim($targetPath,'/') . '/' . $new_file_name;
	// Validate the file type
	
	$fileParts = pathinfo($_FILES['Filedata']['name']);
	
	if (in_array($fileParts['extension'],$fileTypes)) {
		move_uploaded_file($tempFile,$targetFile);
		echo $new_file_name;
	} else {
		echo 'Invalid file type.';
	}
}else{
	echo 'no files.';
}
function new_name($filename){
	$ext = pathinfo($filename);
	$ext = $ext['extension'];
	global  $fileTypes;
	if(!in_array(strtolower($ext), $fileTypes)){
		$ext = "jpg";
	}
	$name = basename($filename,$ext);
	$name = md5($name.time()).'.'.$ext;
	return $name;

}
?>