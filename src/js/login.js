document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            // Prevent the default form submission (which causes a page reload)
            event.preventDefault();

            // Get the form data
            const formData = new FormData(loginForm);
            const actionUrl = loginForm.action; // Get URL from form's action attribute
            const method = loginForm.method;   // Get method from form's method attribute

            // Send the data to the PHP script using fetch
            fetch(actionUrl, {
                method: method,
                body: formData // FormData handles headers automatically for multipart/form-data or application/x-www-form-urlencoded
            })
            .then(response => {
                // Check if the response status is OK (e.g., 200)
                if (!response.ok) {
                    // If not OK, throw an error to be caught by the .catch block
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                // Parse the JSON response from the PHP script
                return response.json();
            })
            .then(data => {
                // Check the 'logged_in' status from the JSON response
                if (data.logged_in === true) {
                    // Login successful: Redirect to index.html
                    console.log('Login successful! Redirecting...');
                    window.location.href = 'index.html'; // Redirect to your main page
                } else {
                    // Login failed: Show an alert popup with the error message from PHP
                    console.error('Login failed:', data.error);
                    alert(data.error || 'Invalid email or password.'); // Show PHP error or a default one
                }
            })
            .catch(error => {
                // Handle network errors or errors thrown from the .then blocks
                console.error('Login request failed:', error);
                alert('An error occurred during login. Please try again later.');
            });
        });
    } else {
        console.error('Login form element not found!');
    }
});



