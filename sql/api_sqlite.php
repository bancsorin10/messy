<?php

// $messy_db = new SQLite3('messy.db');
// $port = 8005;
$messy_db = new SQLite3('messy.db');

// Enable CORS for web development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
$method = $_SERVER['REQUEST_METHOD'];
ini_set('display_errors', 1);


switch ($method) {
case 'GET':
    general_listing($_SERVER['PATH_INFO'], $messy_db);
    break;
case 'POST':
    handle_post($_SERVER['PATH_INFO'], $messy_db);
    break;
}

function save_photo() {
    if (isset($_FILES['photo']['name'])) {
        $upload_dir  = './images/';
        $file_name = $_FILES['photo']['name'];
        $target_path = $upload_dir . $file_name;
        $type = mime_content_type($_FILES['photo']['tmp_name']);
        if (!str_starts_with($type, "image/")) {
            http_response_code(403);
        }
        $result = move_uploaded_file($_FILES['photo']['tmp_name'], $target_path);
    }
}

function handle_post($path, $messy_db) {
    // $input = json_decode(file_get_contents('php://input'), true);
    // error_log(json_encode($input));
    error_log(print_r($_POST, true));
    if (isset($_FILES['photo']['name'])) {
        $photo = $_FILES['photo']['name'];
    } else {
        $photo = null;
    }
    // error_log(print_r($_POST, true));
    // error_log($path);
    switch ($path) {
    case '/add_cabinet':
        save_photo();
        // error_log('adding cabinet');
        $stmt = $messy_db->prepare(
            'insert into cabinets
            (name, description, photo) values
            (:name, :description, :photo)');
        $stmt->bindParam(':name', $_POST['name'], SQLITE3_TEXT);
        $stmt->bindParam(':description', $_POST['description'], SQLITE3_TEXT);
        $stmt->bindParam(':photo', $photo, SQLITE3_TEXT);
        error_log("executing " . $stmt->getSQL(true));
        $stmt->execute();
        break;
    case '/add_item':
        save_photo();
        $stmt = $messy_db->prepare(
            'insert into items
            (name, description, photo, cabinet_id) values
            (:name, :description, :photo, :id)');
        $stmt->bindParam(':name', $_POST['name'], SQLITE3_TEXT);
        $stmt->bindParam(':description', $_POST['description'], SQLITE3_TEXT);
        $stmt->bindParam(':photo', $photo, SQLITE3_TEXT);
        $stmt->bindValue(':id', $_POST['cabinet_id'], SQLITE3_INTEGER);
        error_log("executing " . $stmt->getSQL(true));
        $stmt->execute();
        break;
    default:
        http_response_code(404);
    }
}

function general_listing($path, $messy_db) {

    switch ($path) {
    case '/cabinets':
        header('Content-Type: application/json');
        $result = $messy_db->query('select * from cabinets');
        $data = array();
        while ($res = $result->fetchArray(SQLITE3_NUM)) {
            array_push($data, $res);
        }
        // echo json_encode($result->fetchArray(SQLITE3_NUM));
        echo json_encode($data);
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
        $data = array();
        while ($res = $result->fetchArray(SQLITE3_NUM)) {
            array_push($data, $res);
        }
        echo json_encode($data);
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
