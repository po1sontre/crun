let accounts = [];
let isLoading = true;

async function loadAccounts() {
    try {
        const response = await fetch('accounts.json');
        const data = await response.json();
        accounts = data;
        isLoading = false;
        filterAccounts();
        updateAccountCount(accounts.accounts.length);
        document.querySelector('.container').style.opacity = '1';
    } catch (error) {
        console.error('Error loading accounts:', error);
        document.getElementById('accountsGrid').innerHTML = `
            <div class="error-message">
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
        <div class="account-card" style="animation-delay: ${index * 0.1}s">
            <div class="account-details">
                <div class="account-email">${account.email}</div>
                <div class="account-password">${account.password}</div>
            </div>
            <div class="account-footer">
                <span class="status-badge status-${account.status}">
                    ${account.status}
                </span>
                <button class="copy-btn" onclick="copyAccount('${account.email}', '${account.password}')">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

async function copyAccount(email, password) {
    try {
        const copyBtn = event.currentTarget;
        const icon = copyBtn.querySelector('i');
        const text = `${email}:${password}`;
        
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                textArea.remove();
            } catch (err) {
                console.error('Fallback copy failed:', err);
                textArea.remove();
                return;
            }
        }
        
        icon.className = 'fas fa-check';
        copyBtn.style.background = 'rgba(72, 187, 120, 0.2)';
        copyBtn.style.borderColor = 'rgba(72, 187, 120, 0.3)';
        showToast();
        
        setTimeout(() => {
            icon.className = 'fas fa-copy';
            copyBtn.style.background = '';
            copyBtn.style.borderColor = '';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
}

function downloadNewAccounts() {
    if (!accounts.accounts || accounts.accounts.length === 0) return;
    
    const newAccounts = accounts.accounts
        .filter(account => account.status === 'new')
        .map(account => `${account.email}:${account.password}`)
        .join('\n');
    
    if (!newAccounts) {
        const toast = document.getElementById('toast');
        toast.innerHTML = '<i class="fas fa-exclamation-circle"></i><span>No new accounts found!</span>';
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.innerHTML = '<i class="fas fa-check-circle"></i><span>Copied to clipboard!</span>';
            }, 300);
        }, 2000);
        return;
    }
    
    const blob = new Blob([newAccounts], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `new_accounts_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    const toast = document.getElementById('toast');
    toast.innerHTML = '<i class="fas fa-check-circle"></i><span>Downloaded new accounts!</span>';
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.innerHTML = '<i class="fas fa-check-circle"></i><span>Copied to clipboard!</span>';
        }, 300);
    }, 2000);
}

document.getElementById('downloadNew').addEventListener('click', downloadNewAccounts);

window.addEventListener('load', () => {
    document.querySelector('.logo').style.opacity = '1';
});

document.getElementById('statusFilter').addEventListener('change', filterAccounts);

document.querySelector('.container').style.opacity = '0';
loadAccounts();