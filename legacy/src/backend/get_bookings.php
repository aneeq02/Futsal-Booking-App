<?php
session_start();
include 'connect.php'; 

$ownerId = $_SESSION['user_id'];

$sql = "
    SELECT 
        b.booking_id,
        b.booking_date,
        b.start_time,
        g.price_per_hour,
        b.status,
        b.payment_status,
        g.name AS ground_name,
        TIME_FORMAT(SEC_TO_TIME(TIMESTAMPDIFF(SECOND, b.start_time, ADDTIME(b.start_time, '01:00:00'))), '%H:%i') AS end_time,
        g.price_per_hour AS amount
    FROM bookings b
    JOIN futsal_grounds g ON b.ground_id = g.ground_id
    WHERE g.owner_id = ?
    ORDER BY b.booking_date DESC, b.start_time DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $ownerId);
$stmt->execute();
$result = $stmt->get_result();

$bookings = [];
while ($row = $result->fetch_assoc()) {
    $bookings[] = $row;
}

echo json_encode($bookings);
?>
