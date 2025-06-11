<?php
// Include database configuration
require_once 'config.php';

// Set response content type
header('Content-Type: application/json');

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Get all students
        $sql = "SELECT * FROM students ORDER BY name";
        $result = $conn->query($sql);
        
        if ($result) {
            $students = array();
            while($row = $result->fetch_assoc()) {
                $students[] = array(
                    'id' => $row['id'],
                    'name' => $row['name']
                );
            }
            echo json_encode($students);
        } else {
            http_response_code(500);
            echo json_encode(array("message" => "Error: " . $conn->error));
        }
        break;
        
    case 'POST':
        // Add a new student
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->id) && !empty($data->name)) {
            // Escape user inputs for security
            $studentId = $conn->real_escape_string($data->id);
            $studentName = $conn->real_escape_string($data->name);
            
            // Check if student ID already exists
            $checkSql = "SELECT id FROM students WHERE id = '$studentId'";
            $checkResult = $conn->query($checkSql);
            
            if ($checkResult && $checkResult->num_rows > 0) {
                http_response_code(400);
                echo json_encode(array("message" => "A student with this ID already exists."));
                break;
            }
            
            // Insert new student
            $sql = "INSERT INTO students (id, name) VALUES ('$studentId', '$studentName')";
            
            if ($conn->query($sql) === TRUE) {
                http_response_code(201);
                echo json_encode(array("message" => "Student added successfully."));
            } else {
                http_response_code(500);
                echo json_encode(array("message" => "Error: " . $conn->error));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Please provide both student ID and name."));
        }
        break;
        
    case 'DELETE':
        // Delete a student
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->id)) {
            $studentId = $conn->real_escape_string($data->id);
            
            $sql = "DELETE FROM students WHERE id = '$studentId'";
            
            if ($conn->query($sql) === TRUE) {
                echo json_encode(array("message" => "Student deleted successfully."));
            } else {
                http_response_code(500);
                echo json_encode(array("message" => "Error: " . $conn->error));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Please provide a student ID."));
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed."));
        break;
}

$conn->close();
?> 