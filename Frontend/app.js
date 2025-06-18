document.addEventListener('DOMContentLoaded', () => {
  const adminTable = document.getElementById('adminTable');

  // Fetch bookings from API
  fetch('http://localhost:3000/api/bookings')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(bookings => {
      bookings.forEach(booking => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${booking.id}</td>
          <td>${booking.name}</td>
          <td>${booking.event}</td>
          <td>${booking.date}</td>
          <td>${booking.days}</td>
          <td>${booking.total}</td>
          <td>${booking.status}</td>
          <td><button onclick="markAsPaid(${booking.id})">Mark as Paid</button></td>
        `;
        adminTable.appendChild(row);
      });
    })
    .catch(err => console.error('Error fetching bookings:', err));
});

// Mark booking as paid
function markAsPaid(id) {
  fetch(`http://localhost:3000/api/bookings/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }
      return response.json();
    })
    .then(data => {
      alert(data.message);
      location.reload(); // Refresh page to reflect changes
    })
    .catch(err => console.error('Error updating status:', err));
}

// Function to calculate cost
function calculateCost() {
  const days = parseInt(document.getElementById('days').value, 10);
  const promo = document.getElementById('promo').value;
  const costPerDay = 35000; // Assuming 35000 per day

  if (isNaN(days) || days < 1) {
    alert("Please enter a valid number of days");
    return;
  }

  let totalCost = days * costPerDay;

  // Apply discount if promo code is valid
  if (promo === 'WEDDING10') {
    totalCost *= 0.9; // 10% discount
  }

  // Update the total cost display
  document.getElementById('totalCost').textContent = totalCost;
}

// Handle form submission
document.getElementById('bookingForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent form submission

  const name = document.getElementById('name').value;
  const eventType = document.getElementById('event').value;
  const date = document.getElementById('date').value;
  const days = document.getElementById('days').value;
  const promo = document.getElementById('promo').value;
  const total = document.getElementById('totalCost').textContent;

  if (!name || !eventType || !date || !days || !total || total === '0') {
    alert("Please fill in all fields and calculate the cost.");
    return;
  }

  // Send the data to the server to create a booking
  fetch('http://localhost:3000/api/book', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      event: eventType,
      date,
      days: parseInt(days, 10),
      promo,
    }),
  })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      // Reset the form or redirect the user after successful submission
      document.getElementById('bookingForm').reset();
      document.getElementById('totalCost').textContent = '0'; // Reset total cost
    })
    .catch(err => console.error('Error creating booking:', err));
});
