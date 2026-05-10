<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") exit();

$visitor_id = trim($_GET['visitor_id'] ?? '');
if (!$visitor_id) {
    http_response_code(400);
    echo json_encode(['error' => 'visitor_id is required']);
    exit();
}

try {
    $dsn = "pgsql:host=" . getenv('DB_HOST') . ";port=5432;dbname=" . getenv('DB_NAME') . ";sslmode=require";
    $pdo = new PDO($dsn, getenv('DB_USER'), getenv('DB_PASS'), [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

    $stmt = $pdo->prepare("
          SELECT id, name, message, reply, replied_at, created_at
            FROM letters
           WHERE visitor_id = :visitor_id
             AND reply IS NOT NULL
             AND reply_read = FALSE
           ORDER BY replied_at ASC
      ");
    $stmt->execute([':visitor_id' => $visitor_id]);
    $letters = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['letters' => $letters]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'サーバーエラーが発生しました']);
}