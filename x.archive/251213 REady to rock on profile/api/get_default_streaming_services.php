<?php
/**
 * Get default streaming services available to all users
 * GET /api/get_default_streaming_services.php
 * Returns: Array of default streaming service objects
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

$servicesFile = '../data/default_streaming_services.json';

if (!file_exists($servicesFile)) {
    http_response_code(404);
    echo json_encode(['error' => 'Default services file not found']);
    exit;
}

$content = file_get_contents($servicesFile);
$services = json_decode($content, true);

if ($services === null) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to parse services file']);
    exit;
}

echo json_encode($services);

