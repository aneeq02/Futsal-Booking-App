<?php
session_start();
include 'connect.php'; 

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

$userId = $_SESSION['user_id'];
$today = date('Y-m-d');

$sql = "SELECT ground_id, name FROM futsal_grounds WHERE owner_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $userId);
$stmt->execute();
$result = $stmt->get_result();

$grounds = [];
while ($ground = $result->fetch_assoc()) {
   
    $bookingsSql = "
        SELECT COUNT(*) AS booked_slots 
        FROM bookings 
        WHERE ground_id = ? AND booking_date = ? AND status != 'Cancelled'
    ";
    $bookingsStmt = $conn->prepare($bookingsSql);
    $bookingsStmt->bind_param('is', $ground['ground_id'], $today);
    $bookingsStmt->execute();
    $bookingsResult = $bookingsStmt->get_result();
    $bookedRow = $bookingsResult->fetch_assoc();

    $bookedSlots = $bookedRow['booked_slots'];
    $totalSlots = 12;
    $availableSlots = $totalSlots - $bookedSlots;

    $status = 'available';
    if ($availableSlots <= 0) {
        $status = 'fully_booked';
    }

    

    $grounds[] = [
        'name' => $ground['name'],
        'available_slots' => $availableSlots,
        'status' => $status,
        'percentage' => ($status === 'maintenance') ? 0 : (($bookedSlots / $totalSlots) * 100)
    ];
}

echo json_encode(['success' => true, 'grounds' => $grounds]);
