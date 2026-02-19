// Mercado Pago Integration
// Handles PIX and Credit Card payments

class MercadoPagoIntegration {
    constructor() {
        this.publicKey = null;
        this.mp = null;
        this.currentPayment = null;
        this.pollingInterval = null;
        
        this.initialize();
    }

    async initialize() {
        try {
            // Get public key from server
            const response = await window.API.request('/payment/config');
            this.publicKey = response.publicKey;

            // Initialize Mercado Pago SDK
            if (window.MercadoPago && this.publicKey) {
                this.mp = new MercadoPago(this.publicKey);
                console.log('Mercado Pago initialized successfully');
            } else {
                console.warn('Mercado Pago SDK not loaded or public key missing');
            }
        } catch (error) {
            console.error('Failed to initialize Mercado Pago:', error);
        }

        this.setupUI();
    }

    setupUI() {
        // Setup amount buttons
        const amountButtons = document.querySelectorAll('.amount-btn');
        amountButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                amountButtons.forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                
                const amount = parseFloat(e.target.dataset.amount);
                this.updatePaymentAmount(amount);
            });
        });

        // Setup custom amount input
        const customAmountInput = document.getElementById('customAmount');
        if (customAmountInput) {
            customAmountInput.addEventListener('input', (e) => {
                const amount = parseFloat(e.target.value) || 0;
                if (amount >= 20) {
                    amountButtons.forEach(b => b.classList.remove('selected'));
                    this.updatePaymentAmount(amount);
                }
            });
        }

        // Setup payment method buttons
        const pixBtn = document.getElementById('btnPayPix');
        const cardBtn = document.getElementById('btnPayCard');

        if (pixBtn) {
            pixBtn.addEventListener('click', () => this.initiatePIXPayment());
        }

        if (cardBtn) {
            cardBtn.addEventListener('click', () => this.showCardForm());
        }
    }

    updatePaymentAmount(amount) {
        const displayElements = document.querySelectorAll('.payment-amount');
        displayElements.forEach(el => {
            el.textContent = amount.toFixed(2).replace('.', ',');
        });

        // Update payment info
        if (!this.currentPayment) {
            this.currentPayment = {};
        }
        this.currentPayment.amount = amount;
    }

    async initiatePIXPayment() {
        const amount = this.currentPayment?.amount;
        
        if (!amount || amount < 20) {
            window.NotificationSystem.show('O valor mínimo de depósito é R$ 20,00', 'error');
            return;
        }

        try {
            // Show loading
            this.showLoading('Gerando código PIX...');

            // Create PIX payment
            const response = await window.API.request('/payment/create-pix', {
                method: 'POST',
                body: JSON.stringify({
                    amount: amount,
                    userId: window.userState.userId,
                    description: `Recarga de saldo - R$ ${amount.toFixed(2)}`
                })
            });

            this.hideLoading();

            if (response.success) {
                this.showPIXPayment(response.payment);
                this.startPaymentPolling(response.payment.id);
            } else {
                throw new Error(response.message || 'Erro ao criar pagamento PIX');
            }
        } catch (error) {
            this.hideLoading();
            window.NotificationSystem.show('Erro ao gerar código PIX. Tente novamente.', 'error');
            console.error('PIX payment error:', error);
        }
    }

    showPIXPayment(payment) {
        const container = document.getElementById('pixPaymentContainer');
        if (!container) {
            this.createPIXContainer(payment);
            return;
        }

        container.classList.remove('hidden');

        // Update QR Code
        const qrCodeImg = container.querySelector('.qr-code-image');
        if (qrCodeImg && payment.qrCodeBase64) {
            qrCodeImg.src = `data:image/png;base64,${payment.qrCodeBase64}`;
        }

        // Update PIX code
        const pixCode = container.querySelector('.pix-code-text');
        if (pixCode && payment.qrCode) {
            pixCode.value = payment.qrCode;
        }

        // Setup copy button
        const copyBtn = container.querySelector('.btn-copy-pix');
        if (copyBtn) {
            copyBtn.onclick = () => this.copyPIXCode(payment.qrCode);
        }

        // Update amount
        const amountEl = container.querySelector('.pix-amount');
        if (amountEl) {
            amountEl.textContent = payment.amount.toFixed(2).replace('.', ',');
        }
    }

    createPIXContainer(payment) {
        const container = document.createElement('div');
        container.id = 'pixPaymentContainer';
        container.className = 'payment-modal';
        container.innerHTML = `
            <div class="payment-modal-content">
                <div class="payment-modal-header">
                    <h2>Pagamento PIX</h2>
                    <button class="modal-close" onclick="mercadoPago.closePIXModal()">&times;</button>
                </div>
                <div class="payment-modal-body">
                    <div class="pix-info">
                        <p>Valor: R$ <span class="pix-amount">${payment.amount.toFixed(2).replace('.', ',')}</span></p>
                        <p class="pix-status">Aguardando pagamento...</p>
                    </div>
                    <div class="qr-code-container">
                        <img class="qr-code-image" src="data:image/png;base64,${payment.qrCodeBase64 || ''}" alt="QR Code PIX">
                    </div>
                    <div class="pix-code-container">
                        <label>Código PIX Copia e Cola:</label>
                        <textarea class="pix-code-text" readonly>${payment.qrCode || ''}</textarea>
                        <button class="btn-copy-pix">COPIAR CÓDIGO</button>
                    </div>
                    <div class="pix-instructions">
                        <h3>Como pagar:</h3>
                        <ol>
                            <li>Abra o app do seu banco</li>
                            <li>Escolha pagar com PIX</li>
                            <li>Escaneie o QR Code ou cole o código</li>
                            <li>Confirme o pagamento</li>
                            <li>Seu saldo será creditado automaticamente</li>
                        </ol>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(container);

        // Add styles
        this.addPaymentModalStyles();
    }

    copyPIXCode(code) {
        // Modern Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code)
                .then(() => {
                    window.NotificationSystem.show('Código PIX copiado!', 'success');
                })
                .catch(() => {
                    // Fallback to older method
                    this.copyPIXCodeFallback();
                });
        } else {
            this.copyPIXCodeFallback();
        }
    }

    copyPIXCodeFallback() {
        const textarea = document.querySelector('.pix-code-text');
        if (textarea) {
            textarea.select();
            try {
                document.execCommand('copy');
                window.NotificationSystem.show('Código PIX copiado!', 'success');
            } catch (err) {
                window.NotificationSystem.show('Erro ao copiar código', 'error');
            }
        }
    }

    startPaymentPolling(paymentId) {
        // Clear existing interval
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }

        // Poll every 3 seconds for payment status
        this.pollingInterval = setInterval(async () => {
            try {
                const response = await window.API.request(`/payment/status/${paymentId}`);
                
                if (response.status === 'approved') {
                    this.handlePaymentApproved(response);
                } else if (response.status === 'rejected' || response.status === 'cancelled') {
                    this.handlePaymentFailed(response);
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
            }
        }, 3000);

        // Stop polling after 15 minutes
        setTimeout(() => {
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval);
                this.pollingInterval = null;
            }
        }, 15 * 60 * 1000);
    }

    handlePaymentApproved(payment) {
        // Stop polling
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }

        // Update balance
        window.userState.addBalance(payment.amount);

        // Close modal
        this.closePIXModal();

        // Show success message
        window.NotificationSystem.show(
            `Pagamento aprovado! R$ ${payment.amount.toFixed(2)} adicionado ao seu saldo.`,
            'success'
        );

        // Update UI
        const statusEl = document.querySelector('.pix-status');
        if (statusEl) {
            statusEl.textContent = 'Pagamento aprovado! ✓';
            statusEl.style.color = '#10b981';
        }
    }

    handlePaymentFailed(payment) {
        // Stop polling
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }

        window.NotificationSystem.show('Pagamento não aprovado. Tente novamente.', 'error');

        const statusEl = document.querySelector('.pix-status');
        if (statusEl) {
            statusEl.textContent = 'Pagamento não aprovado';
            statusEl.style.color = '#ef4444';
        }
    }

    closePIXModal() {
        const container = document.getElementById('pixPaymentContainer');
        if (container) {
            container.classList.add('hidden');
        }

        // Stop polling
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    showCardForm() {
        const amount = this.currentPayment?.amount;
        
        if (!amount || amount < 20) {
            window.NotificationSystem.show('O valor mínimo de depósito é R$ 20,00', 'error');
            return;
        }

        if (!this.mp) {
            window.NotificationSystem.show('Mercado Pago não está configurado. Use PIX.', 'error');
            return;
        }

        // Create card form container
        this.createCardFormContainer(amount);
    }

    createCardFormContainer(amount) {
        const container = document.createElement('div');
        container.id = 'cardPaymentContainer';
        container.className = 'payment-modal';
        container.innerHTML = `
            <div class="payment-modal-content">
                <div class="payment-modal-header">
                    <h2>Pagamento com Cartão</h2>
                    <button class="modal-close" onclick="mercadoPago.closeCardModal()">&times;</button>
                </div>
                <div class="payment-modal-body">
                    <div class="card-info">
                        <p>Valor: R$ <span class="card-amount">${amount.toFixed(2).replace('.', ',')}</span></p>
                    </div>
                    <form id="cardPaymentForm">
                        <div class="form-group">
                            <label>Número do Cartão</label>
                            <input type="text" id="cardNumber" placeholder="0000 0000 0000 0000" maxlength="19" required>
                        </div>
                        <div class="form-group">
                            <label>Nome no Cartão</label>
                            <input type="text" id="cardholderName" placeholder="Nome impresso no cartão" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Validade</label>
                                <input type="text" id="expirationDate" placeholder="MM/AA" maxlength="5" required>
                            </div>
                            <div class="form-group">
                                <label>CVV</label>
                                <input type="text" id="securityCode" placeholder="123" maxlength="4" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>CPF do Titular</label>
                            <input type="text" id="cpf" placeholder="000.000.000-00" maxlength="14" required>
                        </div>
                        <div class="form-group">
                            <label>Parcelas</label>
                            <select id="installments">
                                <option value="1">1x de R$ ${amount.toFixed(2)}</option>
                            </select>
                        </div>
                        <button type="submit" class="btn-pay-card">PAGAR R$ ${amount.toFixed(2).replace('.', ',')}</button>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(container);

        // Setup form validation and submission
        this.setupCardForm(amount);
        this.addPaymentModalStyles();
    }

    setupCardForm(amount) {
        const form = document.getElementById('cardPaymentForm');
        if (!form) return;

        // Format card number
        const cardNumber = document.getElementById('cardNumber');
        cardNumber.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formatted;
        });

        // Format expiration date
        const expDate = document.getElementById('expirationDate');
        expDate.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });

        // Format CPF
        const cpf = document.getElementById('cpf');
        cpf.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 3) value = value.slice(0, 3) + '.' + value.slice(3);
            if (value.length > 7) value = value.slice(0, 7) + '.' + value.slice(7);
            if (value.length > 11) value = value.slice(0, 11) + '-' + value.slice(11, 13);
            e.target.value = value;
        });

        // Handle form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processCardPayment(amount);
        });
    }

    async processCardPayment(amount) {
        try {
            this.showLoading('Processando pagamento...');

            const cardData = {
                cardNumber: document.getElementById('cardNumber').value.replace(/\s/g, ''),
                cardholderName: document.getElementById('cardholderName').value,
                expirationDate: document.getElementById('expirationDate').value,
                securityCode: document.getElementById('securityCode').value,
                cpf: document.getElementById('cpf').value.replace(/\D/g, ''),
                installments: parseInt(document.getElementById('installments').value)
            };

            // Send to server for processing
            const response = await window.API.request('/payment/create-card', {
                method: 'POST',
                body: JSON.stringify({
                    amount: amount,
                    userId: window.userState.userId,
                    cardData: cardData,
                    description: `Recarga de saldo - R$ ${amount.toFixed(2)}`
                })
            });

            this.hideLoading();

            if (response.success && response.payment.status === 'approved') {
                // Update balance
                window.userState.addBalance(amount);

                // Close modal
                this.closeCardModal();

                // Show success
                window.NotificationSystem.show(
                    `Pagamento aprovado! R$ ${amount.toFixed(2)} adicionado ao seu saldo.`,
                    'success'
                );
            } else {
                throw new Error(response.message || 'Pagamento não aprovado');
            }
        } catch (error) {
            this.hideLoading();
            window.NotificationSystem.show(
                'Erro ao processar pagamento. Verifique os dados do cartão.',
                'error'
            );
            console.error('Card payment error:', error);
        }
    }

    closeCardModal() {
        const container = document.getElementById('cardPaymentContainer');
        if (container) {
            container.remove();
        }
    }

    showLoading(message = 'Processando...') {
        const loading = document.createElement('div');
        loading.id = 'paymentLoading';
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            color: white;
            font-size: 1.5rem;
        `;
        loading.textContent = message;
        document.body.appendChild(loading);
    }

    hideLoading() {
        const loading = document.getElementById('paymentLoading');
        if (loading) {
            loading.remove();
        }
    }

    addPaymentModalStyles() {
        if (document.getElementById('paymentModalStyles')) return;

        const style = document.createElement('style');
        style.id = 'paymentModalStyles';
        style.textContent = `
            .payment-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 3000;
                padding: 1rem;
            }
            .payment-modal.hidden {
                display: none;
            }
            .payment-modal-content {
                background: var(--card-bg);
                border-radius: 16px;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .payment-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            .payment-modal-body {
                padding: 2rem;
            }
            .qr-code-container {
                text-align: center;
                margin: 2rem 0;
            }
            .qr-code-image {
                max-width: 300px;
                width: 100%;
                height: auto;
                border: 4px solid var(--primary);
                border-radius: 12px;
                padding: 1rem;
                background: white;
            }
            .pix-code-container {
                margin: 2rem 0;
            }
            .pix-code-text {
                width: 100%;
                padding: 1rem;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: white;
                font-family: monospace;
                font-size: 0.9rem;
                resize: none;
                height: 100px;
                margin: 0.5rem 0;
            }
            .btn-copy-pix {
                width: 100%;
                background: var(--primary);
                color: var(--bg-dark);
                border: none;
                padding: 1rem;
                border-radius: 8px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .btn-copy-pix:hover {
                background: var(--gold);
            }
            .pix-instructions ol {
                margin-left: 1.5rem;
                color: var(--text-secondary);
            }
            .pix-info {
                text-align: center;
                margin-bottom: 1rem;
            }
            .pix-status {
                color: var(--primary);
                font-weight: 600;
                margin-top: 0.5rem;
            }
            .form-group {
                margin-bottom: 1.5rem;
            }
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                color: var(--text-secondary);
                font-weight: 500;
            }
            .form-group input,
            .form-group select {
                width: 100%;
                padding: 0.75rem;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: white;
                font-size: 1rem;
            }
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
            }
            .btn-pay-card {
                width: 100%;
                background: linear-gradient(135deg, var(--primary), var(--secondary));
                color: white;
                border: none;
                padding: 1rem;
                border-radius: 8px;
                font-size: 1.1rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-top: 1rem;
            }
            .btn-pay-card:hover {
                transform: scale(1.02);
                box-shadow: 0 10px 30px rgba(0, 217, 255, 0.5);
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.deposit-page')) {
        window.mercadoPago = new MercadoPagoIntegration();
    }
});

// Export for use in other scripts
window.MercadoPagoIntegration = MercadoPagoIntegration;
