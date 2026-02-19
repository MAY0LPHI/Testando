// Payment functionality

let selectedPaymentMethod = 'pix';
let currentPaymentId = null;

async function createPayment() {
    if (!authToken) {
        showAuthModal('login');
        return;
    }
    
    const amount = parseFloat(document.getElementById('depositAmount').value);
    
    if (!amount || amount < 20) {
        alert('Valor mínimo de R$ 20,00');
        return;
    }
    
    selectedPaymentMethod = document.querySelector('.payment-method.active').dataset.method;
    
    try {
        const response = await fetch(`${API_URL}/payment/create-preference`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                amount,
                paymentMethod: selectedPaymentMethod
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentPaymentId = data.id;
            
            // Hide deposit form
            document.querySelector('.deposit-form').style.display = 'none';
            
            if (selectedPaymentMethod === 'pix') {
                showPixPayment(data);
            } else {
                showCardPayment(data);
            }
        } else {
            alert(data.error || 'Erro ao criar pagamento');
        }
    } catch (error) {
        console.error('Create payment error:', error);
        alert('Erro ao criar pagamento');
    }
}

function showPixPayment(paymentData) {
    const pixSection = document.getElementById('pixPayment');
    const qrContainer = document.getElementById('qrCodeContainer');
    const pixCodeInput = document.getElementById('pixCode');
    
    // In production, display actual QR code
    // For now, show placeholder
    qrContainer.innerHTML = `
        <div class="qr-placeholder">
            <p>QR Code PIX</p>
            <div style="width: 200px; height: 200px; background: white; margin: 20px auto; display: flex; align-items: center; justify-content: center; border-radius: 10px;">
                <i class="fas fa-qrcode" style="font-size: 150px; color: #333;"></i>
            </div>
        </div>
    `;
    
    pixCodeInput.value = paymentData.qr_code || 'PIX_CODE_AQUI_' + Math.random().toString(36).substr(2, 9);
    
    pixSection.style.display = 'block';
    
    // Start checking payment status
    checkPaymentStatus(paymentData.transaction_id);
}

function showCardPayment(paymentData) {
    const cardSection = document.getElementById('cardPayment');
    const linkContainer = document.getElementById('cardPaymentLink');
    
    // In production, this would redirect to Mercado Pago's payment page
    linkContainer.innerHTML = `
        <p>Simulando pagamento com cartão...</p>
        <button class="btn-primary" onclick="simulateCardPayment(${paymentData.transaction_id})">
            Simular Pagamento Aprovado
        </button>
        <p style="margin-top: 15px; font-size: 12px; color: var(--text-secondary);">
            Em produção, você seria redirecionado para a página de pagamento do Mercado Pago
        </p>
    `;
    
    cardSection.style.display = 'block';
}

function copyPixCode() {
    const pixCode = document.getElementById('pixCode');
    pixCode.select();
    document.execCommand('copy');
    alert('Código PIX copiado!');
}

async function checkPaymentStatus(transactionId) {
    // Poll for payment status
    const interval = setInterval(async () => {
        try {
            const response = await fetch(`${API_URL}/user/transactions`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            const transactions = await response.json();
            const transaction = transactions.find(t => t.id === transactionId);
            
            if (transaction && transaction.status === 'approved') {
                clearInterval(interval);
                paymentApproved(transaction.amount);
            }
        } catch (error) {
            console.error('Check payment status error:', error);
        }
    }, 3000); // Check every 3 seconds
    
    // Stop checking after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
}

async function simulateCardPayment(transactionId) {
    try {
        const response = await fetch(`${API_URL}/payment/approve-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ transactionId })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            paymentApproved(data.newBalance - currentUser.balance);
            currentUser.balance = data.newBalance;
            updateUserDisplay();
        } else {
            alert(data.error || 'Erro ao processar pagamento');
        }
    } catch (error) {
        console.error('Simulate payment error:', error);
        alert('Erro ao processar pagamento');
    }
}

function paymentApproved(amount) {
    alert(`Pagamento aprovado! R$ ${amount.toFixed(2)} adicionados à sua carteira.`);
    
    // Reload user profile
    loadUserProfile();
    
    // Close modal
    document.getElementById('depositModal').style.display = 'none';
    
    // Reset deposit form
    document.querySelector('.deposit-form').style.display = 'block';
    document.getElementById('pixPayment').style.display = 'none';
    document.getElementById('cardPayment').style.display = 'none';
    document.getElementById('depositAmount').value = '';
}

// Reset deposit modal when closed
document.getElementById('depositModal')?.querySelector('.close')?.addEventListener('click', () => {
    document.querySelector('.deposit-form').style.display = 'block';
    document.getElementById('pixPayment').style.display = 'none';
    document.getElementById('cardPayment').style.display = 'none';
});
