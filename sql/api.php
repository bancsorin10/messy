<?php

// $messy_db = new SQLite3('messy.db');
// $port = 8005;
$messy_db = new mysqli('localhost', 'root', 'root', 'messy');

http_response_code(200);
header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);


switch ($method) {
case 'GET':
    general_listing($_SERVER['PATH_INFO'], $messy_db);
    break;

}

function general_listing($path, $messy_db) {

    switch ($path) {
    case '/cabinets':
        $result = $messy_db->query('select * from cabinets');
        echo json_encode($result->fetch_all());
        break;
    case '/items':
        if (isset($_GET['cabinet_id'])) {
            $cabinet_id = $_GET['cabinet_id'];
        }
        if (isset($_GET['name'])) {
            $name = $_GET['name'];
        }

        if (isset($name) && isset($cabinet_id)) {
            $stmt = $messy_db->prepare(
                'select * from items
                where cabinet_id=?
                and name like ?');
            $stmt->bind_param('is', $cabinet_id, $name);
        } else if (isset($name)) {
            $stmt = $messy_db->prepare(
                'select * from items
                where name like ?');
            $stmt->bind_param('s', $name);
        } else if (isset($cabinet_id)) {
            $stmt = $messy_db->prepare(
                'select * from items
                where cabinet_id=?');
            $stmt->bind_param('i', $cabinet_id);
        } else {
            $stmt = $messy_db->prepare('select * from items');
        }
        $stmt->execute();
        $result = $stmt->get_result();
        echo json_encode($result->fetch_all());
        break;
    default:
        http_response_code(404);
    }
}
$messy_db->close();

?>
