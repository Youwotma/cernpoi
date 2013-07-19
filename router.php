<?php

$ERROR_STATUS_CODES = array(
    400 => "Bad Request",
    403 => "Forbidden",
    404 => "Not Found",
    405 => "Method Not Allowed",
    500 => "Internal Server Error",
);

function error($code, $msg){
    global $ERROR_STATUS_CODES;
    header("HTTP/1.0 $code " . $ERROR_STATUS_CODES[$code]);

	return array(
		"status" => "error",
		"errorCode" => $code,
		"errorMessage" => $msg
	);
}

function success($response){
    header("HTTP/1.0 200 OK");
	return array(
		"status" => "success",
		"response" => $response
	);
}

function require_method($method, $cb){
	return function() use ($cb, $method){
		if($_SERVER['REQUEST_METHOD'] != $method){
			return error(405, "Invalid Method (Method excepted: $method, Method used: {$_SERVER['REQUEST_METHOD']})");
		}
		return call_user_func_array($cb, func_get_args());
	};
}

function require_get($cb){
	return require_method("GET", $cb);
}

function require_post($cb){
	return require_method("POST", $cb);
}

function get_api_method(){
    $path = parse_url($_SERVER["REQUEST_URI"]);
    $path = $path["path"];
    $path = preg_replace("/^.*\/api\//", "", $path);
	return trim($path, " /");
}

function route($routes){
    $method = get_api_method();
	$matches = array();
	foreach($routes as $regexp=>$fn){
		if(preg_match("/$regexp/i", $method, $matches)){
			array_shift($matches);
            try{
    			return call_user_func_array($fn, $matches);
            }catch(Exception $e){
                return error(500, $e->getMessage());
            }
		}
	}
	return error(404, "Method '$method' not found");
}

?>
