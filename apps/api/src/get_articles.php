<?php
// CORS設定
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// DB接続
$dsn = "pgsql:host=" . getenv('DB_HOST') . ";port=5432;dbname=" . getenv("DB_NAME") . ";sslmode=require";
$user = getenv('DB_USER');
$pass = getenv('DB_PASS');

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    $stmt = $pdo->query("SELECT * FROM articles WHERE published_at IS NOT NULL ORDER BY published_at DESC");
    $articles = $stmt->fetchAll();

    echo json_encode($articles);
} catch (PDOException $e ){
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
