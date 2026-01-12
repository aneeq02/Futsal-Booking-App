<?php
include 'connect.php';

$name     = $_POST['name'] ?? '';
$email    = $_POST['email'] ?? '';
$phone    = $_POST['number'] ?? '';
$password = $_POST['password'] ?? '';

if (empty($name) || empty($email) || empty($phone) || empty($password)) {
    die("Please fill in all required fields.");
}

$checkStmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
$checkStmt->bind_param("s", $email);
$checkStmt->execute();
$checkStmt->store_result();

if ($checkStmt->num_rows > 0) {
    echo "An account with this email already exists. Please log in or use a different email.";
    $checkStmt->close();
    $conn->close();
    exit();
}
$checkStmt->close();

$password_hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $name, $email, $phone, $password_hash);

if ($stmt->execute()) {
    header("Location: /Futsal Booking App/login.html");
    exit();
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>
