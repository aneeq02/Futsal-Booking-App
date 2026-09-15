// Toggle dropdown menus
function toggleNotifications() {
    const dropdown = document.getElementById('notifications-dropdown');
    dropdown.classList.toggle('hidden');
    
    // Hide user dropdown if open
    document.getElementById('user-dropdown').classList.add('hidden');
}

function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.classList.toggle('hidden');
    
    // Hide notifications dropdown if open
    document.getElementById('notifications-dropdown').classList.add('hidden');
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('.relative')) {
        document.getElementById('notifications-dropdown').classList.add('hidden');
        document.getElementById('user-dropdown').classList.add('hidden');
    }
});

// Navigation functions
function showDashboard() {
    hideAllSections();
    document.getElementById('dashboard-section').classList.remove('hidden');
    document.getElementById('page-title').textContent = 'Dashboard';
    setActiveNav('dashboard-btn');
}

function showGrounds() {
    hideAllSections();
    document.getElementById('grounds-section').classList.remove('hidden');
    document.getElementById('page-title').textContent = 'Grounds';
    setActiveNav('grounds-btn');
}

function showBookings() {
    hideAllSections();
    document.getElementById('bookings-section').classList.remove('hidden');
    document.getElementById('page-title').textContent = 'Bookings';
    setActiveNav('bookings-btn');
}

function showSettings() {
    hideAllSections();
    document.getElementById('settings-section').classList.remove('hidden');
    document.getElementById('page-title').textContent = 'Settings';
    setActiveNav('settings-btn');
}

function hideAllSections() {
    const sections = document.querySelectorAll('.section-content');
    sections.forEach(section => {
        section.classList.add('hidden');
    });
}

function setActiveNav(activeId) {
    const navButtons = document.querySelectorAll('nav button');
    navButtons.forEach(button => {
        button.classList.remove('active-nav');
        button.classList.remove('bg-green-700');
    });
    
    const activeButton = document.getElementById(activeId);
    activeButton.classList.add('active-nav');
    activeButton.classList.add('bg-green-700');
}

// Ground Modals
function showAddGroundModal() {
    document.getElementById('add-ground-modal').classList.remove('hidden');
}

function hideAddGroundModal() {
    document.getElementById('add-ground-modal').classList.add('hidden');
}

let selectedGroundId = null;

function showEditGroundModal(button) {
    selectedGroundId = button.getAttribute('data-ground-id');
    console.log('Editing ground:', selectedGroundId);

    fetch(`src/backend/get_ground.php?id=${selectedGroundId}`)
        .then(res => {
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            return res.json();
        })
        .then(response => {
            if (response.success) {
                const ground = response.ground;
                const modal = document.getElementById('edit-ground-modal');
                document.getElementById('editGroundId').value = ground.ground_id;
                modal.querySelector('input[name="name"]').value = ground.name;
                modal.querySelector('input[name="location"]').value = ground.location;
                modal.querySelector('input[name="price_per_hour"]').value = ground.price_per_hour;
                modal.querySelector('textarea[name="address"]').value = ground.address;

                modal.classList.remove('hidden');
            } else {
                alert(`Failed to load ground: ${response.message}`);
            }
        })
        .catch(err => {
            console.error('Fetch error:', err);
            alert(`An error occurred: ${err.message}`);
        });
}

function hideEditGroundModal() {
    document.getElementById('edit-ground-modal').classList.add('hidden');
}

function confirmDeleteGround(button) {
    selectedGroundId = button.getAttribute('data-ground-id');
    console.log('Deleting ground:', selectedGroundId);
    document.getElementById('delete-ground-modal').classList.remove('hidden');
}

function hideDeleteGroundModal() {
    document.getElementById('delete-ground-modal').classList.add('hidden');
}

document.querySelector('#edit-ground-modal button.bg-green-600').addEventListener('click', (e) => {
    e.preventDefault(); // prevent form from submitting normally

    const form = document.getElementById('editGroundForm');
    const formData = new FormData(form);

    fetch('src/backend/update_ground.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(response => {
        if (response.success) {
            hideEditGroundModal();
            alert('Ground updated successfully!');
            location.reload();
        } else {
            alert('Failed to update ground: ' + response.message);
        }
    })
    .catch(err => console.error('Error:', err));
});


document.querySelector('#delete-ground-modal button.bg-red-600').addEventListener('click', () => {
    fetch('src/backend/delete_ground.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ground_id: selectedGroundId })
    })
    .then(res => res.json())
    .then(response => {
        if (response.success) {
            hideDeleteGroundModal();
            alert('Ground deleted successfully!');
            location.reload(); // ✅ Refresh the page after deletion
        } else {
            alert('Failed to delete ground: ' + response.message);
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('An error occurred while deleting the ground.');
    });
});
// Booking Modals
function showAddBookingModal() {
    document.getElementById('add-booking-modal').classList.remove('hidden');
}

function hideAddBookingModal() {
    document.getElementById('add-booking-modal').classList.add('hidden');
}

function showEditBookingModal(button) {
    const bookingId = button.dataset.bookingId;
    const paymentStatus = button.dataset.paymentStatus;
    const ground = button.dataset.ground;
    const date = button.dataset.date;
    const time = button.dataset.time;
    const status = button.dataset.status;
    const amount = button.dataset.amount;

    document.getElementById('edit-booking-id').value = bookingId;
    document.getElementById('edit-payment-status').value = paymentStatus;
    document.getElementById('edit-ground').value = ground;
    document.getElementById('edit-date').value = date;
    document.getElementById('edit-time').value = time;
    document.getElementById('edit-status').value = status;
    document.getElementById('edit-amount').value = amount;

    document.getElementById('edit-booking-modal').classList.remove('hidden');
}

function hideEditBookingModal() {
    document.getElementById('edit-booking-modal').classList.add('hidden');
}

function confirmCancelBooking(button) {
    const bookingId = button.getAttribute('data-booking-id');
    console.log('Cancelling booking:', bookingId);
    document.getElementById('cancel-booking-modal').classList.remove('hidden');
}

function hideCancelBookingModal() {
    document.getElementById('cancel-booking-modal').classList.add('hidden');
}

// Initialize dashboard as active
document.addEventListener('DOMContentLoaded', function() {
    setActiveNav('dashboard-btn');
});

document.getElementById('addGroundForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    fetch(form.action, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.success) {
            alert('Ground added successfully!')
            window.location.href = 'admin.html';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Something went wrong. Please try again.');
    });
});


document.addEventListener('DOMContentLoaded', () => {
    fetchGrounds();
});

function fetchGrounds()     {
    fetch('src/backend/fetch_ground.php')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('groundsTableBody');
            tbody.innerHTML = ''; // Clear old rows

            data.forEach(ground => {


                const row = `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="py-3 px-4">#${ground.ground_id}</td>
                        <td class="py-3 px-4">${ground.name}</td>
                        <td class="py-3 px-4">${ground.location}</td>
                        
                        <td class="py-3 px-4">$${ground.price_per_hour}</td>
                        <td class="py-3 px-4">
                            <div class="flex space-x-2">
                                <button onclick="showEditGroundModal(this)" class="text-blue-600 hover:text-blue-800" data-ground-id="${ground.ground_id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="confirmDeleteGround(this)" class="text-red-600 hover:text-red-800" data-ground-id="${ground.ground_id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;

                tbody.insertAdjacentHTML('beforeend', row);
            });
        })
        .catch(error => console.error('Error fetching grounds:', error));
}


document.addEventListener('DOMContentLoaded', () => {
    fetchBookings();
});

function fetchBookings() {
    fetch('src/backend/get_bookings.php') // Replace with the actual path to your PHP file
        .then(response => response.json())
        .then(data => populateBookingsTable(data))
        .catch(error => console.error('Error fetching bookings:', error));
}

function populateBookingsTable(bookings) {
    const tbody = document.querySelector('#bookings-section table tbody');
    tbody.innerHTML = ''; // Clear existing rows

    bookings.forEach((booking, index) => {
        const row = document.createElement('tr');
        row.className = 'border-b hover:bg-gray-50';

        const bookingId = `${String(booking.booking_id)}`;
        const date = formatDate(booking.booking_date);
        const time = `${booking.start_time}`;
        const amount = `$${booking.amount}`;

        // Determine status color classes
        let statusClass = '';
        if (booking.status === 'confirmed') {
            statusClass = 'bg-green-100 text-green-800';
        } else if (booking.status === 'pending') {
            statusClass = 'bg-yellow-100 text-yellow-800';
        } else if (booking.status === 'cancelled') {
            statusClass = 'bg-red-100 text-red-800';
        }

        row.innerHTML = `
            <td class="py-3 px-4">${bookingId}</td>
            <td class="py-3 px-4">${booking.payment_status}</td>
            <td class="py-3 px-4">${booking.ground_name}</td>
            <td class="py-3 px-4">${date}</td>
            <td class="py-3 px-4">${time}</td>
            <td class="py-3 px-4"><span class="px-2 py-1 ${statusClass} rounded-full text-xs">${booking.status}</span></td>
            <td class="py-3 px-4">${amount}</td>
            <td class="py-3 px-4">
                <div class="flex space-x-2">
                    <button onclick="showEditBookingModal(this)" class="text-blue-600 hover:text-blue-800" data-booking-id="${bookingId}" data-payment-status="${booking.payment_status}" 
                        data-ground="${booking.ground_name}"
                        data-date="${booking.booking_date}" 
                        data-time="${booking.start_time}" 
                        data-status="${booking.status}" 
                        data-amount="${booking.amount}"><i class="fas fa-edit"></i></button>
                    <button onclick="confirmCancelBooking(this)" class="text-red-600 hover:text-red-800" data-booking-id="${bookingId}"><i class="fas fa-times-circle"></i></button>
                </div>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}


document.getElementById('update-booking-button').addEventListener('click', function () {
    const bookingId = document.getElementById('edit-booking-id').value;
    const paymentStatus = document.getElementById('edit-payment-status').value;
    const ground = document.getElementById('edit-ground').value;
    const date = document.getElementById('edit-date').value;
    const time = document.getElementById('edit-time').value;
    const status = document.getElementById('edit-status').value;
    const amount = document.getElementById('edit-amount').value;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'src/backend/update_booking.php', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onload = function () {
        if (xhr.status === 200) {
            alert('✅ Booking updated successfully!');
            document.getElementById('edit-booking-modal').classList.add('hidden');
            window.location.reload();
        } else {
            alert('❌ Error updating booking.');
        }
    };

    xhr.send(`booking_id=${bookingId}&payment_status=${paymentStatus}&ground=${ground}&date=${date}&time=${time}&status=${status}&amount=${amount}`);
});


function loadGroundCount() {
    fetch('src/backend/ground_count.php')
        .then(res => res.json())
        .then(response => {
            if (response.success) {
                document.getElementById('ground-count').textContent = `${response.count}`;
            } else {
                document.getElementById('ground-count').textContent = 'Failed to load ground count';
            }
        })
        .catch(err => {
            console.error('Error fetching ground count:', err);
            document.getElementById('ground-count').textContent = 'Error loading ground count';
        });
}

// Call the function when page loads
window.addEventListener('DOMContentLoaded', loadGroundCount);

function loadBookingCount() {
    fetch('src/backend/booking_count.php')
        .then(res => res.json())
        .then(response => {
            if (response.success) {
                document.getElementById('booking-count').textContent = response.count;
            } else {
                document.getElementById('booking-count').textContent = '0';
                console.warn('Failed to load booking count:', response.message);
            }
        })
        .catch(err => {
            console.error('Error fetching booking count:', err);
            document.getElementById('booking-count').textContent = '0';
        });
}

// Call this when page loads
window.addEventListener('DOMContentLoaded', loadBookingCount);

function loadWeeklyRevenue() {
    fetch('src/backend/revenue_count.php')
        .then(res => res.json())
        .then(response => {
            if (response.success) {
                const revenue = parseFloat(response.revenue).toFixed(2);
                document.getElementById('weekly-revenue').textContent = `$${revenue}`;
            } else {
                document.getElementById('weekly-revenue').textContent = '$0.00';
                console.warn('Failed to load weekly revenue:', response.message);
            }
        })
        .catch(err => {
            console.error('Error fetching weekly revenue:', err);
            document.getElementById('weekly-revenue').textContent = '$0.00';
        });
}

// Call this when page loads
window.addEventListener('DOMContentLoaded', loadWeeklyRevenue);


function loadPendingRequests() {
    fetch('src/backend/pending_bookings.php')
        .then(res => res.json())
        .then(response => {
            if (response.success) {
                document.getElementById('pending-requests').textContent = response.pending;
            } else {
                document.getElementById('pending-requests').textContent = '0';
                console.warn('Failed to load pending requests:', response.message);
            }
        })
        .catch(err => {
            console.error('Error fetching pending requests:', err);
            document.getElementById('pending-requests').textContent = '0';
        });
}

// Call on page load
window.addEventListener('DOMContentLoaded', loadPendingRequests);

function loadRecentBookings() {
    fetch('src/backend/recent_bookings.php')
        .then(res => res.json())
        .then(response => {
            if (response.success) {
                const tbody = document.getElementById('recent-bookings-body');
                tbody.innerHTML = '';

                response.bookings.forEach(booking => {
                    let statusClass = '';
                    switch (booking.status.toLowerCase()) {
                        case 'confirmed':
                            statusClass = 'bg-green-100 text-green-800';
                            break;
                        case 'pending':
                            statusClass = 'bg-yellow-100 text-yellow-800';
                            break;
                        case 'cancelled':
                            statusClass = 'bg-red-100 text-red-800';
                            break;
                        default:
                            statusClass = 'bg-gray-100 text-gray-800';
                    }

                    const row = `
                        <tr class="border-b hover:bg-gray-50">
                            <td class="py-2 px-4">${booking.ground}</td>
                            <td class="py-2 px-4">${booking.date}</td>
                            <td class="py-2 px-4">${booking.time}</td>
                            <td class="py-2 px-4">
                                <span class="px-2 py-1 ${statusClass} rounded-full text-xs">${booking.status}</span>
                            </td>
                        </tr>
                    `;
                    tbody.insertAdjacentHTML('beforeend', row);
                });
            } else {
                console.warn('Failed to load bookings:', response.message);
            }
        })
        .catch(err => {
            console.error('Error fetching bookings:', err);
        });
}

// Call on page load
window.addEventListener('DOMContentLoaded', loadRecentBookings);

function loadGroundAvailability() {
    fetch('src/backend/ground_availability.php')
        .then(res => res.json())
        .then(response => {
            if (response.success) {
                const container = document.getElementById('ground-availability');
                container.innerHTML = '';

                response.grounds.forEach(ground => {
                    let statusText = '';
                    let statusColor = '';
                    let progressWidth = ground.percentage;

                    if (ground.status === 'available') {
                        statusText = `${ground.available_slots} slots available`;
                        statusColor = 'text-green-600 bg-green-600';
                    } else if (ground.status === 'fully_booked') {
                        statusText = 'Fully Booked';
                        statusColor = 'text-red-600 bg-red-600';
                        progressWidth = 100;
                    } else if (ground.status === 'maintenance') {
                        statusText = 'Under Maintenance';
                        statusColor = 'text-yellow-600 bg-yellow-600';
                        progressWidth = 0;
                    }

                    const item = `
                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <p>${ground.name}</p>
                                <p class="text-sm ${statusColor.split(' ')[0]}">${statusText}</p>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="${statusColor.split(' ')[1]} h-2 rounded-full" style="width: ${progressWidth}%"></div>
                            </div>
                        </div>
                    `;
                    container.insertAdjacentHTML('beforeend', item);
                });
            } else {
                console.warn('Failed to load ground availability:', response.message);
            }
        })
        .catch(err => {
            console.error('Error fetching ground availability:', err);
        });
}

// Call on page load
window.addEventListener('DOMContentLoaded', loadGroundAvailability);
