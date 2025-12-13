<?php
/**
 * Save/update user data
 * POST /api/save_user.php
 * Body: { "user_id": string, "name": string, "avatar_filename": string, "items": array }
 * Returns: { "success": true }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['user_id']) || !isset($data['items'])) {
    http_response_code(400);
    echo json_encode(['error' => 'user_id and items are required']);
    exit;
}

$userId = $data['user_id'];

// Sanitize user_id
if (!preg_match('/^[a-zA-Z0-9_-]+$/', $userId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid user_id format']);
    exit;
}

$filePath = '../data/users/' . $userId . '.json';

if (!file_exists($filePath)) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    exit;
}

// Create updated user object
$user = [
    'user_id' => $userId,
    'name' => $data['name'],
    'avatar_filename' => $data['avatar_filename'],
    'updated_at' => date('c'),
    'items' => $data['items'],
    'streaming_services' => isset($data['streaming_services']) ? $data['streaming_services'] : [],
    'birthday' => isset($data['birthday']) && !empty($data['birthday']) ? $data['birthday'] : ''
];

// Save to file
$result = file_put_contents($filePath, json_encode($user, JSON_PRETTY_PRINT));

if ($result === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save user data']);
    exit;
}

echo json_encode(['success' => true]);

