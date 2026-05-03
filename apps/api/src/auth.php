<?php
require_once __DIR__ . '/vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

function getJwtSecret(): string {
    $key = getenv('JWT_SECRET') ?: '';

    if ($key === '') {
        throw new Exception('JWT_SECRET が設定されていません。');
    }

    if (strlen($key) < 32) {
        throw new Exception('JWT_SECRET は 32 文字以上のランダム文字列にしてください。');
    }

    return $key;
}

function verifyToken(){
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    // Apache環境特有の挙動対策（念のため）
    if (!$authHeader && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }

    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];

        try {
            $key = getJwtSecret();
            $decoded = JWT::decode($jwt, new Key($key, 'HS256'));
            return $decoded;
        } catch (Exception $e) {
            error_log('auth.php: ' . $e->getMessage());
            http_response_code(401);
            echo json_encode([
                'status' => 'error',
                'message' => str_starts_with($e->getMessage(), 'JWT_SECRET')
                    ? $e->getMessage()
                    : '無効または期限切れのトークンです。'
            ]);
            exit;
        }
    } 

    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'message' => '認証トークンがありません。'
    ]);
    exit;
}
