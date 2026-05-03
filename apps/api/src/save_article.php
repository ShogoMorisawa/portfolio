<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") exit();

require_once __DIR__ . '/auth.php';
$authUser = verifyToken();

$dsn = "pgsql:host=" . getenv('DB_HOST') . ";port=5432;dbname=" . getenv("DB_NAME") . ";sslmode=require";
$user = getenv('DB_USER');
$pass = getenv('DB_PASS');

try {
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) throw new Exception('データが空です');

    $tags = isset($data['tags']) && is_array($data['tags']) ? $data['tags'] : [];
    // PHPの配列 [a, b] を {a,b} というPostgreSQLの配列型（TEXT[]）に変換する
    $tagsStr = '{' . implode(',', array_map(fn($t) => '"' . str_replace('"', '\"', $t) . '"', $tags)) . '}';
    
    $sql = "INSERT INTO articles (slug, title, category, tags, description, body, thumbnail_url, published_at) 
            VALUES (:slug, :title, :category, :tags, :description, :body, :thumbnail_url, :published_at)
            ON CONFLICT (slug) DO UPDATE SET 
                title = EXCLUDED.title,
                category = EXCLUDED.category,
                tags = EXCLUDED.tags,
                description = EXCLUDED.description,
                body = EXCLUDED.body,
                thumbnail_url = EXCLUDED.thumbnail_url,
                published_at = COALESCE(articles.published_at, EXCLUDED.published_at), -- 一度公開されたら日時は維持
                updated_at = CURRENT_TIMESTAMP";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':slug' => $data['slug'],
        ':title' => $data['title'],
        ':category' => $data['category'],
        ':tags' => $tagsStr,
        ':description' => $data['description'],
        ':body' => json_encode($data['body']),
        ':thumbnail_url' => $data['thumbnail_url'],
        ':published_at' => !empty($data['is_publish']) ? date('Y-m-d H:i:s') : null,
    ]);

    echo json_encode([
        "status" => "success",
        "message" => "記事の保存が完了しました"
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
