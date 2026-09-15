<?php
session_start();
include 'connect.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['ground_id'])) {
    echo json_encode(['success' => false, 'message' => 'Missing ground ID']);
    exit();
}

$ground_id = intval($data['ground_id']);

try {
    $stmt = $conn->prepare("DELETE FROM futsal_grounds WHERE ground_id = ?");
    $stmt->bind_param("i", $ground_id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Ground deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Ground not found or already deleted']);
    }

    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
