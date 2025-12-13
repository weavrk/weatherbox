<?php
/**
 * List all available streaming service files
 * GET /api/list_streaming_services.php
 * Returns: Array of streaming service filenames
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

$streamingDir = '../data/streaming/';

// Ensure directory exists
if (!is_dir($streamingDir)) {
    echo json_encode([]);
    exit;
}

$services = [];
$files = glob($streamingDir . '*.svg');

foreach ($files as $file) {
    $filename = basename($file);
    // Exclude default.svg since it's a fallback icon
    if ($filename !== 'default.svg') {
        $services[] = $filename;
    }
}

// Sort alphabetically
sort($services);

echo json_encode($services);

