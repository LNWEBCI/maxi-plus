<?php
// api/products.php - Gestion des pièces détachées et produits
require_once __DIR__ . '/db.php';
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
header('Content-Type: application/json; charset=UTF-8');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $categoryId = $_GET['category'] ?? null;
    $search = $_GET['search'] ?? null;
    $brand = $_GET['brand'] ?? null;
    $id = $_GET['id'] ?? null;

    if ($id) {
        $stmt = $pdo->prepare("SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch();
        if ($product) {
            echo json_encode($product);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Produit introuvable']);
        }
        exit;
    }

    $query = "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1";
    $params = [];

    if (!empty($categoryId) && $categoryId !== 'all') {
        $query .= " AND (p.category_id = ? OR c.slug = ?)";
        $params[] = $categoryId;
        $params[] = $categoryId;
    }

    if (!empty($brand) && $brand !== 'all') {
        $query .= " AND p.brand LIKE ?";
        $params[] = '%' . $brand . '%';
    }

    if (!empty($search)) {
        $query .= " AND (p.name LIKE ? OR p.ref LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)";
        $searchTerm = '%' . $search . '%';
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }

    $query .= " ORDER BY p.featured DESC, p.id DESC";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    // Récupérer également les catégories pour le filtre
    $categories = $pdo->query("SELECT * FROM categories ORDER BY id ASC")->fetchAll();

    echo json_encode([
        'success' => true,
        'products' => $products,
        'categories' => $categories
    ]);
    exit;
}

// Actions d'écriture (POST, PUT, DELETE)
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    $name = trim($input['name'] ?? '');
    $ref = trim($input['ref'] ?? '');
    $categoryId = (int)($input['category_id'] ?? 1);
    $brand = trim($input['brand'] ?? 'SDLG / LiuGong / XCMG');
    $price = (int)($input['price'] ?? 0);
    $stock = (int)($input['stock'] ?? 10);
    $description = trim($input['description'] ?? '');
    $image = trim($input['image'] ?? 'assets/images/part_filter_oil.svg');
    $featured = (int)($input['featured'] ?? 0);

    if (empty($name) || empty($ref) || $price <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Nom, référence et prix valide (en FCFA) sont obligatoires.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO products (name, ref, category_id, brand, price, stock, description, image, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$name, $ref, $categoryId, $brand, $price, $stock, $description, $image, $featured]);
        $newId = $pdo->lastInsertId();

        echo json_encode([
            'success' => true,
            'id' => $newId,
            'message' => 'Pièce ajoutée avec succès au catalogue !'
        ]);
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(['error' => 'Erreur lors de l\'ajout (la référence existe peut-être déjà): ' . $e->getMessage()]);
    }
    exit;
}

if ($method === 'PUT') {
    $id = (int)($input['id'] ?? 0);
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID produit manquant']);
        exit;
    }

    $name = trim($input['name'] ?? '');
    $ref = trim($input['ref'] ?? '');
    $categoryId = (int)($input['category_id'] ?? 1);
    $brand = trim($input['brand'] ?? '');
    $price = (int)($input['price'] ?? 0);
    $stock = (int)($input['stock'] ?? 0);
    $description = trim($input['description'] ?? '');
    $image = trim($input['image'] ?? '');
    $featured = (int)($input['featured'] ?? 0);

    $stmt = $pdo->prepare("UPDATE products SET name = ?, ref = ?, category_id = ?, brand = ?, price = ?, stock = ?, description = ?, image = ?, featured = ? WHERE id = ?");
    $stmt->execute([$name, $ref, $categoryId, $brand, $price, $stock, $description, $image, $featured, $id]);

    echo json_encode([
        'success' => true,
        'message' => 'Produit mis à jour avec succès !'
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

    $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode([
        'success' => true,
        'message' => 'Pièce supprimée du catalogue.'
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Méthode non autorisée']);
