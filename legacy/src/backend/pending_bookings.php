<?php
session_start();
include 'connect.php'; 

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

$userId = $_SESSION['user_id'];

$sql = "
    SELECT COUNT(*) AS pending_count
    FROM bookings b
    JOIN futsal_grounds g ON b.ground_id = g.ground_id
    WHERE g.owner_id = ?
      AND b.payment_status = 'pending'
";

$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $userId);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

echo json_encode(['success' => true, 'pending' => $row['pending_count']]);
