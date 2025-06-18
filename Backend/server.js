const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Middleware to parse incoming JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'Frontend' folder
app.use(express.static(path.join(__dirname, '../Frontend')));

// File paths
const bookingsFilePath = path.join(__dirname, 'bookings.json');
const enquiriesFilePath = path.join(__dirname, 'enquiries.json');


// -------------------- BOOKINGS HANDLING --------------------

function readBookings() {
  try {
    const data = fs.readFileSync(bookingsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading bookings file:', err);
    return [];
  }
}

function writeBookings(bookings) {
  try {
    fs.writeFileSync(bookingsFilePath, JSON.stringify(bookings, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing bookings file:', err);
  }
}

// Get all bookings
app.get('/api/bookings', (req, res) => {
  const bookings = readBookings();
  res.json(bookings);
});

// Create a new booking
app.post('/api/book', (req, res) => {
  const { name, event, date, days, promo } = req.body;

  if (!name || !event || !date || !days) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const bookings = readBookings();
  const costPerDay = 35000;
  let totalCost = days * costPerDay;

  if (promo === 'WEDDING10') {
    totalCost *= 0.9;
  }

  const newBooking = {
    id: bookings.length + 1,
    name,
    event,
    date,
    days,
    total: totalCost,
    status: 'Pending',
  };

  bookings.push(newBooking);
  writeBookings(bookings);

  res.status(201).json({ message: 'Booking created', total: totalCost });
});

// Update booking status to "Paid"
app.put('/api/bookings/:id', (req, res) => {
  const bookingId = parseInt(req.params.id, 10);
  const bookings = readBookings();

  const bookingIndex = bookings.findIndex(booking => booking.id === bookingId);
  if (bookingIndex === -1) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  bookings[bookingIndex].status = 'Paid';
  writeBookings(bookings);

  res.json({ message: 'Booking status updated to Paid' });
});


// -------------------- ENQUIRY HANDLING --------------------

// POST - Save an enquiry
app.post('/enquiry', (req, res) => {
  const enquiry = req.body;
  let enquiries = [];

  if (fs.existsSync(enquiriesFilePath)) {
    enquiries = JSON.parse(fs.readFileSync(enquiriesFilePath, 'utf-8'));
  }

  enquiries.push(enquiry);
  fs.writeFileSync(enquiriesFilePath, JSON.stringify(enquiries, null, 2), 'utf-8');

  res.json({ message: 'Enquiry submitted successfully!' });
});

// ✅ GET - Fetch all enquiries
app.get('/api/enquiries', (req, res) => {
  try {
    let enquiries = [];

    if (fs.existsSync(enquiriesFilePath)) {
      enquiries = JSON.parse(fs.readFileSync(enquiriesFilePath, 'utf-8'));
    }

    res.json(enquiries);
  } catch (err) {
    console.error('Error reading enquiries:', err);
    res.status(500).json({ message: 'Error retrieving enquiries' });
  }
});


// -------------------- START SERVER --------------------

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
