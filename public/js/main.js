// API Base URL
const API_BASE = '/api';

// Authentication token management
let Main_authToken = localStorage.getItem('authToken');
let Main_currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// DOM Elements
const navAuth = document.getElementById('navAuth');
const navUser = document.getElementById('navUser');
const userName = document.getElementById('userName');
const userRole = document.getElementById('userRole');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  updateAuthUI();
  loadProperties();
  
  // Event listeners for modals
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });
});

// Authentication functions
async function register(userData) {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    
    if (response.ok) {
      Main_authToken = data.token;
      Main_currentUser = data.user;
      localStorage.setItem('authToken', Main_authToken);
      localStorage.setItem('currentUser', JSON.stringify(Main_currentUser));
      updateAuthUI();
      showAlert('Registration successful!', 'success');
      window.location.href = '/dashboard';
    } else {
      showAlert(data.message, 'error');
    }
  } catch (error) {
    showAlert('Registration failed. Please try again.', 'error');
  }
}

async function login(credentials) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    
    if (response.ok) {
      Main_authToken = data.token;
      Main_currentUser = data.user;
      localStorage.setItem('authToken', Main_authToken);
      localStorage.setItem('currentUser', JSON.stringify(Main_currentUser));
      updateAuthUI();
      showAlert('Login successful!', 'success');
      
      // Redirect based on verification status
      if (Main_currentUser.isVerified) {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } else {
      showAlert(data.message, 'error');
    }
  } catch (error) {
    showAlert('Login failed. Please try again.', 'error');
  }
}

function logout() {
  Main_authToken = null;
  Main_currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  updateAuthUI();
  showAlert('Logged out successfully', 'success');
  window.location.href = '/';
}

function updateAuthUI() {
  if (Main_currentUser && Main_authToken) {
    if (navAuth) navAuth.style.display = 'none';
    if (navUser) navUser.style.display = 'flex';
    if (userName) userName.textContent = Main_currentUser.name;
    if (userRole) {
      userRole.textContent = Main_currentUser.isVerified ? 'Administrator' : 'User';
    }
  } else {
    if (navAuth) navAuth.style.display = 'flex';
    if (navUser) navUser.style.display = 'none';
  }
}

// Property functions
async function loadProperties() {
  try {
    const response = await fetch(`${API_BASE}/properties`);
    const properties = await response.json();
    
    if (response.ok) {
      displayProperties(properties);
    }
  } catch (error) {
    console.error('Error loading properties:', error);
  }
}

function displayProperties(properties) {
  const grid = document.getElementById('propertiesGrid');
  if (!grid) return;

  grid.innerHTML = properties.map(property => `
    <div class="property-card">
      <div class="property-image">
        <img src="/images/${property.images && property.images[0] ? property.images[0] : 'property-placeholder.jpg'}" alt="${property.title}">
      </div>
      <div class="property-info">
        <div class="property-price">₹${property.price.toLocaleString()}</div>
        <h3 class="property-title">${property.title}</h3>
        <div class="property-location">
          <i class="fas fa-map-marker-alt"></i>
          ${property.location}
        </div>
        <div class="property-meta">
          <span><i class="fas fa-expand-arrows-alt"></i> ${property.area} sq.ft</span>
          <span><i class="fas fa-bed"></i> ${property.bedrooms} Beds</span>
          <span><i class="fas fa-bath"></i> ${property.bathrooms} Baths</span>
        </div>
        <div class="interest-info">
          <span><i class="fas fa-clock"></i> Just now</span>
          <span><i class="fas fa-heart"></i> ${property.interestCount} interests</span>
        </div>
        <button class="btn btn-primary" onclick="viewProperty('${property._id}')" style="width: 100%; margin-top: 1rem;">
          View Details
        </button>
      </div>
    </div>
  `).join('');
}

async function viewProperty(propertyId) {
  try {
    const response = await fetch(`${API_BASE}/properties/${propertyId}`);
    const property = await response.json();
    
    if (response.ok) {
      sessionStorage.setItem('currentProperty', JSON.stringify(property));
      window.location.href = `/property-details.html?id=${propertyId}`;
    }
  } catch (error) {
    console.error('Error loading property:', error);
  }
}

async function submitProperty(formData) {
  if (!Main_currentUser) {
    showAlert('Please login to list a property', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/properties`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Main_authToken}`
      },
      body: formData
    });

    const data = await response.json();
    
    if (response.ok) {
      showAlert('Property submitted successfully! Waiting for admin approval.', 'success');
      closeModal('propertyModal');
    } else {
      showAlert(data.message, 'error');
    }
  } catch (error) {
    console.error('Property submission error:', error);
    showAlert('Failed to submit property. Please try again.', 'error');
  }
}

// Modal functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Utility functions
function showAlert(message, type = 'info') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  alert.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    padding: 1rem 2rem;
    border-radius: 5px;
    color: white;
    z-index: 3000;
    background: ${type === 'success' ? 'var(--primary)' : type === 'error' ? '#dc3545' : '#17a2b8'};
  `;

  document.body.appendChild(alert);

  setTimeout(() => {
    alert.remove();
  }, 5000);
}

// Form handling
document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const propertyForm = document.getElementById('propertyForm');

  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
        address: formData.get('address')
      };
      register(userData);
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      const credentials = {
        email: formData.get('email'),
        password: formData.get('password')
      };
      login(credentials);
    });
  }

  if (propertyForm) {
    propertyForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      submitProperty(formData);
    });
  }
});