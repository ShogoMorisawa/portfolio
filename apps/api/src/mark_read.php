<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$visitor_id = trim($data['visitor_id'] ?? '');
$letter_ids = array_map('intval', $data['letter_ids'] ?? []);

if (!$visitor_id || count($letter_ids) === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'visitor_id and letter_ids are required']);
    exit();
}

try {
    $dsn = "pgsql:host=" . getenv('DB_HOST') . ";port=5432;dbname=" .
        getenv('DB_NAME') . ";sslmode=require";
    $pdo = new PDO($dsn, getenv('DB_USER'), getenv('DB_PASS'),
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

    $placeholders = implode(',', array_fill(0, count($letter_ids), '?'));
    $sql = "UPDATE letters
            SET reply_read = TRUE
            WHERE visitor_id = ?
            AND id IN ($placeholders)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(array_merge([$visitor_id], $letter_ids));

    echo json_encode(['success' => true, 'updated' => $stmt->rowCount()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'サーバーエラーが発生しました']);
}