<?php
/**
 * Search TMDB for streaming providers
 * GET /api/search_tmdb_providers.php?query=<search_term>
 * Returns: Array of matching providers from TMDB
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display, we'll catch them
ini_set('log_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// TMDB API configuration
define('TMDB_API_KEY', '64a368d02e7f65242e63f10aa130e91f');
define('TMDB_ACCESS_TOKEN', 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2NGEzNjhkMDJlN2Y2NTI0MmU2M2YxMGFhMTMwZTkxZiIsIm5iZiI6MTY1Nzg0MDg4OS44NTY5OTk5LCJzdWIiOiI2MmQwYTRmOTYyZmNkMzAwNTU0NWFjZWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.TxRfKQMNiojwSNluc8kpo0SxCev8mwIC_RDQXmvjRAg');
define('TMDB_BASE_URL', 'https://api.themoviedb.org/3');

if (!isset($_GET['query']) || empty($_GET['query'])) {
    http_response_code(400);
    echo json_encode(['error' => 'query parameter is required']);
    exit;
}

$query = trim($_GET['query']);

try {
    // Get list of all watch providers from TMDB
    $url = TMDB_BASE_URL . '/watch/providers/movie?language=en-US&watch_region=US';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . TMDB_ACCESS_TOKEN,
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($curlError) {
        echo json_encode([
            'success' => false,
            'error' => 'TMDB API request failed',
            'message' => $curlError,
            'debug' => ['http_code' => $httpCode]
        ]);
        exit;
    }
    
    if ($httpCode !== 200) {
        echo json_encode([
            'success' => false,
            'error' => 'TMDB API error',
            'message' => "HTTP code: $httpCode",
            'debug' => ['response' => substr($response, 0, 500)]
        ]);
        exit;
    }
    
    $data = json_decode($response, true);
    
    if (!$data || !isset($data['results'])) {
        echo json_encode([
            'success' => false,
            'error' => 'Invalid TMDB response',
            'message' => 'No results found in response',
            'debug' => ['response_keys' => array_keys($data ?? []), 'has_data' => !empty($data)]
        ]);
        exit;
    }
    
    // Filter providers based on search query
    $queryLower = strtolower($query);
    $matchedProviders = [];
    
    foreach ($data['results'] as $provider) {
        $providerName = strtolower($provider['provider_name']);
        
        // Check if query matches provider name
        if (strpos($providerName, $queryLower) !== false || strpos($queryLower, $providerName) !== false) {
            $matchedProviders[] = [
                'provider_id' => $provider['provider_id'],
                'provider_name' => $provider['provider_name'],
                'logo_path' => $provider['logo_path'],
                'display_priority' => $provider['display_priority'] ?? 999
            ];
        }
    }
    
    // Sort by display priority (lower is better)
    usort($matchedProviders, function($a, $b) {
        return $a['display_priority'] - $b['display_priority'];
    });
    
    // Limit to top 10 results
    $matchedProviders = array_slice($matchedProviders, 0, 10);
    
    echo json_encode([
        'success' => true,
        'providers' => $matchedProviders,
        'tmdb_image_base_url' => 'https://image.tmdb.org/t/p/original'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to search TMDB providers',
        'message' => $e->getMessage()
    ]);
}

