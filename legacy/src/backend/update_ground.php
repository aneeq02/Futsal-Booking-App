<?php
session_start();
include 'connect.php';
header('Content-Type: application/json');

if (!isset($_POST['ground_id'], $_POST['name'], $_POST['location'], $_POST['price_per_hour'], $_POST['address'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit();
}

error_log("Received ground_id: " . $_POST['ground_id']);
$ground_id = intval($_POST['ground_id']);
$name = $_POST['name'];
$location = $_POST['location'];
$price_per_hour = floatval($_POST['price_per_hour']);
$address = $_POST['address'];

error_log("After intval: " . $ground_id);

$updatePicture = false;
$picturePath = '';

if (isset($_FILES['ground_picture']) && $_FILES['ground_picture']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = '../../uploads/'; 
    $fileName = basename($_FILES['ground_picture']['name']);
    $targetFilePath = $uploadDir . $fileName;

    
    if (move_uploaded_file($_FILES['ground_picture']['tmp_name'], $targetFilePath)) {
        $updatePicture = true;
        $picturePath = $targetFilePath;
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to upload picture']);
        exit();
    }
}

try {
    if ($updatePicture) {
        $sql = "UPDATE futsal_grounds SET name = ?, location = ?, price_per_hour = ?, address = ?, ground_picture = ? WHERE ground_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssdssi", $name, $location, $price_per_hour, $address, $picturePath, $ground_id);
    } else {
        $sql = "UPDATE futsal_grounds SET name = ?, location = ?, price_per_hour = ?, address = ? WHERE ground_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssdsi", $name, $location, $price_per_hour, $address, $ground_id);
    }

    $stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['success' => true, 'message' => 'Ground updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'No changes made or ground not found']);
}


    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>