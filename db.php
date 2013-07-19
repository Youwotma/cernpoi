<?php

$conn=false;

function getConn(){
	global $conn;
	if(!$conn){
		$conn = mysql_connect("localhost","poi","");
		if(!$conn){
			throw new Exception("Error connecting to the database");
		}
		mysql_select_db("poi");
	}
	return $conn;
}


function query($q){
	$conn = getConn();
	$q = mysql_query($q);
	if(!$q){
		throw new Exception("Database error: " . mysql_error());
	}
	return $q;
}


?>
