<?php
// api/machines.php - Gestion des engins, tracteurs et poids lourds en location
require_once __DIR__ . '/db.php';
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
header('Content-Type: application/json; charset=UTF-8');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $status = $_GET['status'] ?? null;
    $type = $_GET['type'] ?? null;
    $id = $_GET['id'] ?? null;

    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM machines WHERE id = ?");
        $stmt->execute([$id]);
        $machine = $stmt->fetch();
        if ($machine) {
            echo json_encode($machine);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Engin introuvable']);
        }
        exit;
    }

    $query = "SELECT * FROM machines WHERE 1=1";
    $params = [];

    if (!empty($status) && $status !== 'all') {
        $query .= " AND status = ?";
        $params[] = $status;
    }

    if (!empty($type) && $type !== 'all') {
        $query .= " AND type = ?";
        $params[] = $type;
    }

    $query .= " ORDER BY featured DESC, id ASC";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $machines = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'machines' => $machines
    ]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    $name = trim($input['name'] ?? '');
    $type = trim($input['type'] ?? 'Pelle Mécanique');
    $brand = trim($input['brand'] ?? 'SDLG');
    $model = trim($input['model'] ?? '');
    $priceDay = (int)($input['price_day'] ?? 0);
    $priceMonth = (int)($input['price_month'] ?? 0);
    $specs = trim($input['specs'] ?? '');
    $status = trim($input['status'] ?? 'Disponible');
    $image = trim($input['image'] ?? 'assets/images/machine_excavator.svg');
    $featured = (int)($input['featured'] ?? 1);

    if (empty($name) || $priceDay <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Nom de l\'engin et tarif journalier requis.']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO machines (name, type, brand, model, price_day, price_month, specs, status, image, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$name, $type, $brand, $model, $priceDay, $priceMonth, $specs, $status, $image, $featured]);
    $newId = $pdo->lastInsertId();

    echo json_encode([
        'success' => true,
        'id' => $newId,
        'message' => 'Engin de chantier ajouté avec succès !'
    ]);
    exit;
}

if ($method === 'PUT') {
    $id = (int)($input['id'] ?? 0);
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID engin manquant']);
        exit;
    }

    // Mise à jour rapide du statut uniquement
    if (isset($input['status_only']) && $input['status_only']) {
        $status = trim($input['status'] ?? 'Disponible');
        $stmt = $pdo->prepare("UPDATE machines SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);
        echo json_encode([
            'success' => true,
            'message' => 'Statut de l\'engin mis à jour avec succès : ' . $status
        ]);
        exit;
    }

    // Mise à jour complète
    $name = trim($input['name'] ?? '');
    $type = trim($input['type'] ?? '');
    $brand = trim($input['brand'] ?? '');
    $model = trim($input['model'] ?? '');
    $priceDay = (int)($input['price_day'] ?? 0);
    $priceMonth = (int)($input['price_month'] ?? 0);
    $specs = trim($input['specs'] ?? '');
    $status = trim($input['status'] ?? 'Disponible');
    $image = trim($input['image'] ?? '');
    $featured = (int)($input['featured'] ?? 1);

    $stmt = $pdo->prepare("UPDATE machines SET name = ?, type = ?, brand = ?, model = ?, price_day = ?, price_month = ?, specs = ?, status = ?, image = ?, featured = ? WHERE id = ?");
    $stmt->execute([$name, $type, $brand, $model, $priceDay, $priceMonth, $specs, $status, $image, $featured, $id]);

    echo json_encode([
        'success' => true,
        'message' => 'Fiche engin mise à jour avec succès !'
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

    $stmt = $pdo->prepare("DELETE FROM machines WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode([
        'success' => true,
        'message' => 'Engin retiré du parc.'
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Méthode non autorisée']);
