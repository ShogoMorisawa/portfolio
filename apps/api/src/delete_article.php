<?php
require_once __DIR__ . '/vendor/autoload.php';

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once __DIR__ . '/auth.php';
$authUser = verifyToken();

$json = file_get_contents('php://input');
$data = json_decode($json, true);
$slug = $data['slug'] ?? '';

if(!$slug) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => '削除する記事のslugが指定されていません。'
    ]);
    exit;
}

$dsn = "pgsql:host=" . getenv('DB_HOST') . ";port=5432;dbname=" . getenv("DB_NAME") . ";sslmode=require";
$user = getenv('DB_USER');
$pass = getenv('DB_PASS');

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    $stmt = $pdo->prepare('DELETE FROM articles WHERE slug = :slug;');
    $stmt->execute([
        ':slug' => $slug,    
    ]);
    echo json_encode([
        'status' => 'success',
        'message' => '記事を削除しました。'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => '記事の削除に失敗しました。'
    ]);
}