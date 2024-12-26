let accounts = [];
let isLoading = true;

async function loadAccounts() {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`accounts.json?t=${timestamp}`);
        const data = await response.json();
        accounts = data;
        isLoading = false;
        filterAccounts();
        updateAccountCount(accounts.accounts.length);
        document.querySelector('.container').style.opacity = '1';
    } catch (error) {
        console.error('Error loading accounts:', error);
        document.getElementById('accountsGrid').innerHTML = `
            <div class="error-message" style="text-align: center; color: #f47521; padding: 2rem;">
                Failed to load accounts. Please try again later.
            </div>
        `;
    }
}


function updateAccountCount(count) {
    const countElement = document.getElementById('accountCount');
    countElement.textContent = `${count} account${count !== 1 ? 's' : ''}`;
    countElement.style.opacity = '0';
    setTimeout(() => {
        countElement.style.opacity = '1';
    }, 100);
}

function filterAccounts() {
    if (isLoading) return;
    
    const status = document.getElementById('statusFilter').value;
    const filtered = accounts.accounts.filter(account => 
        status === 'all' || account.status === status
    );
    
    const grid = document.getElementById('accountsGrid');
    grid.style.opacity = '0';
    
    setTimeout(() => {
        displayAccounts(filtered);
        updateAccountCount(filtered.length);
        grid.style.opacity = '1';
    }, 300);
}

function displayAccounts(accountsToShow) {
    const grid = document.getElementById('accountsGrid');
    grid.innerHTML = accountsToShow.map((account, index) => `
        <div class="account-card" 
             data-email="${account.email}"
             data-password="${account.password}"
             style="animation-delay: ${index * 0.1}s"
             role="button"
             tabindex="0">
            <div class="account-details">
                <div class="account-email">${account.email}</div>
                <div class="account-password">${account.password}</div>
            </div>
            <div class="account-footer">
                <span class="status-badge status-${account.status}">
                    ${account.status}
                </span>
            </div>
        </div>
    `).join('');

    // Add click and keyboard listeners
    const cards = document.querySelectorAll('.account-card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            copyAccount(this);
        });
        
        card.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                copyAccount(this);
            }
        });
    });
}

async function copyAccount(card) {
    try {
        const email = card.dataset.email;
        const password = card.dataset.password;
        const text = `${email}:${password}`;
        await navigator.clipboard.writeText(text);
        
        const originalBackground = card.style.background;
        card.style.background = 'rgba(244, 117, 33, 0.2)';
        
        const toast = document.getElementById('toast');
        toast.innerHTML = '<i class="fas fa-check-circle"></i><span>Account copied to clipboard!</span>';
        toast.classList.add('show');
        
        if (window.navigator.vibrate) {
            window.navigator.vibrate(100);
        }

        setTimeout(() => {
            card.style.background = originalBackground;
            toast.classList.remove('show');
        }, 2000);

    } catch (err) {
        console.error('Failed to copy:', err);
        showErrorToast('Failed to copy account details');
    }
}

function showErrorToast(message) {
    const toast = document.getElementById('toast');
    toast.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${message}</span>`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function downloadNewAccounts() {
    if (!accounts.accounts || accounts.accounts.length === 0) {
        showErrorToast('No accounts available');
        return;
    }
    
    const newAccounts = accounts.accounts
        .filter(account => account.status === 'new')
        .map(account => `${account.email}:${account.password}`)
        .join('\n');
    
    if (!newAccounts) {
        showErrorToast('No new accounts found!');
        return;
    }
    
    const blob = new Blob([newAccounts], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crunchyroll_accounts_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    const toast = document.getElementById('toast');
    toast.innerHTML = '<i class="fas fa-check-circle"></i><span>Accounts downloaded successfully!</span>';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

document.getElementById('downloadNew').addEventListener('click', downloadNewAccounts);
document.getElementById('statusFilter').addEventListener('change', filterAccounts);
window.addEventListener('load', () => {
    document.querySelector('.logo').style.opacity = '1';
    loadAccounts();
});

document.querySelector('.container').style.opacity = '0';