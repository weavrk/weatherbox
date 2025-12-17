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

// Collect all user summaries, then de-duplicate by display name (case-insensitive)
$files = glob($usersDir . '*.json');
$usersByName = [];

foreach ($files as $file) {
    $content = file_get_contents($file);
    if ($content === false) {
        continue;
    }
    
    $userData = json_decode($content, true);
    if ($userData && isset($userData['user_id']) && isset($userData['name'])) {
        $userId = $userData['user_id'];
        $name = $userData['name'];
        $nameKey = strtolower(trim($name));
        
        // Support both old (avatar_poster_id) and new (avatar_filename) format
        $avatarFilename = isset($userData['avatar_filename']) 
            ? $userData['avatar_filename'] 
            : (isset($userData['avatar_poster_id']) ? "avatar-{$userData['avatar_poster_id']}.png" : "avatar-1.png");
        
        $userSummary = [
            'user_id' => $userData['user_id'],
            'name' => $userData['name'],
            'avatar_filename' => $avatarFilename
        ];
        
        // Add optional fields if present
        if (isset($userData['streaming_services'])) {
            $userSummary['streaming_services'] = $userData['streaming_services'];
        }
        if (isset($userData['birthday'])) {
            $userSummary['birthday'] = $userData['birthday'];
        }

        // Prefer the latest updated_at if present, otherwise last one wins
        $updatedAt = isset($userData['updated_at']) ? strtotime($userData['updated_at']) : filemtime($file);
        if (!isset($usersByName[$nameKey]) || $updatedAt >= $usersByName[$nameKey]['_updated_at']) {
            $usersByName[$nameKey] = [
                'summary' => $userSummary,
                '_updated_at' => $updatedAt
            ];
        }
    }
}

$users = array_map(function ($entry) {
    return $entry['summary'];
}, array_values($usersByName));

echo json_encode($users);

