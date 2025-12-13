<?php
/**
 * List all users
 * GET /api/list_users.php
 * Returns: Array of user summaries
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

$usersDir = '../data/users/';

// Ensure directory exists
if (!is_dir($usersDir)) {
    mkdir($usersDir, 0755, true);
    echo json_encode([]);
    exit;
}

$users = [];
$files = glob($usersDir . '*.json');

foreach ($files as $file) {
    $content = file_get_contents($file);
    if ($content === false) {
        continue;
    }
    
    $userData = json_decode($content, true);
    if ($userData && isset($userData['user_id'])) {
        // Support both old (avatar_poster_id) and new (avatar_filename) format
        $avatarFilename = isset($userData['avatar_filename']) 
            ? $userData['avatar_filename'] 
            : (isset($userData['avatar_poster_id']) ? "avatar-{$userData['avatar_poster_id']}.png" : "avatar-1.png");
        
        $users[] = [
            'user_id' => $userData['user_id'],
            'name' => $userData['name'],
            'avatar_filename' => $avatarFilename
        ];
    }
}

echo json_encode($users);

