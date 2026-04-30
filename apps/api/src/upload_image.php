<?php

require __DIR__ . '/vendor/autoload.php';

use Aws\Exception\AwsException;
use Aws\S3\S3Client;

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once __DIR__ . '/auth.php';
$authUser = verifyToken();

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["error" => "画像がアップロードされていません。"]);
    exit;
}

$file = $_FILES['image'];
$tmpPath = $file['tmp_name'];

$hash = md5_file($tmpPath);
$mimeType = mime_content_type($tmpPath);
$extension = explode('/', $mimeType)[1] ?: 'png';

// S3に保存するファイル名を生成（例: a1b2c3d4e5... .png）
$newFileName = "images/" . $hash . "." . $extension;

$bucket = getenv('AWS_BUCKET_NAME');
$s3Client = new S3Client([
    'version' => 'latest',
    'region' => getenv('AWS_REGION'),
    'credentials' => [
        'key' => getenv('AWS_ACCESS_KEY_ID'),
        'secret' => getenv('AWS_SECRET_ACCESS_KEY'),
    ]
]);

try {
    $result = $s3Client->putObject([
        'Bucket' => $bucket,
        'Key' => $newFileName,
        'SourceFile' => $tmpPath,
        'ContentType' => $mimeType,
    ]);

    // アップロードされた画像の公開URLをフロントへ返す
    $imageUrl = $result['ObjectURL'];
    echo json_encode([
        "status" => "success",
        "url" => $imageUrl
    ]);
} catch (AwsException $e) {
    http_response_code(500);
    echo json_encode(["error" => "S3アップロード失敗: " . $e->getAwsErrorMessage()]);
}