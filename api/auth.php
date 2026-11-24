<?php
// api/auth.php - Authentification administrateur
require_once __DIR__ . '/db.php';
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
header('Content-Type: application/json; charset=UTF-8');

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'check') {
    if (isset($_SESSION['admin_user'])) {
        echo json_encode([
            'authenticated' => true,
            'user' => $_SESSION['admin_user']
        ]);
    } else {
        echo json_encode([
            'authenticated' => false
        ]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'login') {
    $input = json_decode(file_get_contents('php://input'), true);
    $email = trim($input['email'] ?? '');
    $password = trim($input['password'] ?? '');

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Veuillez saisir votre email et mot de passe.']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['admin_user'] = [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role']
        ];

        echo json_encode([
            'success' => true,
            'user' => $_SESSION['admin_user'],
            'message' => 'Connexion réussie.'
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Identifiants invalides.']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'logout') {
    unset($_SESSION['admin_user']);
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Déconnexion effectuée.']);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Action inconnue']);
