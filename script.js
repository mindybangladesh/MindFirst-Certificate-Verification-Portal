// script.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const participantIdInput = document.getElementById('participantId');
    const verifyBtn = document.getElementById('verifyBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const resultsSection = document.getElementById('resultsSection');
    const participantInfo = document.getElementById('participantInfo');
    const emptyState = document.getElementById('emptyState');
    const verificationBadge = document.getElementById('verificationBadge');
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const toast = document.getElementById('toast');
    const currentYearSpan = document.getElementById('currentYear');
    
    // Store loaded participants data
    let participantsData = [];
    
    // Set current year in footer
    currentYearSpan.textContent = new Date().getFullYear();
    
    // Theme toggle functionality
    themeToggle.addEventListener('click', function() {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        
        if (isDark) {
            document.body.removeAttribute('data-theme');
            themeIcon.className = 'fas fa-sun';
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeIcon.className = 'fas fa-moon';
        }
    });
    
    // Load JSON data on page load
    loadParticipantsData();
    
    // Input validation - only allow numbers
    participantIdInput.addEventListener('input', function() {
        // Remove any non-numeric characters
        this.value = this.value.replace(/\D/g, '');
        
        // Limit to 4 characters
        if (this.value.length > 4) {
            this.value = this.value.slice(0, 4);
        }
    });
    
    // Allow Enter key to trigger verification
    participantIdInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyParticipant();
        }
    });
    
    // Verify button click handler
    verifyBtn.addEventListener('click', verifyParticipant);
    
    // Function to load participants data from JSON file
    async function loadParticipantsData() {
        try {
            loadingSpinner.style.display = 'flex';
            loadingSpinner.querySelector('p').textContent = 'Loading verification database...';
            
            // Fetch the JSON data file
            const response = await fetch('data.json');
            
            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.status}`);
            }
            
            participantsData = await response.json();
            
            console.log(`Loaded ${participantsData.length} participant records from database`);
            
        } catch (error) {
            console.error('Error loading participants data:', error);
            showError('Failed to load verification database. Please refresh the page.');
        } finally {
            loadingSpinner.style.display = 'none';
            loadingSpinner.querySelector('p').textContent = 'Verifying participant ID...';
        }
    }
    
    // Function to verify participant
    function verifyParticipant() {
        const participantId = participantIdInput.value.trim();
        
        // Validate input
        if (!participantId) {
            showError('Please enter a participant ID (last 4 digits)');
            participantIdInput.focus();
            return;
        }
        
        if (participantId.length !== 4) {
            showError('Participant ID must be exactly 4 digits');
            participantIdInput.focus();
            return;
        }
        
        // Check if input is numeric
        if (!/^\d{4}$/.test(participantId)) {
            showError('Participant ID must contain only numbers');
            participantIdInput.focus();
            return;
        }
        
        // Check if data is loaded
        if (participantsData.length === 0) {
            showError('Database not loaded yet. Please wait or refresh the page.');
            return;
        }
        
        // Show loading spinner
        loadingSpinner.style.display = 'flex';
        resultsSection.style.display = 'none';
        emptyState.style.display = 'none';
        
        // Search for participant
        setTimeout(() => {
            // Construct full ID
            const fullId = `MindFirst-PID-${participantId.padStart(4, '0')}`;
            
            // Search in participants data
            const participantData = participantsData.find(participant => 
                participant['Participant ID'] === fullId
            );
            
            // Hide loading spinner
            loadingSpinner.style.display = 'none';
            
            if (participantData) {
                // Display results
                displayParticipantInfo(participantData);
                resultsSection.style.display = 'block';
                emptyState.style.display = 'none';
                
                // Show success toast
                showToast('Certificate verified successfully!');
                
                // Add visual effect to badge
                verificationBadge.style.animation = 'none';
                setTimeout(() => {
                    verificationBadge.style.animation = 'fadeIn 0.5s ease forwards';
                }, 10);
            } else {
                // Participant not found - show error state
                showNotFoundError(participantId);
            }
        }, 800);
    }
    
    // Function to show "not found" error with custom UI
    function showNotFoundError(participantId) {
        // Hide results and show empty state with error message
        resultsSection.style.display = 'none';
        emptyState.style.display = 'flex';
        
        // Customize the empty state for error
        emptyState.innerHTML = `
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Participant ID Not Found</h3>
            <p>The participant ID <strong>MindFirst-PID-${participantId.padStart(4, '0')}</strong> was not found in our database.</p>
            <div class="error-actions">
                <button class="retry-btn" id="retryBtn">
                    <i class="fas fa-redo"></i> Try Another ID
                </button>
                <a href="#" class="contact-btn" id="contactBtn">
                    <i class="fas fa-envelope"></i> Contact Support
                </a>
            </div>
            <p class="error-note">If you believe this is an error, please contact the Mindy support team.</p>
        `;
        
        // Add CSS for error state
        const style = document.createElement('style');
        style.textContent = `
            .error-icon {
                font-size: 4rem;
                color: var(--warning-color);
                margin-bottom: 20px;
            }
            
            .error-icon i {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            
            .error-actions {
                display: flex;
                gap: 15px;
                margin: 25px 0;
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .retry-btn, .contact-btn {
                padding: 12px 24px;
                border-radius: var(--radius-small);
                font-weight: 600;
                font-family: 'Poppins', sans-serif;
                cursor: pointer;
                transition: var(--transition);
                display: flex;
                align-items: center;
                gap: 8px;
                text-decoration: none;
            }
            
            .retry-btn {
                background-color: var(--primary-color);
                color: white;
                border: none;
            }
            
            .retry-btn:hover {
                background-color: var(--primary-dark);
                transform: translateY(-2px);
            }
            
            .contact-btn {
                background-color: transparent;
                color: var(--primary-color);
                border: 2px solid var(--primary-color);
            }
            
            .contact-btn:hover {
                background-color: rgba(140, 82, 255, 0.1);
                transform: translateY(-2px);
            }
            
            .error-note {
                font-size: 0.9rem;
                color: var(--text-light);
                margin-top: 15px;
                max-width: 400px;
            }
            
            .empty-state h3 {
                color: var(--warning-color);
            }
        `;
        
        // Remove any existing error styles
        const existingStyle = document.getElementById('error-styles');
        if (existingStyle) existingStyle.remove();
        
        style.id = 'error-styles';
        document.head.appendChild(style);
        
        // Add event listeners to buttons
        setTimeout(() => {
            const retryBtn = document.getElementById('retryBtn');
            const contactBtn = document.getElementById('contactBtn');
            
            if (retryBtn) {
                retryBtn.addEventListener('click', function() {
                    // Clear input and focus
                    participantIdInput.value = '';
                    participantIdInput.focus();
                    
                    // Reset to default empty state
                    resetEmptyState();
                });
            }
            
            if (contactBtn) {
                contactBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    showToast('Please contact: support@mindy.com');
                });
            }
        }, 100);
    }
    
    // Function to reset empty state to default
    function resetEmptyState() {
        emptyState.innerHTML = `
            <div class="empty-icon">
                <i class="fas fa-id-card"></i>
            </div>
            <h3>No Verification Yet</h3>
            <p>Enter a participant ID above to verify certificate authenticity</p>
        `;
        
        // Remove error styles
        const errorStyle = document.getElementById('error-styles');
        if (errorStyle) errorStyle.remove();
    }
    
    // Function to display participant information - ONLY SHOW ACTUAL DATA FROM JSON
    function displayParticipantInfo(data) {
        // Show ONLY the fields that exist in your JSON data
        const fields = [
            { label: "Participant ID", value: data['Participant ID'] },
            { label: "Name", value: data['Name'] },
            { label: "Region", value: data['Region'] },
            { label: "Institute/Organization", value: data['Institute/ Organization'] },
            { label: "Implementation Partner", value: data['Implementation Partner'] },
            { label: "Venue", value: data['Venue'] }
        ];
        
        let html = '';
        
        fields.forEach(field => {
            html += `
                <div class="info-row">
                    <div class="info-label">${field.label}:</div>
                    <div class="info-value">${field.value}</div>
                </div>
            `;
        });
        
        // Add verification timestamp
        html += `
            <div class="info-row">
                <div class="info-label">Verified On:</div>
                <div class="info-value">${new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</div>
            </div>
        `;
        
        participantInfo.innerHTML = html;
    }
    
    // Function to show toast notification
    function showToast(message) {
        const toastMessage = toast.querySelector('.toast-message');
        toastMessage.textContent = message;
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Function to show error (using toast with different styling)
    function showError(message) {
        const toastMessage = toast.querySelector('.toast-message');
        const toastIcon = toast.querySelector('i');
        
        toastMessage.textContent = message;
        toastIcon.className = 'fas fa-exclamation-circle';
        toast.style.borderLeftColor = 'var(--error-color)';
        toastIcon.style.color = 'var(--error-color)';
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            // Reset to success style
            setTimeout(() => {
                toastIcon.className = 'fas fa-check-circle';
                toast.style.borderLeftColor = 'var(--success-color)';
                toastIcon.style.color = 'var(--success-color)';
            }, 300);
        }, 3000);
    }
    
    // Initialize the page
    function init() {
        // Focus on the input field when page loads
        participantIdInput.focus();
        
        // Remove any sample IDs hint that might exist
        const inputHint = document.querySelector('.input-hint');
        inputHint.innerHTML = 'Enter only the last 4 digits of the participant ID';
        
        // Remove any sample IDs container if exists
        const sampleIdsContainer = document.querySelector('.sample-ids');
        if (sampleIdsContainer) {
            sampleIdsContainer.remove();
        }
    }
    
    // Start the application
    init();
});
