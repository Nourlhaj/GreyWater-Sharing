// Common functionality across all pages

// Mobile menu toggle (if needed)
document.addEventListener('DOMContentLoaded', function () {
    // Form submissions
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function (e) {
            e.preventDefault();
            // In a real app, you would send this data to a server
            document.getElementById('success-message').classList.remove('hidden');
            registrationForm.classList.add('hidden');
            // Store user data in localStorage for demo purposes
            const formData = new FormData(registrationForm);
            const userData = {};
            formData.forEach((value, key) => {
                userData[key] = value;
            });
            localStorage.setItem('userData', JSON.stringify(userData));
        });
    }

    // Water listing form
    const waterListingForm = document.getElementById('waterListingForm');
    if (waterListingForm) {
        waterListingForm.addEventListener('submit', function (e) {
            e.preventDefault();
            document.getElementById('listing-success').classList.remove('hidden');
            waterListingForm.classList.add('hidden');
            // Store listing in localStorage for demo purposes
            const formData = new FormData(waterListingForm);
            const listingData = {};
            formData.forEach((value, key) => {
                listingData[key] = value;
            });

            // Add some demo data
            listingData.id = Date.now();
            listingData.provider = "You";
            listingData.location = JSON.parse(localStorage.getItem('userData')).location;

            let listings = JSON.parse(localStorage.getItem('waterListings')) || [];
            listings.push(listingData);
            localStorage.setItem('waterListings', JSON.stringify(listings));
        });
    }

    // Find water page functionality
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function () {
            // In a real app, this would filter actual data
            alert('Search functionality would filter water listings based on your criteria in a real application.');
        });
    }

    // Request buttons
    const requestButtons = document.querySelectorAll('.request-btn');
    if (requestButtons) {
        requestButtons.forEach(button => {
            button.addEventListener('click', function () {
                document.getElementById('request-modal').classList.remove('hidden');
            });
        });
    }

    // Close modal
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', function () {
            document.getElementById('request-modal').classList.add('hidden');
        });
    }

    // Request form submission
    const requestForm = document.getElementById('request-form');
    if (requestForm) {
        requestForm.addEventListener('submit', function (e) {
            e.preventDefault();
            document.getElementById('request-modal').classList.add('hidden');
            document.getElementById('request-success').classList.remove('hidden');
        });
    }

    // Time filter buttons
    const timeFilters = document.querySelectorAll('.time-filter');
    if (timeFilters) {
        timeFilters.forEach(filter => {
            filter.addEventListener('click', function () {
                timeFilters.forEach(f => f.classList.remove('active'));
                this.classList.add('active');
                // In a real app, this would update the chart data
            });

