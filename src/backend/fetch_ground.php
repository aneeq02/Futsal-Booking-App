<?php
session_start();
include 'connect.php';

$owner_id = $_SESSION['user_id']; // session has user_id, table has owner_id

$sql = "SELECT * FROM futsal_grounds WHERE owner_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $owner_id);
$stmt->execute();
$result = $stmt->get_result();

$grounds = [];
while ($row = $result->fetch_assoc()) {
    $grounds[] = $row;
}

header('Content-Type: application/json');
echo json_encode($grounds);