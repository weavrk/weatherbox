<?php
/**
 * Add a streaming service to a user's profile
 * Downloads the logo from TMDB and adds service to user's JSON
 * POST /api/add_user_streaming_service.php
 * Body: { 
 *   "user_id": string, 
 *   "service_name": string, 
 *   "tmdb_provider_id": int,
 *   "logo_url": string (full TMDB image URL)
 * }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

if (!$data || !isset($data['user_id']) || !isset($data['service_name']) || !isset($data['logo_url'])) {
    http_response_code(400);
    echo json_encode(['error' => 'user_id, service_name, and logo_url are required']);
    exit;
}

$userId = $data['user_id'];
$serviceName = trim($data['service_name']);
$logoUrl = $data['logo_url'];
$tmdbProviderId = isset($data['tmdb_provider_id']) ? (int)$data['tmdb_provider_id'] : null;

// Sanitize user_id
if (!preg_match('/^[a-zA-Z0-9_-]+$/', $userId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid user_id format']);
    exit;
}

$userFilePath = '../data/users/' . $userId . '.json';

if (!file_exists($userFilePath)) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    exit;
}

try {
    // Read user data
    $userContent = file_get_contents($userFilePath);
    $userData = json_decode($userContent, true);
    
    if (!$userData) {
        throw new Exception('Failed to parse user data');
    }
    
    // Initialize streaming_services if it doesn't exist
    if (!isset($userData['streaming_services'])) {
        $userData['streaming_services'] = [];
    }
    
    // Check if service already exists for this user
    foreach ($userData['streaming_services'] as $service) {
        if (strtolower($service['name']) === strtolower($serviceName)) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'error' => 'Service already exists in your profile'
            ]);
            exit;
        }
    }
    
    // Download logo from TMDB
    $streamingDir = '../data/streaming/';
    if (!is_dir($streamingDir)) {
        mkdir($streamingDir, 0755, true);
    }
    
    // Create safe filename from service name
    $safeFilename = preg_replace('/[^a-z0-9_-]/', '', strtolower(str_replace(' ', '-', $serviceName)));
    $logoFilename = $safeFilename . '.webp';
    $logoPath = $streamingDir . $logoFilename;
    
    // Download the image
    $imageData = @file_get_contents($logoUrl);
    if ($imageData === false) {
        throw new Exception('Failed to download logo from TMDB');
    }
    
    // Save the logo
    $result = file_put_contents($logoPath, $imageData);
    if ($result === false) {
        throw new Exception('Failed to save logo file');
    }
    
    // Add service to user's streaming_services array
    $newService = [
        'name' => $serviceName,
        'logo' => $logoFilename
    ];
    
    if ($tmdbProviderId) {
        $newService['tmdb_provider_id'] = $tmdbProviderId;
    }
    
    $userData['streaming_services'][] = $newService;
    $userData['updated_at'] = date('c');
    
    // Save updated user data
    $result = file_put_contents($userFilePath, json_encode($userData, JSON_PRETTY_PRINT));
    
    if ($result === false) {
        throw new Exception('Failed to save user data');
    }
    
    echo json_encode([
        'success' => true,
        'service' => $newService,
        'message' => 'Streaming service added successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to add streaming service',
        'message' => $e->getMessage()
    ]);
}

