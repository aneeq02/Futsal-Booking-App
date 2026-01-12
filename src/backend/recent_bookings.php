<?php
session_start();
include 'connect.php'; 

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

$userId = $_SESSION['user_id'];

$sql = "
    SELECT g.name AS ground_name, b.booking_date, b.start_time, b.status
    FROM bookings b
    JOIN futsal_grounds g ON b.ground_id = g.ground_id
    WHERE g.owner_id = ?
    ORDER BY b.booking_date DESC, b.start_time DESC
    LIMIT 5
";

$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $userId);
$stmt->execute();
$result = $stmt->get_result();

$bookings = [];
while ($row = $result->fetch_assoc()) {
    $bookings[] = [
        'ground' => $row['ground_name'],
        'date' => date('M d, Y', strtotime($row['booking_date'])),
        'time' => date('H:i', strtotime($row['start_time'])),
        'status' => $row['status']
    ];
}

echo json_encode(['success' => true, 'bookings' => $bookings]);
