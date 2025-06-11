<?php
// Connect to MySQL without selecting a database
$servername = "localhost";
$username = "root";
$password = "";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database
$sql = "CREATE DATABASE IF NOT EXISTS attendance_system";
if ($conn->query($sql) === TRUE) {
    echo "Database created successfully<br>";
} else {
    echo "Error creating database: " . $conn->error . "<br>";
}

// Select the database
$conn->select_db("attendance_system");

// Create students table
$sql = "CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL
)";

if ($conn->query($sql) === TRUE) {
    echo "Students table created successfully<br>";
} else {
    echo "Error creating students table: " . $conn->error . "<br>";
}

// Create attendance records table
$sql = "CREATE TABLE IF NOT EXISTS attendance_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    status ENUM('present', 'absent') NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
)";

if ($conn->query($sql) === TRUE) {
    echo "Attendance records table created successfully<br>";
} else {
    echo "Error creating attendance records table: " . $conn->error . "<br>";
}

$conn->close();

echo "Database setup completed. You can now use the attendance management system.";
?> 