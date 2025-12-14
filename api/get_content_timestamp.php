<?php
/**
 * Get the last modification timestamp for explore content JSON files
 * GET /api/get_content_timestamp.php
 * Returns: { "timestamp": number } (Unix timestamp)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

$baseDir = dirname(__DIR__);
$moviesJson = $baseDir . '/data/streaming-movies-results.json';
$showsJson = $baseDir . '/data/streaming-shows-results.json';

$timestamps = [];

if (file_exists($moviesJson)) {
    $timestamps[] = filemtime($moviesJson);
}

if (file_exists($showsJson)) {
    $timestamps[] = filemtime($showsJson);
}

if (count($timestamps) > 0) {
    $latestTimestamp = max($timestamps);
    echo json_encode(['timestamp' => $latestTimestamp]);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Content files not found']);
}

