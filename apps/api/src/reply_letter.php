<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") exit();

require_once __DIR__ . '/auth.php';
$authUser = verifyToken();

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$letter_id = isset($data['letter_id']) ? (int)$data['letter_id'] : 0;
$reply = trim($data['reply'] ?? '');

if (!$letter_id || !$reply) {
    http_response_code(400);
    echo json_encode(['error' => 'letter_id and reply are required']);
    exit();
}

try {
    $dsn = "pgsql:host=" . getenv('DB_HOST') . ";port=5432;dbname=" . getenv('DB_NAME') . ";sslmode=require";
    $pdo = new PDO($dsn, getenv('DB_USER'), getenv('DB_PASS'), [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

    $stmt = $pdo->prepare("
        UPDATE letters
        SET reply = :reply,
        replied_at  = CURRENT_TIMESTAMP,
        reply_read  = FALSE
        WHERE id = :id
    ");
    $stmt->execute([
        ':reply' => $reply,
        ':id' => $letter_id,
    ]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => '指定された手紙が見つかりません']);
        exit();
    }

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'サーバーエラーが発生しました']);
}