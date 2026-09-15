<?php
include_once 'connect.php';

$sql = "SELECT ground_id, name, ground_picture FROM futsal_grounds LIMIT 4";
$result = $conn->query($sql);

$grounds = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $grounds[] = $row;
    }
}

header('Content-Type: application/json');
echo json_encode($grounds);

$conn->close();
?>
