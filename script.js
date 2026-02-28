document.addEventListener('DOMContentLoaded', () => {
    // Selectors
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const goToReg = document.getElementById('go-to-register');
    const finalTotalDisplay = document.getElementById('final-total');
    const addDateBtn = document.getElementById('add-date-btn');
    const cardsWrapper = document.getElementById('cards-wrapper');

    // 1. Auth Toggle Logic
    function showLogin() {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginTab.classList.add('tab-active');
        registerTab.classList.remove('tab-active');
        document.getElementById('footer-text').innerHTML = `Don't have an account? <a href="#" id="go-to-register">Register now</a>`;
        attachToggleLink();
    }

    function showRegister() {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        registerTab.classList.add('tab-active');
        loginTab.classList.remove('tab-active');
        document.getElementById('footer-text').innerHTML = `Already have an account? <a href="#" id="go-to-login">Sign in</a>`;
        attachToggleLink();
    }

    function attachToggleLink() {
        const regLink = document.getElementById('go-to-register');
        const logLink = document.getElementById('go-to-login');
        if (regLink) regLink.onclick = (e) => { e.preventDefault(); showRegister(); };
        if (logLink) logLink.onclick = (e) => { e.preventDefault(); showLogin(); };
    }

    loginTab.onclick = showLogin;
    registerTab.onclick = showRegister;
    attachToggleLink();

   

   

    // 3. Calculation
    function calculateTotals() {
        let grandTotal = 0;
        document.querySelectorAll('.conveyance-card').forEach(card => {
            let cardTotal = 0;
            card.querySelectorAll('.entry-row').forEach(row => {
                let rowSum = 0;
                row.querySelectorAll('.calc-total').forEach(input => {
                    rowSum += parseFloat(input.value) || 0;
                });
                row.querySelector('.row-total').textContent = rowSum;
                cardTotal += rowSum;
            });
            grandTotal += cardTotal;
        });
        finalTotalDisplay.textContent = grandTotal;
    }

    // 4. Global Input Event for Live Calculation
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('calc-total')) calculateTotals();
    });

    // 5. Update UI Numbers
    function updateNumbers() {
        document.querySelectorAll('.conveyance-card').forEach((card, cIdx) => {
            card.querySelector('.circle-num').textContent = cIdx + 1;
            card.querySelectorAll('.entry-row').forEach((row, rIdx) => {
                row.querySelector('.row-num').textContent = rIdx + 1;
            });
        });
    }

    // 6. Action Events (Delete/Add Row)
    function setupCardEvents(card) {
        // Add Row
        card.querySelector('.add-row-btn').onclick = () => {
            const list = card.querySelector('.entries-list');
            const newRow = list.querySelector('.entry-row').cloneNode(true);
            newRow.querySelectorAll('input').forEach(i => i.value = '');
            newRow.querySelector('.row-total').textContent = '0';
            list.appendChild(newRow);
            setupRowEvents(newRow);
            updateNumbers();
            calculateTotals();
        };

        // Delete Card
        card.querySelector('.delete-card').onclick = () => {
            if (document.querySelectorAll('.conveyance-card').length > 1) {
                if(confirm("Remove this date?")) {
                    card.remove();
                    updateNumbers();
                    calculateTotals();
                }
            } else {
                alert("At least one date required.");
            }
        };
    }

    function setupRowEvents(row) {
        row.querySelector('.delete-row').onclick = () => {
            const card = row.closest('.conveyance-card');
            if (card.querySelectorAll('.entry-row').length > 1) {
                row.remove();
                updateNumbers();
                calculateTotals();
            } else {
                alert("At least one row required.");
            }
        };
    }

    // 7. Add Another Date
    addDateBtn.addEventListener('click', () => {
        const firstCard = document.querySelector('.conveyance-card');
        const newCard = firstCard.cloneNode(true);
        
        // Reset Card State
        const list = newCard.querySelector('.entries-list');
        const freshRow = list.querySelector('.entry-row').cloneNode(true);
        list.innerHTML = '';
        freshRow.querySelectorAll('input').forEach(i => i.value = '');
        freshRow.querySelector('.row-total').textContent = '0';
        list.appendChild(freshRow);
        
        cardsWrapper.appendChild(newCard);
        setupCardEvents(newCard);
        setupRowEvents(freshRow);
        updateNumbers();
        calculateTotals();
    });

    // 8. Initial Setup
    document.querySelectorAll('.conveyance-card').forEach(setupCardEvents);
    document.querySelectorAll('.entry-row').forEach(setupRowEvents);

    // Password Toggle
    document.getElementById('togglePassword').onclick = function() {
        const passInput = document.getElementById('password');
        passInput.type = passInput.type === 'password' ? 'text' : 'password';
        this.classList.toggle('fa-eye-slash');
    };

    // Logout
    document.getElementById('logout-btn').onclick = () => location.reload();
});


// google sheet a data save 

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwMsksIqVUkqxuC4ejwOyUTN_y1rusL9Hpa8YNoKSDijBS2wFVU_lYLvLEqqfMumGpGMg/exec";
let loggedInUser = localStorage.getItem('userName') || "";

// Page Load hole jodi agey theke login thake
if(loggedInUser) {
    showDashboard(loggedInUser);
}

function showDashboard(name) {
    loggedInUser = name;
    localStorage.setItem('userName', name);
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('dashboard-view').classList.remove('hidden');
    document.querySelector('.header-user h2').textContent = `Welcome, ${name}`;
}

// --- Login Handle ---
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = e.target.querySelector('button');
    
    btn.innerHTML = "Logging in...";
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify({ action: "login", email, password })
        });
        const result = await response.json();
        
        if (result.status === "success") {
            showDashboard(result.name);
        } else {
            alert("Wrong Email or Password!");
        }
    } catch (err) {
        alert("Login failed. Try again.");
    } finally {
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
    }
});

// --- Register Handle ---
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const btn = e.target.querySelector('button');

    btn.innerHTML = "Creating Account...";

    const response = await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "register", userName: name, email, password })
    });
    
    const result = await response.text();
    alert(result);
    if(result === "Registration Successful") {
        location.reload(); // Login page-e niye jabe
    }
    btn.innerHTML = "Create Account";
});

// --- Save to Sheet Handle (Updated & Full) ---
// --- Save to Sheet Handle (With Validation) ---
document.querySelector('.save-sheet-btn').onclick = async () => {
    if(!loggedInUser) return alert("Please login first!");

    const allEntries = [];
    let isValid = true; // Validation check korar jonno flag
    
    const cards = document.querySelectorAll('.conveyance-card');
    
    // shob card theke data collect ebong validation kora
    for (let card of cards) {
        const dateValue = card.querySelector('.date-text').value;
        const rows = card.querySelectorAll('.entry-row');
        
        for (let row of rows) {
            // Input field gulo select kora
            const from = row.querySelector('input[placeholder="Starting point"]').value.trim();
            const to = row.querySelector('input[placeholder="Destination"]').value.trim();
            const transport = row.querySelector('input[placeholder="e.g., Bus, Train"]').value.trim();
            const amount = row.querySelector('.amount').value.trim();
            const purpose = row.querySelector('input[placeholder="Purpose of travel"]').value.trim();
            const food = row.querySelector('.food').value || 0;
            const hotel = row.querySelector('.hotel').value || 0;
            const rowTotal = row.querySelector('.row-total').textContent;

            // empty field check kora (Food ebong Hotel optional rakhlam)
            if (!from || !to || !transport || !amount || !purpose) {
                isValid = false;
                break; // Ekti empty field pailei loop bhenge jabe
            }

            allEntries.push({
                date: dateValue,
                from: from,
                to: to,
                transport: transport,
                amount: amount,
                purpose: purpose,
                food: food,
                hotel: hotel,
                total: rowTotal
            });
        }
        if (!isValid) break;
    }

    // Jodi validation fail kore
    if (!isValid) {
        alert("❌ Error: Please fill all required fields (From, To, Transport, Amount, and Purpose) in every row!");
        return; // Data pathano bondho kore dibe
    }

    // Jodi kono card-i na thake
    if (allEntries.length === 0) {
        alert("No entries found to save!");
        return;
    }

    // --- Save Logic (Ager motoi) ---
    const btn = document.querySelector('.save-sheet-btn');
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    btn.disabled = true;

    try {
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "save",
                userName: loggedInUser,
                entries: allEntries
            })
        });

        const result = await response.text();
        if (result === "Data Saved!") {
            alert("✅ Success! Data saved to your sheet.");
        } else {
            alert("Error: " + result);
        }
    } catch (error) {
        alert("Failed to connect to Google Sheets.");
    } finally {
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
};

// Logout function
function handleLogout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.clear(); // Shob login data muche felbe
        location.reload();    // Page refresh korbe jate login view phire ashe
    }
}

// Global Event Listener (Eti confirm kaj korbe-i)
document.addEventListener('click', (e) => {
    if (e.target.id === 'logout-btn' || e.target.closest('#logout-btn')) {
        handleLogout();
    }
});