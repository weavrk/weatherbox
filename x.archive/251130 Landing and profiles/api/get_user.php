<?php
/**
 * Get a specific user
 * GET /api/get_user.php?user_id=<id>
 * Returns: Full user object
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

if (!isset($_GET['user_id']) || empty($_GET['user_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'user_id is required']);
    exit;
}

$userId = $_GET['user_id'];

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

$content = file_get_contents($filePath);
if ($content === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to read user data']);
    exit;
}

$userData = json_decode($content, true);
if ($userData === null) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid user data']);
    exit;
}

// Support backward compatibility: convert avatar_poster_id to avatar_filename if needed
if (!isset($userData['avatar_filename']) && isset($userData['avatar_poster_id'])) {
    $userData['avatar_filename'] = 'avatar-' . $userData['avatar_poster_id'] . '.png';
}

echo json_encode($userData);

