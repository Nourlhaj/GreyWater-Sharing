// Greywater Sharing Platform - Main JavaScript File

document.addEventListener('DOMContentLoaded', function () {
    // Initialize the application
    initApp();
});

function initApp() {
    // Common functionality across all pages
    setupMobileMenu();
    setupCurrentYear();

    // Page-specific functionality
    const currentPage = document.body.getAttribute('data-page') ||
        window.location.pathname.split('/').pop().replace('.html', '');

    switch (currentPage) {
        case 'signup':
            setupSignupPage();
            break;
        case 'list-water':
            setupListWaterPage();
            break;
        case 'find-water':
            setupFindWaterPage();
            break;
        case 'tracking':
            setupTrackingPage();
            break;
        default:
            setupHomePage();
    }
}

// Common Functions
function setupMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            const nav = document.querySelector('nav ul');
            nav.classList.toggle('active');
        });
    }
}

function setupCurrentYear() {
    const yearElements = document.querySelectorAll('.current-year');
    if (yearElements.length) {
        const currentYear = new Date().getFullYear();
        yearElements.forEach(el => {
            el.textContent = currentYear;
        });
    }
}

// Page-Specific Functions
function setupHomePage() {
    // Animation for feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}

function setupSignupPage() {
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(registrationForm);
            const userData = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password'),
                userType: formData.get('user-type'),
                location: formData.get('location'),
                entityType: formData.get('entity-type'),
                registeredAt: new Date().toISOString()
            };

            // Save to localStorage (simulating database)
            localStorage.setItem('currentUser', JSON.stringify(userData));

            // Store all users (for demo purposes)
            const allUsers = JSON.parse(localStorage.getItem('users')) || [];
            allUsers.push(userData);
            localStorage.setItem('users', JSON.stringify(allUsers));

            // Show success message
            document.getElementById('success-message').classList.remove('hidden');
            registrationForm.classList.add('hidden');

            // Redirect after delay (demo purposes)
            setTimeout(() => {
                window.location.href = userData.userType === 'provider' ?
                    'list-water.html' : 'find-water.html';
            }, 2000);
        });
    }
}

function setupListWaterPage() {
    const waterListingForm = document.getElementById('waterListingForm');
    if (waterListingForm) {
        waterListingForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Check if user is logged in
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                alert('Please sign up or log in first.');
                window.location.href = 'signup.html';
                return;
            }

            // Get form data
            const formData = new FormData(waterListingForm);
            const listingData = {
                id: Date.now().toString(),
                provider: currentUser.name,
                providerEmail: currentUser.email,
                providerType: currentUser.entityType,
                waterSource: formData.get('water-source'),
                waterAmount: formData.get('water-amount'),
                filterStatus: formData.get('filter-status'),
                availability: formData.get('availability'),
                pickupOptions: formData.get('pickup-options'),
                notes: formData.get('notes'),
                location: currentUser.location,
                listedAt: new Date().toISOString(),
                status: 'available'
            };

            // Save to localStorage (simulating database)
            const listings = JSON.parse(localStorage.getItem('waterListings')) || [];
            listings.push(listingData);
            localStorage.setItem('waterListings', JSON.stringify(listings));

            // Show success message
            document.getElementById('listing-success').classList.remove('hidden');
            waterListingForm.classList.add('hidden');

            // Update user stats
            updateUserStats(currentUser.email, 'listings', 1);
        });
    }
}

function setupFindWaterPage() {
    // Load listings from storage
    const listings = JSON.parse(localStorage.getItem('waterListings')) || [];
    const resultList = document.querySelector('.result-list');

    // Display listings
    if (listings.length && resultList) {
        resultList.innerHTML = '';

        listings.filter(listing => listing.status === 'available').forEach(listing => {
            const card = document.createElement('div');
            card.className = 'water-card';
            card.innerHTML = `
                <h4>${listing.waterSource} Water</h4>
                <p><strong>Amount:</strong> ${listing.waterAmount} liters</p>
                <p><strong>Location:</strong> ${listing.location}</p>
                <p><strong>Status:</strong> ${listing.filterStatus}</p>
                <p><strong>Available:</strong> ${listing.availability}</p>
                <button class="btn secondary request-btn" data-id="${listing.id}">Request This Water</button>
            `;
            resultList.appendChild(card);
        });
    } else if (resultList) {
        resultList.innerHTML = '<p class="no-results">No greywater listings available at this time.</p>';
    }

    // Search functionality
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function () {
            const location = document.getElementById('search-location').value.toLowerCase();
            const radius = document.getElementById('search-radius').value;
            const waterType = document.getElementById('water-type').value;

            // Filter listings (simplified for demo)
            const filtered = listings.filter(listing => {
                const matchesLocation = location ? listing.location.toLowerCase().includes(location) : true;
                const matchesType = waterType === 'all' ? true :
                    waterType === 'filtered' ? listing.filterStatus === 'filtered' :
                        listing.filterStatus === 'unfiltered';
                return matchesLocation && matchesType;
            });

            // Display filtered results
            if (resultList) {
                resultList.innerHTML = '';

                if (filtered.length) {
                    filtered.forEach(listing => {
                        const card = document.createElement('div');
                        card.className = 'water-card';
                        card.innerHTML = `
                            <h4>${listing.waterSource} Water</h4>
                            <p><strong>Amount:</strong> ${listing.waterAmount} liters</p>
                            <p><strong>Location:</strong> ${listing.location}</p>
                            <p><strong>Status:</strong> ${listing.filterStatus}</p>
                            <p><strong>Available:</strong> ${listing.availability}</p>
                            <button class="btn secondary request-btn" data-id="${listing.id}">Request This Water</button>
                        `;
                        resultList.appendChild(card);
                    });
                } else {
                    resultList.innerHTML = '<p class="no-results">No matching results found.</p>';
                }
            }
        });
    }

    // Request modal functionality
    setupRequestModal();
}

function setupRequestModal() {
    const modal = document.getElementById('request-modal');
    const closeBtn = document.querySelector('.close-modal');
    const requestForm = document.getElementById('request-form');

    // Open modal when request button is clicked
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('request-btn')) {
            const listingId = e.target.getAttribute('data-id');
            if (modal) {
                modal.setAttribute('data-listing-id', listingId);
                modal.classList.remove('hidden');
            }
        }
    });

    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            modal.classList.add('hidden');
        });
    }

    // Handle form submission
    if (requestForm) {
        requestForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Check if user is logged in
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                alert('Please sign up or log in first.');
                window.location.href = 'signup.html';
                return;
            }

            // Get form data
            const formData = new FormData(requestForm);
            const listingId = modal.getAttribute('data-listing-id');

            // Create request
            const requestData = {
                id: Date.now().toString(),
                listingId: listingId,
                requesterEmail: currentUser.email,
                requesterName: currentUser.name,
                amountRequested: formData.get('request-amount'),
                pickupDate: formData.get('request-date'),
                message: formData.get('request-message'),
                status: 'pending',
                requestedAt: new Date().toISOString()
            };

            // Save to localStorage (simulating database)
            const requests = JSON.parse(localStorage.getItem('waterRequests')) || [];
            requests.push(requestData);
            localStorage.setItem('waterRequests', JSON.stringify(requests));

            // Update listing status (in a real app, would keep available until confirmed)
            const listings = JSON.parse(localStorage.getItem('waterListings')) || [];
            const listingIndex = listings.findIndex(l => l.id === listingId);
            if (listingIndex !== -1) {
                listings[listingIndex].status = 'pending';
                localStorage.setItem('waterListings', JSON.stringify(listings));
            }

            // Show success message
            modal.classList.add('hidden');
            document.getElementById('request-success').classList.remove('hidden');

            // Update user stats
            updateUserStats(currentUser.email, 'requests', 1);
        });
    }
}

function setupTrackingPage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please sign up or log in to view tracking.');
        window.location.href = 'signup.html';
        return;
    }

    // Load user stats
    const userStats = JSON.parse(localStorage.getItem('userStats')) || {};
    const stats = userStats[currentUser.email] || {
        waterShared: 0,
        waterReceived: 0,
        listings: 0,
        requests: 0
    };

    // Display stats
    document.querySelector('.stat-value[data-stat="shared"]').textContent = stats.waterShared;
    document.querySelector('.stat-value[data-stat="received"]').textContent = stats.waterReceived;
    document.querySelector('.stat-value[data-stat="saved"]').textContent = stats.waterShared + stats.waterReceived;

    // Setup chart
    setupWaterChart(currentUser.email);

    // Setup leaderboard
    setupLeaderboard(currentUser.email);
}

function setupWaterChart(userEmail) {
    const ctx = document.getElementById('waterChart');
    if (!ctx) return;

    // Sample data - in a real app, this would come from the database
    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Water Shared (liters)',
                data: [120, 190, 150, 200, 180, 220],
                backgroundColor: 'rgba(52, 152, 219, 0.5)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 1
            },
            {
                label: 'Water Received (liters)',
                data: [80, 100, 120, 90, 110, 130],
                backgroundColor: 'rgba(46, 204, 113, 0.5)',
                borderColor: 'rgba(46, 204, 113, 1)',
                borderWidth: 1
            }
        ]
    };

    new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Liters'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Month'
                    }
                }
            }
        }
    });
}

function setupLeaderboard(userEmail) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userStats = JSON.parse(localStorage.getItem('userStats')) || {};

    // Create leaderboard data
    const leaderboard = users.map(user => {
        const stats = userStats[user.email] || {
            waterShared: 0,
            waterReceived: 0
        };
        return {
            name: user.name,
            location: user.location,
            waterShared: stats.waterShared || 0,
            isCurrentUser: user.email === userEmail
        };
    }).filter(user => user.waterShared > 0);

    // Sort by water shared
    leaderboard.sort((a, b) => b.waterShared - a.waterShared);

    // Display top 5
    const tbody = document.querySelector('.leaderboard tbody');
    if (tbody) {
        tbody.innerHTML = '';

        leaderboard.slice(0, 5).forEach((user, index) => {
            const row = document.createElement('tr');
            if (user.isCurrentUser) {
                row.classList.add('current-user');
            }
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${user.isCurrentUser ? 'You' : user.name}</td>
                <td>${user.waterShared} L</td>
                <td>${user.location}</td>
            `;
            tbody.appendChild(row);
        });
    }
}

// Helper Functions
function updateUserStats(email, statType, amount) {
    const userStats = JSON.parse(localStorage.getItem('userStats')) || {};

    if (!userStats[email]) {
        userStats[email] = {
            waterShared: 0,
            waterReceived: 0,
            listings: 0,
            requests: 0
        };
    }

    switch (statType) {
        case 'shared':
            userStats[email].waterShared += amount;
            break;
        case 'received':
            userStats[email].waterReceived += amount;
            break;
        case 'listings':
            userStats[email].listings += amount;
            break;
        case 'requests':
            userStats[email].requests += amount;
            break;
    }

    localStorage.setItem('userStats', JSON.stringify(userStats));
}
