<?php
session_start();
include 'connect.php'; 

$response = ['success' => false, 'message' => ''];

if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'User not logged in.';
    echo json_encode($response);
    exit;
}

$owner_id = $_SESSION['user_id'];
$name = $_POST['name'];
$location = $_POST['location'];
$price_per_hour = $_POST['price_per_hour'];
$address = $_POST['address'];

if (isset($_FILES['ground_picture'])) {
    $target_dir = "uploads/";
    $file_name = basename($_FILES["ground_picture"]["name"]);
    $target_file = $target_dir . time() . "_" . $file_name;
    $image_url = "src/backend/" . $target_file;
    if (move_uploaded_file($_FILES["ground_picture"]["tmp_name"], $target_file)) {
        $ground_picture = $image_url;

        $stmt = $conn->prepare("INSERT INTO futsal_grounds (owner_id, name, location, address, price_per_hour, ground_picture) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isssis", $owner_id, $name, $location, $address, $price_per_hour, $ground_picture);

        if ($stmt->execute()) {
            $response['success'] = true;
            $response['message'] = 'Ground added successfully';
        } else {
            $response['message'] = 'Database insert failed';
        }

        $stmt->close();
    } else {
        $response['message'] = 'File upload failed';
    }
} else {
    $response['message'] = 'No file uploaded';
}

$conn->close();
echo json_encode($response);