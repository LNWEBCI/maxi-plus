<?php
// api/orders.php - Gestion des commandes de pièces et réservations d'engins
require_once __DIR__ . '/db.php';
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
header('Content-Type: application/json; charset=UTF-8');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $status = $_GET['status'] ?? null;
    $id = $_GET['id'] ?? null;

    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ?");
        $stmt->execute([$id]);
        $order = $stmt->fetch();
        if ($order) {
            $order['items'] = json_decode($order['items_json'], true);
            echo json_encode($order);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Commande introuvable']);
        }
        exit;
    }

    $query = "SELECT * FROM orders WHERE 1=1";
    $params = [];

    if (!empty($status) && $status !== 'all') {
        $query .= " AND status = ?";
        $params[] = $status;
    }

    $query .= " ORDER BY id DESC";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $orders = $stmt->fetchAll();

    foreach ($orders as &$ord) {
        $ord['items'] = json_decode($ord['items_json'], true);
    }

    // Statistiques rapides pour le dashboard
    $stats = [
        'total_revenue' => (int)$pdo->query("SELECT SUM(total_amount) FROM orders WHERE status != 'Annulée'")->fetchColumn(),
        'orders_count' => (int)$pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn(),
        'pending_count' => (int)$pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'En attente'")->fetchColumn(),
        'products_count' => (int)$pdo->query("SELECT COUNT(*) FROM products")->fetchColumn(),
        'machines_available' => (int)$pdo->query("SELECT COUNT(*) FROM machines WHERE status = 'Disponible'")->fetchColumn(),
        'machines_rented' => (int)$pdo->query("SELECT COUNT(*) FROM machines WHERE status = 'En location'")->fetchColumn(),
    ];

    echo json_encode([
        'success' => true,
        'orders' => $orders,
        'stats' => $stats
    ]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    // Création d'une nouvelle commande (client ou admin)
    $customerName = trim($input['customer_name'] ?? '');
    $customerPhone = trim($input['customer_phone'] ?? '');
    $customerEmail = trim($input['customer_email'] ?? '');
    $customerCity = trim($input['customer_city'] ?? 'Abidjan');
    $type = trim($input['type'] ?? 'Vente Pièces');
    $items = $input['items'] ?? [];
    $totalAmount = (int)($input['total_amount'] ?? 0);
    $notes = trim($input['notes'] ?? '');

    if (empty($customerName) || empty($customerPhone)) {
        http_response_code(400);
        echo json_encode(['error' => 'Le nom du client et son numéro de téléphone / WhatsApp sont obligatoires.']);
        exit;
    }

    // Générer une référence de commande unique
    $orderRef = 'CMD-' . date('Y') . '-' . strtoupper(substr(uniqid(), -5));

    $stmt = $pdo->prepare("INSERT INTO orders (order_ref, customer_name, customer_phone, customer_email, customer_city, type, items_json, total_amount, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'En attente', ?)");
    $stmt->execute([
        $orderRef,
        $customerName,
        $customerPhone,
        $customerEmail,
        $customerCity,
        $type,
        json_encode($items, JSON_UNESCAPED_UNICODE),
        $totalAmount,
        $notes
    ]);

    $newId = $pdo->lastInsertId();

    echo json_encode([
        'success' => true,
        'id' => $newId,
        'order_ref' => $orderRef,
        'message' => 'Votre commande a bien été enregistrée ! Un conseiller MAXI PLUS SARL vous contacte rapidement pour la livraison.'
    ]);
    exit;
}

if ($method === 'PUT') {
    $id = (int)($input['id'] ?? 0);
    $status = trim($input['status'] ?? '');

    if (!$id || empty($status)) {
        http_response_code(400);
        echo json_encode(['error' => 'ID commande et statut requis.']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);

    echo json_encode([
        'success' => true,
        'message' => 'Statut de la commande mis à jour : ' . $status
    ]);
    exit;
}

if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? ($input['id'] ?? 0));
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID manquant']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM orders WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode([
        'success' => true,
        'message' => 'Commande supprimée avec succès.'
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Méthode non autorisée']);
