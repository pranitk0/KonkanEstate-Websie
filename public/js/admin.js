// Admin-specific JavaScript
const Admin_API_BASE = '/api';
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// Check if user is admin
if (!currentUser || !currentUser.isVerified) {
    alert('🔒 Access denied. Admin access required.');
    window.location.href = '/login';
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    console.log('👑 Admin panel loaded for:', currentUser.name);
    loadAdminData();
    
    // Add animation to stats cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
    });
});

// Tab functionality
function openTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));

    // Remove active class from all buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));

    // Show the specific tab content
    document.getElementById(tabName).classList.add('active');

    // Add active class to the button that opened the tab
    event.currentTarget.classList.add('active');

    // Load data for the tab if needed
    if (tabName === 'pending') {
        loadPendingProperties();
    } else if (tabName === 'users') {
        loadUsers();
    } else if (tabName === 'sold') {
        loadSoldProperties();
    } else if (tabName === 'interests') {
        loadInterests();
    }
}

// Load all admin data
async function loadAdminData() {
    try {
        await Promise.all([
            loadPendingProperties(),
            loadUsers(),
            loadStats(),
            loadInterests(),
            loadSoldProperties()
        ]);
    } catch (error) {
        console.error('Error loading admin data:', error);
        showAlert('❌ Failed to load admin data', 'error');
    }
}

// Load statistics
async function loadStats() {
    try {
        console.log('📊 Loading admin statistics...');
        
        // Load pending properties count
        const pendingResponse = await fetch(`${Admin_API_BASE}/admin/pending-properties`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const pendingProperties = pendingResponse.ok ? await pendingResponse.json() : [];
        document.getElementById('pendingCount').textContent = pendingProperties.length;
        console.log(`📊 Pending properties: ${pendingProperties.length}`);

        // Load users count
        const usersResponse = await fetch(`${Admin_API_BASE}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const users = usersResponse.ok ? await usersResponse.json() : [];
        document.getElementById('totalUsers').textContent = users.length;
        console.log(`📊 Total users: ${users.length}`);

        // Load all properties to get total count
        const propertiesResponse = await fetch(`${Admin_API_BASE}/properties`);
        const allProperties = propertiesResponse.ok ? await propertiesResponse.json() : [];
        document.getElementById('totalProperties').textContent = allProperties.length;
        console.log(`📊 Total properties: ${allProperties.length}`);

        // Load sold properties count
        const soldResponse = await fetch(`${Admin_API_BASE}/admin/sold-properties`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const soldProperties = soldResponse.ok ? await soldResponse.json() : [];
        document.getElementById('soldCount').textContent = soldProperties.length;
        console.log(`📊 Sold properties: ${soldProperties.length}`);

    } catch (error) {
        console.error('❌ Error loading stats:', error);
        showAlert('❌ Failed to load statistics', 'error');
    }
}

// Load pending properties
async function loadPendingProperties() {
    try {
        showLoading('pendingProperties');
        console.log('🔄 Loading pending properties...');
        
        const response = await fetch(`${Admin_API_BASE}/admin/pending-properties`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            console.log('asdfs');
        }

        const properties = await response.json();
        console.log(`✅ Loaded ${properties.length} pending properties:`, properties);
        displayPendingProperties(properties);
    } catch (error) {
        console.error('❌ Error loading pending properties:', error);
        document.getElementById('pendingProperties').innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-exclamation-triangle" style="color: #ff6b6b;"></i>
                <h3>Error Loading Properties</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="loadPendingProperties()" style="margin-top: 1rem;">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }
}

// Display pending properties
function displayPendingProperties(properties) {
    const container = document.getElementById('pendingProperties');
    
    if (properties.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-check-circle" style="color: var(--primary);"></i>
                <h3>No Pending Properties</h3>
                <p>All properties have been reviewed and approved.</p>
                <p class="text-muted">New property submissions will appear here for approval.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = properties.map((property, index) => `
        <div class="property-card card-hover" style="animation-delay: ${index * 0.1}s">
            <div class="property-image">
                <img src="/images/${property.images && property.images[0] ? property.images[0] : 'property-placeholder.jpg'}" 
                     alt="${property.title}"
                     onerror="this.src='/images/property-placeholder.jpg'">
                <div style="position: absolute; top: 1rem; right: 1rem; background: rgba(255,193,7,0.9); color: #000; padding: 0.5rem; border-radius: 5px; font-size: 0.8rem; font-weight: bold;">
                    ⏳ PENDING
                </div>
            </div>
            <div class="property-info">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <div class="property-price">₹${property.price.toLocaleString()}</div>
                    <span class="status-badge status-pending">Pending Review</span>
                </div>
                <h3 class="property-title">${property.title}</h3>
                <div class="property-location">
                    <i class="fas fa-map-marker-alt"></i> ${property.location}
                </div>
                <div class="property-meta">
                    <span><i class="fas fa-expand-arrows-alt"></i> ${property.area} sq.ft</span>
                    <span><i class="fas fa-bed"></i> ${property.bedrooms} Beds</span>
                    <span><i class="fas fa-bath"></i> ${property.bathrooms} Baths</span>
                </div>
                <div class="property-meta">
                    <span><i class="fas fa-home"></i> ${property.propertyType}</span>
                    <span><i class="fas fa-user"></i> ${property.seller?.name || 'Unknown'}</span>
                </div>
                <div style="margin: 1rem 0; padding: 1rem; background: var(--light-gray); border-radius: 8px;">
                    <strong style="color: var(--primary);">Description:</strong>
                    <p style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--dark);">${property.description}</p>
                </div>
                <div style="margin: 1rem 0;">
                    <strong style="color: var(--primary);">Contact Info:</strong>
                    <p style="margin-top: 0.5rem; font-size: 0.9rem;">
                        <i class="fas fa-envelope"></i> ${property.seller?.email || 'No email'}<br>
                        <i class="fas fa-phone"></i> ${property.seller?.phone || 'Not provided'}
                    </p>
                </div>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm btn-3d" onclick="approveProperty('${property._id}')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn btn-secondary btn-sm btn-3d" onclick="rejectProperty('${property._id}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="viewPropertyDetails('${property._id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="markAsSold('${property._id}')">
                        <i class="fas fa-tag"></i> Mark Sold
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load users
async function loadUsers() {
    try {
        showLoading('usersList');
        console.log('🔄 Loading users...');
        
        const response = await fetch(`${Admin_API_BASE}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        const users = await response.json();
        console.log(`✅ Loaded ${users.length} users`);
        displayUsers(users);
    } catch (error) {
        console.error('❌ Error loading users:', error);
        document.getElementById('usersList').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle" style="color: #ff6b6b;"></i>
                <h3>Error Loading Users</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="loadUsers()" style="margin-top: 1rem;">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }
}

// Display users
function displayUsers(users) {
    const container = document.getElementById('usersList');
    
    if (users.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>No Users Found</h3>
                <p>There are no registered users yet.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div style="overflow-x: auto;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Registered</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>
                                <strong>${user.name}</strong>
                                ${user.isVerified ? '<br><small class="status-badge status-approved">Admin</small>' : ''}
                            </td>
                            <td>${user.email}</td>
                            <td>${user.phone || 'N/A'}</td>
                            <td>${user.address || 'N/A'}</td>
                            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                            <td>
                                <span class="status-badge ${user.isVerified ? 'status-approved' : 'status-pending'}">
                                    ${user.isVerified ? 'Administrator' : 'User'}
                                </span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    ${!user.isVerified ? `
                                        <button class="btn btn-primary btn-sm" onclick="makeAdmin('${user._id}')">
                                            <i class="fas fa-user-shield"></i> Make Admin
                                        </button>
                                    ` : `
                                        <span class="status-badge status-approved">Administrator</span>
                                    `}
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Load sold properties
async function loadSoldProperties() {
    try {
        showLoading('soldProperties');
        console.log('🔄 Loading sold properties...');
        
        const response = await fetch(`${Admin_API_BASE}/admin/sold-properties`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch sold properties');
        }

        const properties = await response.json();
        console.log(`✅ Loaded ${properties.length} sold properties`);
        displaySoldProperties(properties);
    } catch (error) {
        console.error('❌ Error loading sold properties:', error);
        document.getElementById('soldProperties').innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-exclamation-triangle" style="color: #ff6b6b;"></i>
                <h3>Error Loading Sold Properties</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="loadSoldProperties()" style="margin-top: 1rem;">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }
}

// Display sold properties
function displaySoldProperties(properties) {
    const container = document.getElementById('soldProperties');
    
    if (properties.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-home"></i>
                <h3>No Sold Properties</h3>
                <p>No properties have been marked as sold yet.</p>
                <p class="text-muted">Sold properties will appear here for record keeping.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = properties.map((property, index) => `
        <div class="property-card card-hover" style="animation-delay: ${index * 0.1}s">
            <div class="property-image">
                <img src="/images/${property.images && property.images[0] ? property.images[0] : 'property-placeholder.jpg'}" 
                     alt="${property.title}"
                     onerror="this.src='/images/property-placeholder.jpg'">
                <div style="position: absolute; top: 1rem; right: 1rem; background: rgba(40,167,69,0.9); color: white; padding: 0.5rem; border-radius: 5px; font-size: 0.8rem; font-weight: bold;">
                    ✅ SOLD
                </div>
            </div>
            <div class="property-info">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <div class="property-price">₹${property.price.toLocaleString()}</div>
                    <span class="status-badge status-sold">Sold</span>
                </div>
                <h3 class="property-title">${property.title}</h3>
                <div class="property-location">
                    <i class="fas fa-map-marker-alt"></i> ${property.location}
                </div>
                <div class="property-meta">
                    <span><i class="fas fa-expand-arrows-alt"></i> ${property.area} sq.ft</span>
                    <span><i class="fas fa-user"></i> ${property.seller?.name || 'Unknown'}</span>
                </div>
                <div class="interest-info">
                    <span><i class="fas fa-clock"></i> Sold on ${property.soldAt ? new Date(property.soldAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div style="margin-top: 1rem; padding: 1rem; background: #d4edda; border-radius: 8px; border-left: 4px solid #28a745;">
                    <strong style="color: #155724;">Sale Information</strong>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: #155724;">
                        This property has been successfully sold and is no longer available.
                    </p>
                </div>
            </div>
        </div>
    `).join('');
}

// Load interests
async function loadInterests() {
    try {
        showLoading('interestsList');
        console.log('🔄 Loading interests...');
        
        const response = await fetch(`${Admin_API_BASE}/admin/interests`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch interests');
        }

        const interests = await response.json();
        console.log(`✅ Loaded ${interests.length} interests`);
        displayInterests(interests);
    } catch (error) {
        console.error('❌ Error loading interests:', error);
        document.getElementById('interestsList').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle" style="color: #ff6b6b;"></i>
                <h3>Error Loading Interests</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="loadInterests()" style="margin-top: 1rem;">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }
}

// Display interests
function displayInterests(interests) {
    const container = document.getElementById('interestsList');
    
    if (interests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart"></i>
                <h3>No Interests</h3>
                <p>No one has shown interest in any properties yet.</p>
                <p class="text-muted">User interests will appear here when they show interest in properties.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div style="overflow-x: auto;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Buyer Information</th>
                        <th>Property Details</th>
                        <th>Price</th>
                        <th>Location</th>
                        <th>Interest Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${interests.map(interest => `
                        <tr>
                            <td>
                                <div style="line-height: 1.4;">
                                    <strong>${interest.buyer?.name || 'Unknown'}</strong><br>
                                    <small><i class="fas fa-envelope"></i> ${interest.buyer?.email || 'No email'}</small><br>
                                    <small><i class="fas fa-phone"></i> ${interest.buyer?.phone || 'No phone'}</small>
                                </div>
                            </td>
                            <td>
                                <div style="line-height: 1.4;">
                                    <strong>${interest.property?.title || 'Property Not Found'}</strong><br>
                                    <small><i class="fas fa-home"></i> ${interest.property?.propertyType || 'N/A'}</small><br>
                                    <small><i class="fas fa-expand-arrows-alt"></i> ${interest.property?.area || 'N/A'} sq.ft</small>
                                </div>
                            </td>
                            <td>
                                <strong style="color: var(--primary);">₹${interest.property?.price?.toLocaleString() || 'N/A'}</strong>
                            </td>
                            <td>${interest.property?.location || 'N/A'}</td>
                            <td>${new Date(interest.createdAt).toLocaleDateString()}<br>
                                <small>${new Date(interest.createdAt).toLocaleTimeString()}</small>
                            </td>
                            <td>
                                <span class="status-badge status-${interest.status}">
                                    ${interest.status.charAt(0).toUpperCase() + interest.status.slice(1)}
                                </span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="contactBuyer('${interest.buyer?.email}', '${interest.buyer?.phone}')">
                                        <i class="fas fa-phone"></i> Contact
                                    </button>
                                    <button class="btn btn-outline btn-sm" onclick="updateInterestStatus('${interest._id}', 'contacted')">
                                        <i class="fas fa-check"></i> Contacted
                                    </button>
                                    <button class="btn btn-outline btn-sm" onclick="updateInterestStatus('${interest._id}', 'closed')">
                                        <i class="fas fa-times"></i> Close
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Approve property
async function approveProperty(propertyId) {
    if (!confirm('Are you sure you want to approve this property?\n\nThis will make the property visible to all users.')) {
        return;
    }

    try {
        const approveBtn = event.target;
        const originalText = approveBtn.innerHTML;
        approveBtn.innerHTML = '<div class="loading"></div> Approving...';
        approveBtn.disabled = true;

        console.log(`✅ Approving property: ${propertyId}`);
        
        const response = await fetch(`${Admin_API_BASE}/admin/properties/${propertyId}/approve`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showAlert('✅ Property approved successfully!', 'success');
            loadPendingProperties();
            loadStats();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to approve property');
        }
    } catch (error) {
        console.error('❌ Error approving property:', error);
        showAlert(`❌ Failed to approve property: ${error.message}`, 'error');
    }
}

// Reject property
async function rejectProperty(propertyId) {
    if (!confirm('Are you sure you want to reject this property?\n\nThis action cannot be undone.')) {
        return;
    }

    try {
        const rejectBtn = event.target;
        const originalText = rejectBtn.innerHTML;
        rejectBtn.innerHTML = '<div class="loading"></div> Rejecting...';
        rejectBtn.disabled = true;

        console.log(`❌ Rejecting property: ${propertyId}`);
        
        const response = await fetch(`${Admin_API_BASE}/admin/properties/${propertyId}/reject`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showAlert('✅ Property rejected successfully!', 'success');
            loadPendingProperties();
            loadStats();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to reject property');
        }
    } catch (error) {
        console.error('❌ Error rejecting property:', error);
        showAlert(`❌ Failed to reject property: ${error.message}`, 'error');
    }
}

// Mark property as sold
async function markAsSold(propertyId) {
    if (!confirm('Are you sure you want to mark this property as sold?\n\nThis will remove it from active listings.')) {
        return;
    }

    try {
        console.log(`🏠 Marking property as sold: ${propertyId}`);
        
        const response = await fetch(`${Admin_API_BASE}/admin/properties/${propertyId}/sold`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showAlert('✅ Property marked as sold successfully!', 'success');
            loadPendingProperties();
            loadStats();
            loadSoldProperties();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to mark property as sold');
        }
    } catch (error) {
        console.error('❌ Error marking property as sold:', error);
        showAlert(`❌ Failed to mark property as sold: ${error.message}`, 'error');
    }
}

// Make user admin
async function makeAdmin(userId) {
    if (!confirm('Are you sure you want to make this user an administrator?\n\nThis will give them full access to the admin panel.')) {
        return;
    }

    try {
        console.log(`👑 Making user admin: ${userId}`);
        
        const response = await fetch(`${Admin_API_BASE}/admin/users/${userId}/make-admin`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showAlert('✅ User promoted to administrator!', 'success');
            loadUsers();
            loadStats();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to make user admin');
        }
    } catch (error) {
        console.error('❌ Error making user admin:', error);
        showAlert(`❌ Failed to make user admin: ${error.message}`, 'error');
    }
}

// Contact buyer
function contactBuyer(email, phone) {
    const contactInfo = [];
    if (email) contactInfo.push(`Email: ${email}`);
    if (phone) contactInfo.push(`Phone: ${phone}`);
    
    const message = contactInfo.length > 0 
        ? `Contact information:\n${contactInfo.join('\n')}`
        : 'No contact information available';
    
    alert(`📞 Buyer Contact Information:\n\n${message}`);
}

// Update interest status
async function updateInterestStatus(interestId, status) {
    try {
        console.log(`📝 Updating interest status: ${interestId} to ${status}`);
        
        const response = await fetch(`${Admin_API_BASE}/admin/interests/${interestId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            showAlert(`✅ Interest status updated to ${status}!`, 'success');
            loadInterests();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update interest status');
        }
    } catch (error) {
        console.error('❌ Error updating interest status:', error);
        showAlert(`❌ Failed to update interest status: ${error.message}`, 'error');
    }
}

// View property details
function viewPropertyDetails(propertyId) {
    sessionStorage.setItem('currentProperty', JSON.stringify({ _id: propertyId }));
    window.open(`/property-details.html?id=${propertyId}`, '_blank');
}

// Logout function for admin
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = '/';
    }
}

// Alert function for admin panel
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${message}
        </div>
    `;
    alert.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        color: white;
        z-index: 3000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        box-shadow: var(--shadow);
        font-weight: 500;
    `;
    
    if (type === 'success') alert.style.background = 'var(--primary)';
    else if (type === 'error') alert.style.background = '#dc3545';
    else alert.style.background = '#17a2b8';

    document.body.appendChild(alert);

    setTimeout(() => {
        alert.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            alert.remove();
        }, 300);
    }, 5000);
}

function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <div class="loading" style="width: 40px; height: 40px; border-width: 4px; margin: 0 auto 1rem; border-top-color: var(--primary);"></div>
                <p>Loading data...</p>
            </div>
        `;
    }
}