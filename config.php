<?php
// Database connection configuration
$servername = "localhost"; // Default XAMPP MySQL server
$username = "root";        // Default XAMPP username
$password = "";            // Default XAMPP password (blank)
$dbname = "attendance_system";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?> 