// Wait for the page to fully load before running any JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Store all students in this array
    // Each student will be an object with id and name properties
    let students = [];
    
    // Store all attendance records in this array
    // Each record will be an object with date, studentId, studentName, and status properties
    let attendanceRecords = [];
    
    // Get references to HTML elements we'll need to interact with
    const addStudentForm = document.getElementById('add-student-form');
    const studentIdInput = document.getElementById('student-id');
    const studentNameInput = document.getElementById('student-name');
    const attendanceList = document.getElementById('attendance-list');
    const attendanceDateInput = document.getElementById('attendance-date');
    const saveAttendanceBtn = document.getElementById('save-attendance');
    const filterDateInput = document.getElementById('filter-date');
    const filterStudentInput = document.getElementById('filter-student');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const recordsTable = document.getElementById('records-table');
    const recordsBody = document.getElementById('records-body');
    const noRecordsMessage = document.getElementById('no-records-message');
    
    // Set today's date as the default for the attendance date input
    const today = new Date();
    const formattedDate = today.toISOString().substr(0, 10); // Format as YYYY-MM-DD
    attendanceDateInput.value = formattedDate;
    
    // Load data from server
    loadStudents();
    loadAttendanceRecords();
    
    // Add event listener for form submission (adding a new student)
    addStudentForm.addEventListener('submit', function(e) {
        // Prevent the default form submission behavior
        e.preventDefault();
        
        // Get values from form inputs
        const studentId = studentIdInput.value.trim();
        const studentName = studentNameInput.value.trim();
        
        // Validate inputs
        if (!studentId || !studentName) {
            alert('Please enter both student ID and name.');
            return;
        }
        
        // Send request to add student
        addStudent(studentId, studentName);
    });
    
    // Function to add a new student via API
    function addStudent(studentId, studentName) {
        fetch('students_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: studentId,
                name: studentName
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message && data.message.includes('successfully')) {
                // Clear the form inputs
                studentIdInput.value = '';
                studentNameInput.value = '';
                
                // Reload students list
                loadStudents();
                
                alert('Student added successfully!');
            } else {
                alert(data.message || 'Error adding student.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while adding the student.');
        });
    }
    
    // Function to load students from API
    function loadStudents() {
        fetch('students_api.php')
        .then(response => response.json())
        .then(data => {
            students = data;
            displayStudentsForAttendance();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while loading students.');
        });
    }
    
    // Function to display all students in the attendance marking section
    function displayStudentsForAttendance() {
        // Clear current content of attendance list
        attendanceList.innerHTML = '';
        
        // If there are no students, show empty message
        if (students.length === 0) {
            attendanceList.innerHTML = '<p class="empty-message">No students added yet. Please add students first.</p>';
            return;
        }
        
        // Loop through each student and create a list item for them
        students.forEach(student => {
            // Create container for this student's attendance entry
            const studentItem = document.createElement('div');
            studentItem.className = 'student-item';
            
            // Add student info (ID and name)
            const studentInfo = document.createElement('div');
            studentInfo.className = 'student-info';
            studentInfo.innerHTML = `<strong>${student.id}</strong> - ${student.name}`;
            
            // Create radio buttons for attendance status (present/absent)
            const statusDiv = document.createElement('div');
            statusDiv.className = 'attendance-status';
            
            // Present radio button
            const presentLabel = document.createElement('label');
            const presentRadio = document.createElement('input');
            presentRadio.type = 'radio';
            presentRadio.name = `attendance-${student.id}`;
            presentRadio.value = 'present';
            presentRadio.checked = true; // Default to present
            presentLabel.appendChild(presentRadio);
            presentLabel.appendChild(document.createTextNode(' Present'));
            
            // Absent radio button
            const absentLabel = document.createElement('label');
            const absentRadio = document.createElement('input');
            absentRadio.type = 'radio';
            absentRadio.name = `attendance-${student.id}`;
            absentRadio.value = 'absent';
            absentLabel.appendChild(absentRadio);
            absentLabel.appendChild(document.createTextNode(' Absent'));
            
            // Add radio buttons to status div
            statusDiv.appendChild(presentLabel);
            statusDiv.appendChild(absentLabel);
            
            // Add all elements to the student item div
            studentItem.appendChild(studentInfo);
            studentItem.appendChild(statusDiv);
            
            // Add completed student item to the attendance list
            attendanceList.appendChild(studentItem);
        });
    }
    
    // Add event listener for saving attendance
    saveAttendanceBtn.addEventListener('click', function() {
        // If there are no students, show message and don't proceed
        if (students.length === 0) {
            alert('No students to mark attendance for. Please add students first.');
            return;
        }
        
        // Get selected date
        const selectedDate = attendanceDateInput.value;
        if (!selectedDate) {
            alert('Please select a date for attendance.');
            return;
        }
        
        // Store all new records for this date
        const newRecords = [];
        
        // Loop through each student and get their attendance status
        students.forEach(student => {
            // Find the selected radio button for this student
            const selectedStatus = document.querySelector(`input[name="attendance-${student.id}"]:checked`).value;
            
            // Create a new attendance record
            newRecords.push({
                studentId: student.id,
                status: selectedStatus
            });
        });
        
        // Check if we are overwriting attendance for this date
        const existingRecordsForDate = attendanceRecords.filter(record => record.date === selectedDate);
        if (existingRecordsForDate.length > 0) {
            if (!confirm(`Attendance for ${selectedDate} already exists. Do you want to overwrite it?`)) {
                return;
            }
        }
        
        // Save attendance via API
        saveAttendance(selectedDate, newRecords);
    });
    
    // Function to save attendance via API
    function saveAttendance(date, records) {
        fetch('attendance_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                date: date,
                records: records
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message && data.message.includes('successfully')) {
                // Reload attendance records
                loadAttendanceRecords();
                
                alert('Attendance saved successfully!');
            } else {
                alert(data.message || 'Error saving attendance.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while saving attendance.');
        });
    }
    
    // Function to load attendance records from API
    function loadAttendanceRecords() {
        fetch('attendance_api.php')
        .then(response => response.json())
        .then(data => {
            attendanceRecords = data;
            displayAttendanceRecords();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    
    // Add event listeners for applying and clearing filters
    applyFiltersBtn.addEventListener('click', function() {
        const filterDate = filterDateInput.value;
        const filterStudent = filterStudentInput.value.trim();
        
        // Build the query string for filters
        let queryParams = [];
        if (filterDate) {
            queryParams.push(`date=${encodeURIComponent(filterDate)}`);
        }
        if (filterStudent) {
            queryParams.push(`student=${encodeURIComponent(filterStudent)}`);
        }
        
        const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
        
        // Load filtered records
        fetch(`attendance_api.php${queryString}`)
        .then(response => response.json())
        .then(data => {
            attendanceRecords = data;
            displayAttendanceRecords();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while loading filtered records.');
        });
    });
    
    clearFiltersBtn.addEventListener('click', function() {
        // Clear filter inputs
        filterDateInput.value = '';
        filterStudentInput.value = '';
        
        // Reload all records
        loadAttendanceRecords();
    });
    
    // Function to display attendance records
    function displayAttendanceRecords() {
        // Clear current content of the table body
        recordsBody.innerHTML = '';
        
        // Show/hide no records message
        if (attendanceRecords.length === 0) {
            recordsTable.style.display = 'none';
            noRecordsMessage.style.display = 'block';
        } else {
            recordsTable.style.display = 'table';
            noRecordsMessage.style.display = 'none';
            
            // Add each record to the table
            attendanceRecords.forEach(record => {
                const row = document.createElement('tr');
                
                // Format date to be more readable
                const formattedDate = formatDate(record.date);
                
                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${record.studentId}</td>
                    <td>${record.studentName}</td>
                    <td class="${record.status}">${record.status.charAt(0).toUpperCase() + record.status.slice(1)}</td>
                `;
                
                recordsBody.appendChild(row);
            });
        }
    }
    
    // Helper function to format date from YYYY-MM-DD to more readable format
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
}); 