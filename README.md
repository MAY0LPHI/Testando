# 🎁 SurpriseBoxJor - Sistema de Lootbox com Mercado Pago

Clone completo e funcional do sistema de caixas surpresa (lootbox) com integração completa ao Mercado Pago para pagamentos via PIX e Cartão de Crédito.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)

## 📋 Sumário

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Endpoints](#-api-endpoints)
- [Integração Mercado Pago](#-integração-mercado-pago)
- [Segurança](#-segurança)
- [Desenvolvimento](#-desenvolvimento)
- [Produção](#-produção)
- [Troubleshooting](#-troubleshooting)
- [Licença](#-licença)

## ✨ Funcionalidades

### Sistema de Caixas (Lootbox)
- **6 tipos de caixas** com diferentes valores:
  - SKYDROP X - R$ 5,00
  - FORTUNE X - R$ 27,90
  - PRIME FORTUNE - R$ 49,99 (Melhor Escolha)
  - ULTRA FORTUNE - R$ 97,00 (Chance Dobrada)
  - SKYDROP DELUXE - R$ 197,00
  - DIAMOND EDITION - R$ 497,00

- Animação de abertura de caixas em 3D
- Sistema de probabilidades configuráveis
- Grid 3x3 mostrando prêmios possíveis
- Histórico de aberturas

### Sistema de Prêmios
- **Prêmios Físicos**: iPhones, PlayStation, Notebooks, etc.
- **Prêmios Digitais**: NFTs e créditos
- Classificação por raridade (Lendário, Épico, Raro, Comum)
- Sistema de envio gratuito

### Sistema de Álbum de Figurinhas
- **3 álbuns colecionáveis**:
  - Audio Master 1 (10 figurinhas)
  - Cinema Controller PS5 Edition (176 figurinhas)
  - PS5 PRO (1872 figurinhas)
- Progresso em tempo real
- Recompensas exclusivas ao completar

### Sistema de Pagamento (Mercado Pago)
- **PIX**:
  - Geração de QR Code
  - Código copia e cola
  - Confirmação automática via webhook
  - Polling de status

- **Cartão de Crédito**:
  - Processamento seguro
  - Parcelamento disponível
  - Validação em tempo real

### Sistema de Saldo
- Carteira digital integrada
- Recarga mínima: R$ 20,00
- Histórico de transações
- Proteção contra duplicação de créditos

### Interface Responsiva
- Design mobile-first
- Compatível com todos dispositivos
- Animações suaves
- Efeitos glow e gradientes

## 🚀 Tecnologias

### Frontend
- HTML5 semântico
- CSS3 (Flexbox, Grid, Animations)
- JavaScript (ES6+)
- LocalStorage para persistência

### Backend
- Node.js (v14+)
- Express.js
- Mercado Pago SDK oficial
- Mongoose (MongoDB)
- JWT para autenticação
- QRCode generator

### Segurança
- Rate limiting
- Input sanitization
- CORS configurado
- Environment variables
- Webhook verification

## 📋 Pré-requisitos

- Node.js 14.0.0 ou superior
- npm ou yarn
- Conta no Mercado Pago (opcional para testes)
- MongoDB (opcional, funciona com localStorage)

## 💿 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/MAY0LPHI/Testando.git
cd Testando
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

4. **Edite o arquivo `.env`** com suas credenciais:
```env
# Mercado Pago Credentials
MERCADOPAGO_ACCESS_TOKEN=seu_access_token_aqui
MERCADOPAGO_PUBLIC_KEY=sua_public_key_aqui

# Environment
NODE_ENV=development

# Server
PORT=3000

# Database (opcional)
MONGODB_URI=mongodb://localhost:27017/surpriseboxjor

# JWT Secret
JWT_SECRET=sua_chave_secreta_aqui

# Webhook
WEBHOOK_URL=https://seudominio.com/api/payment/webhook
```

## ⚙️ Configuração

### Obtendo Credenciais do Mercado Pago

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Faça login na sua conta
3. Vá em "Suas integrações" → "Credenciais"
4. Copie o **Access Token** e a **Public Key**

**Para Testes:**
- Use as credenciais de TESTE primeiro
- Ative o modo TESTE no painel

**Para Produção:**
- Use as credenciais de PRODUÇÃO
- Configure o webhook URL
- Ative sua aplicação

### Configurando Webhook

O webhook é necessário para receber notificações de pagamentos aprovados:

1. No painel do Mercado Pago, vá em "Webhooks"
2. Adicione a URL: `https://seudominio.com/api/payment/webhook`
3. Selecione os eventos: `payment`
4. Salve a configuração

## 🎮 Uso

### Desenvolvimento

1. **Inicie o servidor**
```bash
npm run dev
```

2. **Acesse no navegador**
```
http://localhost:3000
```

3. **Modo de demonstração**
   - Sem credenciais do MP, funciona em modo offline
   - Pagamentos são simulados após 5 segundos
   - Dados salvos em LocalStorage

### Produção

1. **Configure as variáveis de produção no `.env`**
```env
NODE_ENV=production
MERCADOPAGO_ACCESS_TOKEN=prod_access_token
MERCADOPAGO_PUBLIC_KEY=prod_public_key
WEBHOOK_URL=https://seudominio.com/api/payment/webhook
```

2. **Inicie o servidor**
```bash
npm start
```

3. **Use HTTPS obrigatoriamente**
   - Mercado Pago requer HTTPS em produção
   - Configure SSL/TLS no seu servidor

## 📁 Estrutura do Projeto

```
/
├── index.html                 # Página inicial
├── pages/                     # Páginas do site
│   ├── caixas.html           # Catálogo de caixas
│   ├── album.html            # Sistema de álbuns
│   ├── deposito.html         # Página de depósito
│   ├── perfil.html           # Perfil do usuário
│   ├── lojinha.html          # Loja (em desenvolvimento)
│   └── suporte.html          # Suporte ao cliente
├── css/                      # Estilos
│   ├── style.css            # Estilos principais
│   ├── caixas.css           # Estilos das caixas
│   └── responsive.css       # Design responsivo
├── js/                       # JavaScript
│   ├── main.js              # Script principal
│   ├── lootbox.js           # Sistema de lootbox
│   ├── album.js             # Sistema de álbuns
│   └── mercadopago.js       # Integração MP
├── server/                   # Backend
│   ├── server.js            # Servidor Express
│   ├── config/
│   │   └── mercadopago.js   # Configuração MP
│   ├── routes/
│   │   ├── payment.js       # Rotas de pagamento
│   │   ├── user.js          # Rotas de usuário
│   │   └── lootbox.js       # Rotas de lootbox
│   └── controllers/
│       ├── paymentController.js
│       ├── userController.js
│       └── lootboxController.js
├── assets/                   # Recursos estáticos
│   └── images/
│       ├── boxes/           # Imagens das caixas
│       ├── prizes/          # Imagens dos prêmios
│       └── icons/           # Ícones
├── .env.example             # Template de variáveis
├── .gitignore              # Arquivos ignorados
├── package.json            # Dependências
└── README.md              # Este arquivo
```

## 🔌 API Endpoints

### Payment (Pagamento)

```http
GET /api/payment/config
# Retorna a public key do Mercado Pago

POST /api/payment/create-pix
# Cria pagamento PIX
Body: { amount, userId, description }

POST /api/payment/create-card
# Cria pagamento com cartão
Body: { amount, userId, cardData, description }

GET /api/payment/status/:paymentId
# Verifica status do pagamento

POST /api/payment/webhook
# Webhook do Mercado Pago (IPN)

POST /api/payment/add-balance
# Adiciona saldo (interno)
Body: { userId, amount, paymentId }
```

### User (Usuário)

```http
GET /api/user/balance
# Retorna saldo do usuário
Headers: user-id

POST /api/user/balance
# Atualiza saldo
Body: { userId, amount, operation }

GET /api/user/profile/:userId
# Retorna perfil completo

GET /api/user/history/:userId
# Retorna histórico de transações
```

### Lootbox

```http
GET /api/lootbox/boxes
# Lista todas as caixas

GET /api/lootbox/boxes/:boxId
# Retorna caixa específica

POST /api/lootbox/open
# Abre uma caixa
Body: { boxId, userId }

GET /api/lootbox/history/:userId
# Histórico de aberturas
```

## 💳 Integração Mercado Pago

### Fluxo PIX

1. Frontend solicita criação de pagamento PIX
2. Backend cria pagamento via API do MP
3. MP retorna QR Code e código copia-cola
4. Frontend exibe para o usuário
5. Usuário paga via app do banco
6. MP envia webhook quando aprovado
7. Backend credita saldo automaticamente

### Fluxo Cartão

1. Frontend coleta dados do cartão
2. Frontend cria token usando MP SDK
3. Backend processa pagamento com token
4. MP retorna status (aprovado/recusado)
5. Se aprovado, credita saldo imediatamente

### Prevenção de Duplicação

- Conjunto de IDs processados em memória
- Verificação antes de creditar
- Webhook sempre retorna 200 (evita retentativas)
- Em produção: usar banco de dados com unique constraints

## 🔒 Segurança

### Implementado
- ✅ Rate limiting (100 req/15min)
- ✅ Variáveis de ambiente
- ✅ Validação de inputs
- ✅ CORS configurado
- ✅ Proteção contra duplicação
- ✅ Webhook signature (recomendado)

### Recomendações Produção
- [ ] HTTPS obrigatório
- [ ] Firewall configurado
- [ ] Database com autenticação
- [ ] Logs centralizados
- [ ] Monitoring (New Relic, DataDog)
- [ ] Backup automático
- [ ] CDN para assets estáticos

## 🛠️ Desenvolvimento

### Adicionando nova caixa

1. **Edite `js/lootbox.js`**:
```javascript
BOXES['nova-caixa'] = {
    id: 7,
    name: 'NOVA CAIXA',
    price: 100.00,
    badge: 'SUPER ESPECIAL',
    prizes: [
        { name: 'Prêmio 1', rarity: 'legendary', probability: 0.1, image: 'premio1.png' },
        // ...
    ]
};
```

2. **Edite `server/controllers/lootboxController.js`** (mesma estrutura)

3. **Adicione card no HTML** (index.html, caixas.html)

### Personalizando cores

Edite variáveis CSS em `css/style.css`:
```css
:root {
    --bg-dark: #0a0e27;
    --primary: #00d9ff;
    --secondary: #7c3aed;
    --gold: #fbbf24;
}
```

## 🌐 Produção

### Deploy no Heroku

```bash
# Login
heroku login

# Criar app
heroku create surpriseboxjor

# Adicionar MongoDB
heroku addons:create mongolab

# Configurar variáveis
heroku config:set MERCADOPAGO_ACCESS_TOKEN=xxx
heroku config:set MERCADOPAGO_PUBLIC_KEY=xxx
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Deploy no VPS

```bash
# Instalar Node.js e PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# Clonar e configurar
git clone ...
cd Testando
npm install
cp .env.example .env
nano .env  # Editar variáveis

# Iniciar com PM2
pm2 start server/server.js --name surpriseboxjor
pm2 save
pm2 startup
```

### Nginx como Proxy Reverso

```nginx
server {
    listen 80;
    server_name seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## ❓ Troubleshooting

### Problema: Mercado Pago não funciona

**Solução:**
1. Verifique se as credenciais estão corretas em `.env`
2. Certifique-se de usar credenciais de TESTE primeiro
3. Verifique logs do console: `npm run dev`

### Problema: Pagamento não é creditado

**Solução:**
1. Verifique se o webhook está configurado
2. Teste com ngrok em desenvolvimento: `ngrok http 3000`
3. Configure webhook URL: `https://xxx.ngrok.io/api/payment/webhook`

### Problema: Erro "Payment already processed"

**Solução:**
- Isso é esperado! Previne duplicação
- Limpe o cache se for teste: reinicie o servidor

### Problema: CORS error

**Solução:**
- Configure CORS em `server/server.js`
- Em produção, especifique domínios permitidos

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 👥 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Add nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📞 Suporte

- Email: suporte@surpriseboxjor.com
- Parcerias: team@surpriseboxjor.com

## 🎯 Roadmap

- [ ] Sistema de autenticação completo
- [ ] Integração com banco de dados PostgreSQL
- [ ] Sistema de rankings
- [ ] Chat ao vivo
- [ ] App mobile (React Native)
- [ ] Sistema de afiliados
- [ ] Múltiplas moedas
- [ ] Internacionalização

---

**Desenvolvido com ❤️ para a comunidade de lootbox brasileira**