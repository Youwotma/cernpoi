<?php

include "api_handler.php";
header('Content-type: application/json');
echo json_encode(get_reviews());

