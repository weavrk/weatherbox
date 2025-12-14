<?php
/**
 * Get person's filmography (all movies and TV shows they appeared in)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// TMDB API configuration
define('TMDB_ACCESS_TOKEN', 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2NGEzNjhkMDJlN2Y2NTI0MmU2M2YxMGFhMTMwZTkxZiIsIm5iZiI6MTY1Nzg0MDg4OS44NTY5OTk5LCJzdWIiOiI2MmQwYTRmOTYyZmNkMzAwNTU0NWFjZWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.TxRfKQMNiojwSNluc8kpo0SxCev8mwIC_RDQXmvjRAg');
define('TMDB_BASE_URL', 'https://api.themoviedb.org/3');

$personId = isset($_GET['person_id']) ? (int)$_GET['person_id'] : 0;

if (!$personId) {
    echo json_encode(['success' => false, 'error' => 'Person ID is required']);
    exit;
}

/**
 * Get person details with combined credits
 */
function getPersonDetails($personId) {
    $url = TMDB_BASE_URL . '/person/' . $personId . '?language=en-US&append_to_response=combined_credits';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . TMDB_ACCESS_TOKEN,
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        return null;
    }
    
    $data = json_decode($response, true);
    return $data;
}

/**
 * Extract filmography from person details
 */
function extractFilmography($personDetails) {
    if (!$personDetails) {
        error_log("No person details provided");
        return [];
    }
    
    $combinedCredits = [];
    
    // Check if combined_credits exists
    if (!isset($personDetails['combined_credits'])) {
        error_log("No combined_credits in person details");
        error_log("Available keys: " . implode(', ', array_keys($personDetails)));
        return [];
    }
    
    // Get cast credits (both movies and TV shows)
    if (isset($personDetails['combined_credits']['cast']) && is_array($personDetails['combined_credits']['cast'])) {
        error_log("Found " . count($personDetails['combined_credits']['cast']) . " cast credits");
        
        foreach ($personDetails['combined_credits']['cast'] as $credit) {
            // Skip if no title or name
            if (empty($credit['title']) && empty($credit['name'])) {
                continue;
            }
            
            // Determine if it's a movie or TV show
            $isMovie = isset($credit['title']) && !empty($credit['title']);
            $title = $isMovie ? $credit['title'] : ($credit['name'] ?? 'Unknown');
            
            $combinedCredits[] = [
                'id' => $credit['id'] ?? 0,
                'title' => $title,
                'poster_path' => $credit['poster_path'] ?? null,
                'release_date' => $credit['release_date'] ?? null,
                'first_air_date' => $credit['first_air_date'] ?? null,
                'isMovie' => $isMovie,
                'popularity' => $credit['popularity'] ?? 0
            ];
        }
    } else {
        error_log("No cast credits found in combined_credits");
        if (isset($personDetails['combined_credits'])) {
            error_log("combined_credits keys: " . implode(', ', array_keys($personDetails['combined_credits'])));
        }
    }
    
    error_log("Extracted " . count($combinedCredits) . " filmography items");
    
    // Sort by popularity (most popular first)
    usort($combinedCredits, function($a, $b) {
        return ($b['popularity'] ?? 0) <=> ($a['popularity'] ?? 0);
    });
    
    // Limit to top 50
    $combinedCredits = array_slice($combinedCredits, 0, 50);
    
    return $combinedCredits;
}

$personDetails = getPersonDetails($personId);

if (!$personDetails) {
    error_log("Failed to fetch person details for ID: $personId");
    echo json_encode(['success' => false, 'error' => 'Failed to fetch person details']);
    exit;
}

// Check HTTP response code
if (isset($personDetails['status_code'])) {
    error_log("TMDB API error: " . ($personDetails['status_message'] ?? 'Unknown error'));
    echo json_encode(['success' => false, 'error' => $personDetails['status_message'] ?? 'API error']);
    exit;
}

$filmography = extractFilmography($personDetails);

echo json_encode([
    'success' => true,
    'filmography' => $filmography,
    'debug' => [
        'person_id' => $personId,
        'filmography_count' => count($filmography),
        'has_combined_credits' => isset($personDetails['combined_credits']),
        'cast_count' => isset($personDetails['combined_credits']['cast']) ? count($personDetails['combined_credits']['cast']) : 0
    ]
]);

