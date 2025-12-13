<?php
/**
 * Delete a user
 * POST /api/delete_user.php
 * Body: { "user_id": string }
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

if (!$data || !isset($data['user_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'user_id is required']);
    exit;
}

$userId = $data['user_id'];

// Sanitize user_id to prevent path traversal
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

$result = unlink($filePath);

if ($result === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete user']);
    exit;
}

echo json_encode(['success' => true]);

