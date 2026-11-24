<?php
// api/site_settings.php - Personnalisation des images et contenus du site
require_once __DIR__ . '/db.php';
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
header('Content-Type: application/json; charset=UTF-8');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $settings = $pdo->query("SELECT * FROM site_settings")->fetchAll();
    $keyed = [];
    foreach ($settings as $s) {
        $keyed[$s['key_name']] = [
            'value_text' => $s['value_text'],
            'image_url' => $s['image_url'],
            'description' => $s['description'],
            'updated_at' => $s['updated_at']
        ];
    }

    echo json_encode([
        'success' => true,
        'settings' => $keyed
    ]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    $key = trim($input['key_name'] ?? '');
    $valueText = trim($input['value_text'] ?? '');
    $imageUrl = trim($input['image_url'] ?? '');
    $description = trim($input['description'] ?? '');

    if (empty($key)) {
        http_response_code(400);
        echo json_encode(['error' => 'Clé de paramètre requise']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO site_settings (key_name, value_text, image_url, description, updated_at) 
                           VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                           ON CONFLICT(key_name) DO UPDATE SET 
                           value_text = excluded.value_text,
                           image_url = excluded.image_url,
                           updated_at = CURRENT_TIMESTAMP");
    $stmt->execute([$key, $valueText, $imageUrl, $description]);

    echo json_encode([
        'success' => true,
        'message' => 'Image / Contenu du site mis à jour avec succès !'
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Méthode non autorisée']);
