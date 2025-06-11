<?php
// Include database configuration
require_once 'config.php';

// Set response content type
header('Content-Type: application/json');

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Get attendance records with optional filters
        $filterDate = isset($_GET['date']) ? $conn->real_escape_string($_GET['date']) : null;
        $filterStudent = isset($_GET['student']) ? $conn->real_escape_string($_GET['student']) : null;
        
        $sql = "SELECT a.record_id, a.date, a.student_id, s.name as student_name, a.status 
                FROM attendance_records a
                JOIN students s ON a.student_id = s.id";
        
        // Apply filters if provided
        if ($filterDate || $filterStudent) {
            $sql .= " WHERE";
            if ($filterDate) {
                $sql .= " a.date = '$filterDate'";
            }
            if ($filterDate && $filterStudent) {
                $sql .= " AND";
            }
            if ($filterStudent) {
                $sql .= " (a.student_id LIKE '%$filterStudent%' OR s.name LIKE '%$filterStudent%')";
            }
        }
        
        $sql .= " ORDER BY a.date DESC, s.name ASC";
        
        $result = $conn->query($sql);
        
        if ($result) {
            $records = array();
            while($row = $result->fetch_assoc()) {
                $records[] = array(
                    'id' => $row['record_id'],
                    'date' => $row['date'],
                    'studentId' => $row['student_id'],
                    'studentName' => $row['student_name'],
                    'status' => $row['status']
                );
            }
            echo json_encode($records);
        } else {
            http_response_code(500);
            echo json_encode(array("message" => "Error: " . $conn->error));
        }
        break;
        
    case 'POST':
        // Add or update attendance records
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->date) && !empty($data->records) && is_array($data->records)) {
            $date = $conn->real_escape_string($data->date);
            
            // Begin transaction
            $conn->begin_transaction();
            
            try {
                // Delete existing records for this date (if any)
                $deleteSql = "DELETE FROM attendance_records WHERE date = '$date'";
                $conn->query($deleteSql);
                
                // Add new records
                $insertSql = "INSERT INTO attendance_records (date, student_id, status) VALUES ";
                $values = array();
                
                foreach ($data->records as $record) {
                    if (!empty($record->studentId) && !empty($record->status)) {
                        $studentId = $conn->real_escape_string($record->studentId);
                        $status = $conn->real_escape_string($record->status);
                        $values[] = "('$date', '$studentId', '$status')";
                    }
                }
                
                if (!empty($values)) {
                    $insertSql .= implode(", ", $values);
                    $conn->query($insertSql);
                }
                
                // Commit transaction
                $conn->commit();
                
                echo json_encode(array("message" => "Attendance records saved successfully."));
            } catch (Exception $e) {
                // Roll back transaction if something failed
                $conn->rollback();
                http_response_code(500);
                echo json_encode(array("message" => "Error: " . $e->getMessage()));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Please provide date and attendance records."));
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed."));
        break;
}

$conn->close();
?> 