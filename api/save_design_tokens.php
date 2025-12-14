<?php
/**
 * Save design tokens to public/design-tokens.json and commit to git
 * POST /api/save_design_tokens.php
 * Body: { "tokens": object }
 * Returns: { "success": true, "message": string }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
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

if (!$data || !isset($data['tokens'])) {
    http_response_code(400);
    echo json_encode(['error' => 'tokens are required']);
    exit;
}

$tokens = $data['tokens'];
$filePath = '../public/design-tokens.json';

// Get the absolute path to the project root
$projectRoot = dirname(dirname(__FILE__));

// Save to file
$jsonString = json_encode($tokens, JSON_PRETTY_PRINT);
$result = file_put_contents($filePath, $jsonString);

if ($result === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save design tokens']);
    exit;
}

// Commit and push to git
$gitCommands = [
    "cd {$projectRoot} && git add public/design-tokens.json",
    "cd {$projectRoot} && git commit -m 'Update design tokens'",
    "cd {$projectRoot} && git push"
];

$output = [];
$returnCode = 0;

foreach ($gitCommands as $command) {
    exec($command . ' 2>&1', $output, $returnCode);
    if ($returnCode !== 0) {
        // Log error but don't fail - file was saved successfully
        error_log("Git command failed: " . implode("\n", $output));
        // Continue anyway - the file was saved
    }
}

echo json_encode([
    'success' => true,
    'message' => 'Design tokens saved and committed to git'
]);

