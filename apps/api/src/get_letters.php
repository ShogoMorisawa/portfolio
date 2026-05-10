<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") exit();

require_once __DIR__ . '/auth.php';
$authUser = verifyToken();

try {
    $dsn = "pgsql:host=" . getenv('DB_HOST') . ";port=5432;dbname=" . getenv('DB_NAME') . ";sslmode=require";
    $pdo = new PDO($dsn, getenv('DB_USER'), getenv('DB_PASS'), [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

    $stmt = $pdo->query("
        SELECT id, visitor_id, name, email, message, reply, replied_at, reply_read, created_at
        FROM letters
        ORDER BY created_at DESC
    ");
    $letters = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['letters' => $letters]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'サーバーエラーが発生しました']);
}
