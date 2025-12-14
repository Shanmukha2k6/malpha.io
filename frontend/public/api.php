<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$input = json_decode(file_get_contents('php://input'), true);
$url = isset($input['url']) ? $input['url'] : '';

if (empty($url)) {
    echo json_encode(['error' => 'No URL provided']);
    exit;
}

// List of Cobalt instances to try
$instances = [
    'https://cobalt.kwiatekmiki.pl',
    'https://api.cobalt.kwiatekmiki.pl',
    'https://cobalt.wuk.sh',
    'https://co.wuk.sh',
    'https://dl.khub.ky',
    'https://api.server.cobalt.tools'
];

foreach ($instances as $base) {
    // Try both v10 (root) and v7 (/api/json) endpoints
    $endpoints = ["$base/", "$base/api/json"];
    
    foreach ($endpoints as $endpoint) {
        $ch = curl_init($endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['url' => $url]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: application/json',
            'Content-Type: application/json',
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 200 && $httpCode < 300 && $response) {
            $data = json_decode($response, true);
            if ($data && !isset($data['error']) && (isset($data['url']) || isset($data['picker']))) {
                echo $response;
                exit;
            }
        }
    }
}

echo json_encode(['error' => 'Failed to fetch media from all servers']);
?>
