<?php

// $messy_db = new SQLite3('messy.db');
// $port = 8005;
$messy_db = new SQLite3('messy.db');

// Enable CORS for web development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);


switch ($method) {
case 'GET':
    general_listing($_SERVER['PATH_INFO'], $messy_db);
    break;
case 'POST':
    break;
}

function general_listing($path, $messy_db) {

    switch ($path) {
    case '/cabinets':
        header('Content-Type: application/json');
        $result = $messy_db->query('select * from cabinets');
        echo json_encode($result->fetchArray(SQLITE3_NUM));
        break;
    case '/items':
        header('Content-Type: application/json');
        if (isset($_GET['cabinet_id'])) {
            $cabinet_id = $_GET['cabinet_id'];
        }
        if (isset($_GET['name'])) {
            $name = $_GET['name'];
        }

        if (isset($name) && isset($cabinet_id)) {
            $stmt = $messy_db->prepare(
                'select * from items
                where cabinet_id=:id
                and name like :name');
            $stmt->bindParam(':name', $name, SQLITE3_TEXT);
            $stmt->bindValue(':id', $cabinet_id, SQLITE3_INTEGER);
        } else if (isset($name)) {
            $stmt = $messy_db->prepare(
                'select * from items
                where name like :name');
            $stmt->bindParam(':name', $name, SQLITE3_TEXT);
        } else if (isset($cabinet_id)) {
            $stmt = $messy_db->prepare(
                'select * from items
                where cabinet_id=:id');
            $stmt->bindValue(':id', $cabinet_id, SQLITE3_INTEGER);
        } else {
            $stmt = $messy_db->prepare('select * from items');
        }
        $result = $stmt->execute();
        echo json_encode($result->fetchArray(SQLITE3_NUM));
        break;
    case str_starts_with($path, '/images'):
        header('Content-Type: image/png');
        $image = '.' . $path;
        $sanitized = realpath($image);
        // error_log($image);
        // error_log($sanitized);
        if (!str_starts_with($sanitized, realpath('./images'))) {
            http_response_code(403);
            break;
        }
        readfile($sanitized);

        break;
    default:
        http_response_code(404);
    }
}
$messy_db->close();

?>
