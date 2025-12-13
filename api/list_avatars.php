<?php
/**
 * List all available avatar files
 * GET /api/list_avatars.php
 * Returns: Array of avatar filenames
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

$avatarsDir = '../data/avatars/';

// Ensure directory exists
if (!is_dir($avatarsDir)) {
    echo json_encode([]);
    exit;
}

$avatars = [];
$files = glob($avatarsDir . '*.svg');

foreach ($files as $file) {
    $filename = basename($file);
    // Only include files that match the pattern avatar-XX.svg
    if (preg_match('/^avatar-\d+\.svg$/', $filename)) {
        $avatars[] = $filename;
    }
}

// Sort naturally by number
natsort($avatars);

// Re-index array to ensure proper JSON array encoding
$avatars = array_values($avatars);

echo json_encode($avatars);

