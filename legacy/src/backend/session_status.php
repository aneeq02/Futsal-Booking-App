<?php
session_start();

include 'connect.php';
if (!$conn) {
    die("Database connection failed.");
}
global $conn;

?>