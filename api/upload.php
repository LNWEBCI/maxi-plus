<?php
// api/upload.php - Téléversement sécurisé d'images
require_once __DIR__ . '/db.php';
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Aucun fichier valide reçu. Code erreur: ' . ($_FILES['image']['error'] ?? 'inconnu')]);
    exit;
}

$file = $_FILES['image'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Format d\'image non supporté. Veuillez envoyer un fichier JPG, PNG, WEBP ou SVG.']);
    exit;
}

// Limite 10 MB
if ($file['size'] > 10 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['error' => 'L\'image ne doit pas dépasser 10 Mo.']);
    exit;
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
if (empty($ext)) {
    $ext = 'jpg';
}

$uploadDir = __DIR__ . '/../uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$filename = 'img_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . strtolower($ext);
$destination = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $destination)) {
    $publicPath = 'uploads/' . $filename;
    echo json_encode([
        'success' => true,
        'url' => $publicPath,
        'message' => 'Image téléversée avec succès !'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Échec de l\'enregistrement de l\'image sur le serveur.']);
}
