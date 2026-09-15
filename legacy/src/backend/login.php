<?php
include 'session_status.php';

$email = $_POST['email'];
$password = $_POST['password'];

$stmt = $conn->prepare("SELECT user_id, password_hash, role, name FROM users WHERE email = ?");
$stmt->bind_param("s", $email); 
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if ($user && password_verify($password, $user['password_hash'])) {
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['name'] = $user['name'];
     $response = [
        'logged_in' => true,
        'username' => $user['name'],
        'role' => $user['role']
    ];
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
} else {
    $response = [
        'logged_in' => false,
        'error' => 'Invalid login'
    ];
    header('Content-Type: application/json');
    echo json_encode($response);
}
$stmt->close();
?>
