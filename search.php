<?php
// Connect to the MySQL Database
$servername = "localhost";
$username = "root";  // change it to your DB username
$password = "";      // change it to your DB password
$dbname = "RtoCodes"; // change it to your DB name

$conn = new mysqli($servername, $username, $password, $dbname);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$data = json_decode(file_get_contents('php://input'), true);
$rto_codes = $data['rto_code'];

// SQL query to fetch RTO details along with geospatial data
$sql = "SELECT rto_details.rto_code, 
               states.country, 
               states.name AS state, 
               states.population AS state_population, 
               districts.name AS district, 
               districts.pin_code AS district_pin, 
               districts.population AS district_population, 
               states.latitude AS state_latitude, 
               states.longitude AS state_longitude, 
               districts.latitude AS district_latitude, 
               districts.longitude AS district_longitude,
               districts.state_map_url, 
               districts.district_map_url
        FROM rto_details
        JOIN states ON rto_details.state_id = states.id
        JOIN districts ON rto_details.district_id = districts.id
        WHERE rto_details.rto_code = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $rto_code);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();

    // Check and set default values if any field is null
    $response = [
        'rto_code' => $row['rto_code'] ?? 'N/A',
        'country' => $row['country'] ?? 'Unknown',
        'state' => $row['state'] ?? 'Unknown',
        'state_population' => $row['state_population'] ?? 0,
        'district' => $row['district'] ?? 'Unknown',
        'district_pin' => $row['district_pin'] ?? 'N/A',
        'district_population' => $row['district_population'] ?? 0,
        'state_latitude' => $row['state_latitude'] ?? 0.0,
        'state_longitude' => $row['state_longitude'] ?? 0.0,
        'district_latitude' => $row['district_latitude'] ?? 0.0,
        'district_longitude' => $row['district_longitude'] ?? 0.0,
        'state_map_url' => $row['state_map_url'] ?? '',
        'district_map_url' => $row['district_map_url'] ?? ''
    ];
    echo json_encode($response);
} else {
    echo json_encode(null); // If no result is found
}

$conn->close();
?>
