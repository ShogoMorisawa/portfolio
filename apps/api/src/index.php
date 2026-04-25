<?php
//CORS設定 : TanStack Startからの通信を許可する
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$host = getenv('DB_HOST') ?: 'db';
$db = getenv('DB_NAME') ?: 'blog_db';
$user = getenv('DB_USER') ?: 'blog_user';
$pass = getenv('DB_PASS') ?: 'blog_pass';

try {
    $dsn = "pgsql:host=$host;dbname=$db";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    echo json_encode([
       "status" => "success",
       "message" => "blog API is running!",
       "database" => "PostgreSQL connected seccessful!"
    ]);
} catch (PDOException $e){
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed...",
        "error" => $e->getMessage()
    ]);
}