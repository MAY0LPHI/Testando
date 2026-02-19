# SurpriseBoxJor - Clone Completo

Clone completo e funcional do site **surpriseboxjor.com** com sistema de lootbox, pagamentos via Mercado Pago, carteira virtual e álbum de figurinhas.

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-ISC-blue.svg)

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Como Usar](#-como-usar)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Endpoints](#-api-endpoints)
- [Avisos Legais](#-avisos-legais)

## ✨ Funcionalidades

### Sistema de Lootboxes
- **6 tipos de caixas** com preços diferentes (R$ 5,00 a R$ 497,00)
- Animação de abertura com efeito glow dourado
- Sistema RNG (Random Number Generator) justo e transparente
- Prêmios físicos e digitais (figurinhas)
- Visualização de probabilidades de cada prêmio
- Histórico de caixas abertas

### Sistema de Pagamento (Mercado Pago)
- Integração completa com Mercado Pago SDK
- **Métodos de pagamento:**
  - PIX com QR Code
  - Cartão de Crédito
- Valor mínimo de recarga: R$ 20,00
- Webhook para notificações automáticas
- Aprovação manual para testes (modo desenvolvimento)

### Carteira Virtual
- Saldo em tempo real
- Bônus de R$ 4,00 ao se cadastrar
- Histórico de transações (depósitos e gastos)
- Débito automático ao abrir caixas

### Sistema de Álbum de Figurinhas
- **3 álbuns diferentes:**
  - Audio Master 1 (10 figurinhas) - Recompensa: KIT MASTER AUDIO
  - CINEMA CONTROLLER PS5 EDITION (176 figurinhas) - Recompensa: Controle Dualsense PS5
  - PS5 PRO (1872 figurinhas) - Recompensa: PS5 PRO
- Barra de progresso visual
- Sistema de figurinhas únicas
- Visualização detalhada do álbum

### Outras Funcionalidades
- Sistema de autenticação (login/registro)
- Estatísticas em tempo real
- Design responsivo (mobile-first)
- Navegação inferior com 6 seções
- Footer completo com informações

## 🛠 Tecnologias

### Frontend
- HTML5
- CSS3 (Grid, Flexbox, Animations)
- JavaScript (Vanilla ES6+)
- Font Awesome (ícones)

### Backend
- Node.js
- Express.js
- SQLite (banco de dados)
- Mercado Pago SDK
- JWT (autenticação)
- bcryptjs (criptografia de senhas)

## 📦 Instalação

### Pré-requisitos
- Node.js 14+ instalado
- npm ou yarn
- Conta no Mercado Pago (para produção)

### Passos

1. **Clone o repositório:**
```bash
git clone https://github.com/MAY0LPHI/Testando.git
cd Testando
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
MERCADOPAGO_ACCESS_TOKEN=seu_token_aqui
MERCADOPAGO_PUBLIC_KEY=sua_chave_publica_aqui
JWT_SECRET=seu_secret_jwt_aqui
PORT=3000
```

## ⚙️ Configuração

### Configurar Mercado Pago

1. **Criar conta no Mercado Pago:**
   - Acesse: https://www.mercadopago.com.br/
   - Crie uma conta de desenvolvedor

2. **Obter credenciais:**
   - Acesse: https://www.mercadopago.com.br/developers/
   - Vá em "Suas integrações" → "Credenciais"
   - Copie o **Access Token** e **Public Key**
   - Para testes, use as credenciais de **Sandbox**

3. **Configurar Webhook:**
   - Em "Suas integrações", configure a URL do webhook
   - URL: `https://seu-dominio.com/api/payment/webhook`
   - Para testes locais, use ngrok: `ngrok http 3000`

### Modo Sandbox (Testes)

O Mercado Pago oferece um ambiente sandbox para testes:

1. Use as credenciais de teste (começam com `TEST-`)
2. Use cartões de teste fornecidos pelo Mercado Pago
3. PIX em sandbox não gera QR Code real

### Alternar para Produção

1. Substitua as credenciais de teste pelas de produção no `.env`
2. Configure o webhook com URL pública
3. Garanta SSL/HTTPS na aplicação
4. Teste rigorosamente antes de lançar

## 🚀 Como Usar

### Iniciar o servidor

**Desenvolvimento (com auto-reload):**
```bash
npm run dev
```

**Produção:**
```bash
npm start
```

### Acessar a aplicação

Abra o navegador em: `http://localhost:3000`

### Fluxo de Uso

1. **Cadastro:**
   - Clique em "Cadastrar"
   - Preencha username, email e senha
   - Receba R$ 4,00 de bônus automaticamente

2. **Adicionar Saldo:**
   - Clique em "Depósito" na navegação inferior
   - Digite o valor (mínimo R$ 20,00)
   - Escolha PIX ou Cartão
   - Complete o pagamento

3. **Abrir Caixa:**
   - Escolha uma das 6 caixas disponíveis
   - Clique em "ABRIR POR R$ X,XX"
   - Veja a animação de abertura
   - Receba seu prêmio (físico ou figurinha)

4. **Visualizar Álbum:**
   - Clique em "Álbum" na navegação
   - Escolha um álbum para visualizar
   - Veja suas figurinhas coletadas
   - Acompanhe o progresso

## 📁 Estrutura do Projeto

```
/
├── frontend/
│   ├── index.html              # Página principal
│   ├── css/
│   │   ├── styles.css          # Estilos principais
│   │   ├── animations.css      # Animações
│   │   └── responsive.css      # Responsividade
│   ├── js/
│   │   ├── main.js             # Lógica principal e autenticação
│   │   ├── lootbox.js          # Funcionalidades de lootbox
│   │   ├── payment.js          # Integração de pagamento
│   │   ├── album.js            # Sistema de álbum
│   │   └── wallet.js           # Carteira virtual
│   └── assets/
│       ├── images/             # Imagens
│       └── icons/              # Ícones
├── backend/
│   ├── server.js               # Servidor Express
│   ├── routes/
│   │   ├── auth.js             # Rotas de autenticação
│   │   ├── payment.js          # Rotas de pagamento
│   │   ├── lootbox.js          # Rotas de lootbox
│   │   └── user.js             # Rotas de usuário
│   ├── models/
│   │   ├── database.js         # Configuração do banco
│   │   ├── User.js             # Model de usuário
│   │   ├── Transaction.js      # Model de transação
│   │   ├── Lootbox.js          # Model de lootbox
│   │   └── Album.js            # Model de álbum
│   ├── middleware/
│   │   └── auth.js             # Middleware de autenticação
│   └── config/
│       └── mercadopago.js      # Configuração Mercado Pago
├── package.json                # Dependências
├── .env.example                # Exemplo de variáveis de ambiente
├── .gitignore                  # Arquivos ignorados
└── README.md                   # Este arquivo
```

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Fazer login

### Pagamento
- `POST /api/payment/create-preference` - Criar preferência de pagamento
- `POST /api/payment/webhook` - Webhook Mercado Pago
- `GET /api/payment/status/:paymentId` - Status do pagamento
- `POST /api/payment/approve-payment` - Aprovar pagamento (teste)

### Lootbox
- `GET /api/lootbox/boxes` - Listar todas as caixas
- `GET /api/lootbox/prizes/:lootboxId` - Prêmios de uma caixa
- `POST /api/lootbox/open` - Abrir caixa
- `GET /api/lootbox/history` - Histórico de abertura

### Usuário
- `GET /api/user/profile` - Perfil do usuário
- `GET /api/user/transactions` - Histórico de transações
- `GET /api/user/albums` - Álbuns do usuário
- `GET /api/user/albums/:albumId` - Detalhes de um álbum

### Estatísticas
- `GET /api/stats` - Estatísticas em tempo real

## ⚠️ Avisos Legais

### Sobre Lootboxes

⚠️ **IMPORTANTE:** Sistemas de lootbox podem ser considerados jogos de azar em algumas jurisdições. 

- Verifique a legislação local antes de implementar em produção
- Alguns países exigem licença para operar sistemas de lootbox
- Pode ser necessário implementar controles de idade
- Transparência nas probabilidades é obrigatória em muitos locais

### Regulamentação no Brasil

No Brasil, jogos de azar são regulamentados e podem exigir autorizações especiais. Consulte um advogado especializado antes de lançar comercialmente.

### Mercado Pago

- Este projeto usa a API do Mercado Pago
- Leia os termos de serviço: https://www.mercadopago.com.br/ajuda/termos-e-condicoes_299
- Não armazene dados de cartão de crédito
- Implemente todas as medidas de segurança recomendadas

### Responsabilidade

Este projeto é fornecido "como está", sem garantias. Os desenvolvedores não se responsabilizam por:
- Uso indevido do código
- Violações de leis locais
- Perdas financeiras
- Problemas com transações

## 🔒 Segurança

### Medidas Implementadas

- ✅ Senhas criptografadas com bcrypt
- ✅ Autenticação JWT
- ✅ Rate limiting nas APIs
- ✅ Validação de pagamentos via webhook
- ✅ CORS configurado
- ✅ Sanitização de inputs

### Recomendações Adicionais

Para produção, implemente:
- HTTPS/SSL obrigatório
- Validação de email
- 2FA (autenticação de dois fatores)
- Logs de auditoria
- Backup automático do banco de dados
- Monitoramento de transações suspeitas
- Sistema anti-fraude
- Conformidade com LGPD/GDPR

## 🎨 Cores e Design

### Paleta de Cores
- Background Primary: `#0a1628`
- Background Secondary: `#1a2332`
- Accent Cyan: `#00d9ff`
- Accent Purple: `#a855f7`
- Accent Gold: `#ffd700` (efeito glow)

### Fontes
- Principal: Segoe UI, Tahoma, Geneva, Verdana, sans-serif

## 📱 Responsividade

O site é totalmente responsivo e otimizado para:
- 📱 Mobile (até 480px)
- 📱 Tablet (481px - 768px)
- 💻 Desktop (769px - 1024px)
- 🖥️ Large Desktop (1025px+)

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

ISC License - veja o arquivo LICENSE para detalhes.

## 📞 Suporte

Para dúvidas ou suporte:
- Email: suporte@surpriseboxjor.com
- Parcerias: team@surpriseboxjor.com

## 🌟 Créditos

Desenvolvido como clone educacional do site surpriseboxjor.com.

---

**Nota:** Este é um projeto educacional. Não deve ser usado comercialmente sem as devidas autorizações e conformidade com leis locais.