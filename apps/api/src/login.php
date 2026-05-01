<?php
require __DIR__ . '/vendor/autoload.php';

use \Firebase\JWT\JWT;

function getJwtSecret(): string {
    $key = getenv("JWT_SECRET") ?: '';

    if ($key === '') {
        throw new Exception("JWT_SECRET が設定されていません。");
    }

    if (strlen($key) < 32) {
        throw new Exception("JWT_SECRET は 32 文字以上のランダム文字列にしてください。");
    }

    return $key;
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$json = file_get_contents("php://input");
$data = json_decode($json, true);

$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

$dsn = "pgsql:host=" . getenv('DB_HOST') . ";port=5432;dbname=" . getenv("DB_NAME") . ";sslmode=require";
$user = getenv("DB_USER");
$pass = getenv("DB_PASS");

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    $sql = "SELECT * FROM users WHERE username = :username";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':username'=>$username]);
    $loginUser = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($loginUser && password_verify($password, $loginUser['password_hash'])) {
        $key = getJwtSecret();

        $payload = [
            'iss' => 'shogomorisawa-blog',
            'iat' => time(),
            'exp' => time() + (60*60*24),
            'sub' => $loginUser['id'],
            'username' => $loginUser['username']
        ];
        $jwt = JWT::encode($payload, $key, 'HS256');
        echo json_encode([
            'status' => 'success',
            'message' => 'ログインに成功しました。',
            'token' => $jwt
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'ユーザー名またはパスワードが間違っています。'
        ]);
    }

} catch(Exception $e) {
    error_log('login.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
