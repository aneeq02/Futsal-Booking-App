<?php
session_start(); 
include_once 'connect.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
 
    if (!isset($_SESSION['user_id'])) {
        die("You must be logged in to make a booking.");
    }

    $user_id = $_SESSION['user_id'];

    $fullName = htmlspecialchars($_POST['fullName']);
    $email = htmlspecialchars($_POST['email']);
    $phone = htmlspecialchars($_POST['phone']);
    $teamName = htmlspecialchars($_POST['teamName']);
    $date = htmlspecialchars($_POST['date']);
    $time = htmlspecialchars($_POST['timetable']);
    $paymentMethod = htmlspecialchars($_POST['paymentMethod']);
    $ground_id = (int) $_POST['groundId'];

    $status = 'confirmed';
    $payment_status = ($paymentMethod === 'card') ? 'confirmed' : 'pending';
    $created_at = date('Y-m-d H:i:s');

    $checkStmt = $conn->prepare("SELECT COUNT(*) as count FROM bookings WHERE ground_id = ? AND booking_date = ? AND start_time = ?");
    $checkStmt->bind_param("iss", $ground_id, $date, $time);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    $row = $checkResult->fetch_assoc();

    if ($row['count'] > 0) {
        echo "<script>
                alert('Sorry, this time slot is already booked. Please choose another slot.');
                window.history.back();
              </script>";
        exit();
    }
    $checkStmt->close();


    $stmt = $conn->prepare("INSERT INTO bookings (user_id, ground_id, booking_date, start_time, status, payment_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("iisssss", $user_id, $ground_id, $date, $time, $status, $payment_status, $created_at);

    if ($stmt->execute()) {
        echo "<script>
                alert('Booking has been successfully completed!');
                window.location.href = '/Futsal Booking App/index.html';
              </script>";
        exit();
    } else {
        echo "Error: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
} else {
    echo "Invalid request.";
}
?>
