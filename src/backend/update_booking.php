<?php
session_start();
include 'connect.php'; 

$booking_id = intval($_POST['booking_id']);
$payment_status = $conn->real_escape_string($_POST['payment_status']);
$ground_name = $conn->real_escape_string($_POST['ground']); 
$booking_date = $conn->real_escape_string($_POST['date']);
$start_time = $conn->real_escape_string($_POST['time']);
$status = $conn->real_escape_string($_POST['status']);
$amount = floatval($_POST['amount']);

$ground_query = $conn->prepare("SELECT ground_id FROM futsal_grounds WHERE name = ?");
$ground_query->bind_param("s", $ground_name);
$ground_query->execute();
$ground_result = $ground_query->get_result();

if ($ground_result->num_rows === 0) {
    http_response_code(400);
    echo 'Invalid ground selected.';
    exit();
}

$ground_row = $ground_result->fetch_assoc();
$ground_id = $ground_row['ground_id'];

$update_query = $conn->prepare("
    UPDATE bookings 
    SET payment_status = ?, 
        ground_id = ?, 
        booking_date = ?, 
        start_time = ?, 
        status = ?
    WHERE booking_id = ?
");
$update_query->bind_param("sisssi", $payment_status, $ground_id, $booking_date, $start_time, $status, $booking_id);

if ($update_query->execute()) {
    http_response_code(200);
    echo 'Booking updated successfully';
} else {
    http_response_code(500);
    echo 'Error updating booking: ' . $conn->error;
}


$conn->close();
?>
