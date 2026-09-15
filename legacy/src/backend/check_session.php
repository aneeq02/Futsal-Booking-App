<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['name'])) {
    echo json_encode([
        'logged_in' => true,
        'username' => $_SESSION['name'],
        'role' => $_SESSION['role'] ?? 'user'
    ]);
}else {
    echo json_encode([
        'logged_in' => false
    ]);
}
?>