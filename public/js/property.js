document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get('id');
  const container = document.getElementById('propertyDetails');
  const authToken = localStorage.getItem('authToken');

  container.innerHTML = `<p>Loading property information...</p>`;

  try {
    const response = await fetch(`/api/properties/${propertyId}`);
    if (!response.ok) throw new Error('Failed to fetch property');

    const property = await response.json();

    // Determine if the current user is the owner
    let isOwner = false;
    let tokenUserId = null;

    if (authToken) {
      const payload = JSON.parse(atob(authToken.split('.')[1]));
      tokenUserId = payload.id;
      isOwner = tokenUserId === property.seller._id;
    }

    // Build buttons HTML
    let buttonsHtml = `<button id="interestBtn" class="btn btn-primary" style="margin-top: 1rem;">
      Show Interest
    </button>`;

    // Show "Mark as Sold" only if owner and property is approved
    if (isOwner && property.status === 'approved') {
      buttonsHtml += `<button id="markSoldBtn" class="btn btn-success" style="margin-top: 1rem; margin-left: 1rem;">
        Mark as Sold
      </button>`;
    }

    container.innerHTML = `
      <h1>${property.title}</h1>

      <div class="property-price" style="font-size: 2rem; color: #2E8B57; margin: 1rem 0;">
        ₹${property.price.toLocaleString()}
      </div>

      <div style="display: flex; gap: 2rem; margin: 2rem 0;">
        <div><i class="fas fa-map-marker-alt"></i> ${property.location}</div>
        <div><i class="fas fa-expand-arrows-alt"></i> ${property.area} sq.ft</div>
      </div>

      <p>${property.description}</p>

      <div>${buttonsHtml}</div>
    `;

    // Show Interest button handler
    const interestBtn = document.getElementById('interestBtn');
    interestBtn.addEventListener('click', () => showInterest(propertyId, interestBtn));

    // Mark as Sold button handler
    if (isOwner && property.status === 'approved') {
      const markSoldBtn = document.getElementById('markSoldBtn');
      markSoldBtn.addEventListener('click', async () => {
        markSoldBtn.disabled = true;
        markSoldBtn.textContent = 'Processing... ⏳';

        try {
          const res = await fetch(`/api/properties/${propertyId}/mark-sold`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          const data = await res.json();

          if (res.ok) {
            alert('✅ Property marked as sold!');
            markSoldBtn.textContent = 'Sold ✅';
            // Optionally, disable interest button
            if (interestBtn) interestBtn.disabled = true;
          } else {
            alert(`❌ ${data.message || 'Failed to mark as sold'}`);
            markSoldBtn.disabled = false;
            markSoldBtn.textContent = 'Mark as Sold';
          }
        } catch (error) {
          console.error('Error marking as sold:', error);
          alert('❌ Something went wrong.');
          markSoldBtn.disabled = false;
          markSoldBtn.textContent = 'Mark as Sold';
        }
      });
    }

  } catch (error) {
    console.error('Error loading property:', error);
    container.innerHTML = `<p>❌ Error loading property details. <a href="/">Go back to home</a></p>`;
  }
});

// Show interest function (no changes)
async function showInterest(propertyId, btn) {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    alert('⚠️ Please log in to show interest.');
    window.location.href = '/login';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Processing... ⏳';

  try {
    const response = await fetch(`/api/properties/${propertyId}/interest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'I am interested in this property.' })
    });

    const data = await response.json();

    if (response.ok) {
      alert('✅ Interest recorded!');
      btn.textContent = 'Interest Shown ✅';
    } else {
      alert(`❌ ${data.message || 'Failed to show interest'}`);
      btn.disabled = false;
      btn.textContent = 'Show Interest';
    }
  } catch (error) {
    console.error('Error showing interest:', error);
    alert('❌ Something went wrong.');
    btn.disabled = false;
    btn.textContent = 'Show Interest';
  }
}
