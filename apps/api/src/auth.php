<?php
require_once __DIR__ . '/vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

function verifyToken(){
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    // Apache環境特有の挙動対策（念のため）
    if (!$authHeader && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
    }

    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
        $key = getenv('JWT_SECRET');


        try {
            $decoded = JWT::decode($jwt, new Key($key, 'HS256'));
            return $decoded;
        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode([
                'status' => 'error',
                'message' => '無効または期限切れのトークンです。'
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