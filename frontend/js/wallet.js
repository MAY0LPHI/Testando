// Wallet functionality

async function loadWalletHistory() {
    if (!authToken) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/user/transactions`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const transactions = await response.json();
        displayTransactionHistory(transactions);
    } catch (error) {
        console.error('Load wallet history error:', error);
    }
}

function displayTransactionHistory(transactions) {
    // This could be displayed in a dedicated wallet/history section
    console.log('Transaction history:', transactions);
}

function formatCurrency(value) {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
}
