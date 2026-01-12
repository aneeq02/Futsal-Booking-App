<?php
include 'session_status.php'; 

if (!$conn) {
    error_log("Database connection failed in fetch_grounds.php");
    http_response_code(500); 
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database connection failed.']);
    exit();
}

$sql = "SELECT ground_id, name, location, address, price_per_hour, ground_picture  FROM futsal_grounds ORDER BY name ASC"; 

$result = $conn->query($sql);

$grounds = []; 

if ($result) {

    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $grounds[] = $row; 
        }
    }
    $result->free(); 
} else {
    error_log("SQL Error in fetch_grounds.php: " . $conn->error);
    http_response_code(500); // Internal Server Error
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Failed to retrieve grounds data.']);
    $conn->close(); // Close connection on error
    exit();
}

$conn->close();

header('Content-Type: application/json');

echo json_encode($grounds);

exit(); 
?>
