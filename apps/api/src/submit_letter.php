<?php
require __DIR__ . '/vendor/autoload.php';

use Aws\Exception\AwsException;
use Aws\Ses\SesClient;

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") exit();

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$visitor_id = trim($data['visitor_id'] ?? '');
$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$message = trim($data['message'] ?? '');

if (!$visitor_id || !$name || !$message) {
    http_response_code(400);
    echo json_encode(['error' => '必須項目が不足しています']);
    exit();
}

try {
    $dsn = "pgsql:host=" . getenv('DB_HOST') . ";port=5432;dbname=" . getenv('DB_NAME') . ";sslmode=require";
    $pdo = new PDO($dsn, getenv('DB_USER'), getenv('DB_PASS'), [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

    $stmt = $pdo->prepare("INSERT INTO letters (visitor_id, name, email, message) VALUES (:visitor_id, :name, :email, :message)");
    $stmt->execute([
        ':visitor_id' => $visitor_id,
        ':name' => $name,
        ':email' => $email ?: null,
        ':message' => $message,
    ]);

    $ses = new SesClient([
        'version' => 'latest',
        'region' => 'ap-northeast-1',
    ]);
    $ses->sendEmail([
        'Source' => 'noreply@shogomorisawa.me',
        'Destination' => ['ToAddresses' => [getenv('MY_EMAIL')]],
        'Message' => [
            'Subject' => ['Data' => "📜 ポストに手紙が届きました（{$name}さん）", 'Charset' => 'UTF-8'],
            'Body' => ['Text' => ['Data' => "差出人: {$name}\n返信先: " .
                ($email ?: '未記入') . "\n\n{$message}", 'Charset' => 'UTF-8']],
        ],
    ]);
    echo json_encode(['success' => true]);
} catch (AwsException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'メール送信に失敗しました']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'サーバーエラーが発生しました']);
}