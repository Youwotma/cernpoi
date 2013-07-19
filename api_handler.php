<?php

error_reporting(E_ALL);
ini_set('display_errors', '1');

/*

CREATE TABLE pointsofinterest (
    id  INTEGER PRIMARY KEY AUTO_INCREMENT,
    lat VARCHAR(255),
    lon VARCHAR(255),
    name VARCHAR(255),
    req VARCHAR(255),
    img VARCHAR(255),
    description TEXT,
	active TINYINT(1),
    uid INTEGER
);


CREATE TABLE review (
    id  INTEGER PRIMARY KEY AUTO_INCREMENT,
    poi INTEGER,
    review TEXT,
    uid INTEGER
);

 */
include_once "router.php";
include_once "db.php";

// A regexp that matches a "regular" positive or negative floating point number
$CORD = "(-?[0-9]+(?:\\.[0-9]+)?)";

// Make sure we are connected to mysql, so mysql_real_escape_string does the right thing
getConn();

/**
 * Helper function
 * Gets a query result from the table pointsofinterest, returns the geoJSON
 * representation of the POIs.
 */
function query_to_geoJSON($q){
	$res = array();
	while($row = mysql_fetch_assoc($q)){
		$res[] = array(
			"type" => "Feature",
			"geometry" => array(
			    "type" => "Point",
				"coordinates" => array(floatval($row["lon"]), floatval($row["lat"])),
			),
			"properties" => $row,
		);
    }
    return array(
		"type" => "FeatureCollection",
		"features" => $res
	);
}

/**
 * View for the /POI/bbox/ method. Returns GeoJSON features in the provided
 * bbox
 */
function get_pois(){
    $q = query("SELECT * FROM pointsofinterest WHERE active=1;");
	return success(query_to_geoJSON($q));
}


/**
 * View for the /POI/add method
 */
function add_poi(){
	global $CORD;

	$validation = array(
		"lat" => "^$CORD$",
		"lon" => "^$CORD$",
		"name" => "\S+",
		"req" => "\S+",
		"img" => "^http:\\/\\/",
		"description" => "\S+",
	);

	$names = array();
	$values = array();
	foreach($validation as $key=>$regexp){
		if(!isset($_POST[$key])){
			return error(400, "Field $key required");
		}
		if(!preg_match("/$regexp/", $_POST[$key])){
			return error(400, "Field $key: invalid value");
		}
		$names[] = $key;
		$values[] = "'" . mysql_real_escape_string($_POST[$key]) . "'";
	}

	query("INSERT INTO pointsofinterest(" . join(",", $names) . ") VALUES (" . join(",", $values) . ");");
	return success(array(
		"id"=>mysql_insert_id(),
	));
}

/**
 * View for the /POI/<id>/reviews method
 */
function get_reviews(){
	$poi_id = intval($_GET["poi"]);
	$res = array();
    $q = query("SELECT review, md5(uid + '@hahaha.ch') as hash FROM review WHERE poi = $poi_id");
	while($row = mysql_fetch_array($q)){
		$res[] = array(
			"text" => $row["review"],
			"img" => "http://www.gravatar.com/avatar/{$row['hash']}?d=retro&f=y"
		);
	}
	return success($res);
}

/**
 * View for the /POI/<id>/reviews/add
 */
function add_review(){
	if(!isset($_POST["review"])){
		return error(400, "Field review required");
	}
	if(!preg_match("/\S+/", $_POST["review"])){
		return error(400, "Field review: invalid value");
	}
	$poi_id = intval($_POST["poi"]);

	$review = mysql_real_escape_string($_POST["review"]);
	$uid = intval($_POST["uid"]);

	query("INSERT INTO review(poi,uid,review) VALUES ($poi_id, $uid, '$review');");

	return success(array(
		"id"=>mysql_insert_id(),
	));
}


