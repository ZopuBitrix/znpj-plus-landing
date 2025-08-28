# ZNPJ+ - Landing Page

Landing page para captura de leads do ZNPJ+ (Integração Bitrix24 com Receita Federal).

## 🚀 Sobre o Projeto

Esta landing page foi desenvolvida para capturar leads interessados no ZNPJ+, uma integração completa entre Bitrix24 e Receita Federal que permite qualificar leads e empresas automaticamente com dados oficiais.

## ✨ Funcionalidades

- **Formulário de Captura**: Coleta dados de leads interessados
- **Integração Bitrix24**: Envia leads automaticamente para o CRM da Zopu
- **Design Responsivo**: Funciona em desktop e mobile
- **Validação de Campos**: Garante dados corretos
- **Feedback Visual**: Confirmação de envio para o usuário

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Integração**: Bitrix24 REST API
- **Deploy**: Vercel/Netlify (recomendado)

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/znpj-plus-landing.git
cd znpj-plus-landing
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor local:
```bash
npm start
```

4. Acesse: http://localhost:3000/landing

## 🌐 Deploy

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

## 📋 Estrutura do Projeto

```
znpj-plus-landing/
├── src/
│   ├── pages/
│   │   └── landing.html      # Landing page principal
│   └── ...
├── server.js                 # Servidor Express
├── package.json             # Dependências
└── README.md               # Este arquivo
```

## 🔧 Configuração

### Variáveis de Ambiente
- `PORT`: Porta do servidor (padrão: 3000)
- `BITRIX24_WEBHOOK`: Webhook do Bitrix24 da Zopu

### Campos do Lead
- **Nome**: Nome do interessado
- **Email**: Email para contato
- **Telefone**: Telefone (opcional)
- **Empresa**: Nome da empresa
- **Domínio Bitrix24**: Domínio do Bitrix24 do cliente
- **Como conheceu**: Origem do lead

## 📊 Integração com Bitrix24

Os leads são enviados automaticamente para o Bitrix24 da Zopu com os seguintes campos mapeados:

- `TITLE`: "Lead ZNPJ+ - [Nome] ([Empresa])"
- `NAME`: Nome do lead
- `EMAIL`: Email do lead
- `PHONE`: Telefone do lead
- `COMPANY_TITLE`: Nome da empresa
- `UF_CRM_1706029934`: Domínio Bitrix24
- `SOURCE_DESCRIPTION`: "Landing Page ZNPJ+"
- `COMMENTS`: Informações adicionais

## 🎯 Como Usar

1. Acesse a landing page
2. Preencha o formulário com seus dados
3. Clique em "Solicitar Trial"
4. O lead será criado automaticamente no Bitrix24 da Zopu
5. Você receberá uma confirmação com o ID do lead

## 📞 Suporte

- **Desenvolvido por**: Zopu - www.zopu.com.br
- **Email**: contato@zopu.com.br
- **WhatsApp**: (47)3307-9280

## 📄 Licença

Este projeto é propriedade da Zopu. Todos os direitos reservados.

---

**ZNPJ+** - Qualifique leads e empresas automaticamente com dados oficiais da Receita Federal no seu Bitrix24.
