$(document).ready(function () {
    // Initialize Datepicker
    $('#date').datepicker({
        format: 'mm/dd/yyyy',
        startDate: new Date(),
        autoclose: true
    });

    // Function to display error messages
    function showError(message) {
        $('#errorMessage').text(message).show();
        setTimeout(() => { $('#errorMessage').hide(); }, 3000);
    }

    // Function to validate email format
    function validateEmail(email) {
        let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Function to validate phone number
    function validatePhone(phone) {
        let phoneRegex = /^[0-9]{10}$/; // 10-digit phone number
        return phoneRegex.test(phone);
    }

    // User Registration/Login Form Submission
    $('#userForm').on('submit', function (e) {
        e.preventDefault();

        let name = $('#name').val().trim();
        let email = $('#email').val().trim();
        let phone = $('#phone').val().trim();
        let password = $('#password').val().trim();

        // Validate input fields
        if (!name || !email || !phone || !password) {
            showError("All fields are required!");
            return;
        }
        if (!validateEmail(email)) {
            showError("Invalid email format!");
            return;
        }
        if (!validatePhone(phone)) {
            showError("Phone number must be 10 digits!");
            return;
        }
        if (password.length < 6) {
            showError("Password must be at least 6 characters!");
            return;
        }

        let userData = { name, email, phone, password };

        $.ajax({
            url: 'http://127.0.0.1:5000/register', // Change if needed for login endpoint
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(userData),
            success: function (response) {
                alert(response.message);
                sessionStorage.setItem('userEmail', email); // Store session info
                $('#userForm')[0].reset();
            },
            error: function (error) {
                let errorMessage = error.responseJSON ? error.responseJSON.error : "Registration failed!";
                showError(errorMessage);
            }
        });
    });

    // Appointment Booking Form Submission
    $('#appointmentForm').on('submit', function (e) {
        e.preventDefault();

        let doctor = $('#doctor').val();
        let date = $('#date').val().trim();
        let time = $('#time').val().trim();
        let userEmail = sessionStorage.getItem('userEmail'); // Get logged-in user email

        if (!userEmail) {
            showError("Please login before booking an appointment!");
            return;
        }
        if (!doctor || !date || !time) {
            showError("All fields are required for booking!");
            return;
        }

        let appointmentData = { doctor, date, time, email: userEmail };

        $.ajax({
            url: 'http://127.0.0.1:5000/book-appointment',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(appointmentData),
            success: function (response) {
                alert(response.message);
                $('#appointmentForm')[0].reset();
            },
            error: function (error) {
                let errorMessage = error.responseJSON ? error.responseJSON.error : "Booking failed!";
                showError(errorMessage);
            }
        });
    });

    // Logout Function
    $('#logoutBtn').click(function () {
        sessionStorage.removeItem('userEmail'); // Clear session storage
        alert("Logged out successfully!");
        window.location.href = "login.html"; // Redirect to login page
    });
});
