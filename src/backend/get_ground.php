<?php
include 'connect.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid ground ID']);
    exit();
}

$id = intval($_GET['id']);

$stmt = $conn->prepare("SELECT * FROM futsal_grounds WHERE ground_id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if (!$result) {
    echo json_encode(['success' => false, 'message' => 'Query failed: ' . $conn->error]);
    exit();
}

$ground = $result->fetch_assoc();

if ($ground) {
    echo json_encode(['success' => true, 'ground' => $ground]);
} else {
    echo json_encode(['success' => false, 'message' => 'Ground not found']);
}

$stmt->close();
$conn->close();
?>