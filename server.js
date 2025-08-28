import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para processar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'src')));

// Rota para a landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/pages/landing.html'));
});

// Rota para visualizar a landing page
app.get('/landing', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/pages/landing.html'));
});

// Rota para visualizar o index.html
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota de health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'ZNPJ+ Server running' });
});

// Rota para simular a API de criação de leads
app.post('/api/create-lead', async (req, res) => {
    try {
        console.log('Lead recebido:', req.body);
        
        // Preparar dados para o Bitrix24 da Zopu
        const leadData = req.body;
        const bitrix24Data = {
            fields: {
                TITLE: `Lead ZNPJ+ - ${leadData.name} (${leadData.company})`,
                NAME: leadData.name,
                EMAIL: [{
                    VALUE: leadData.email,
                    VALUE_TYPE: 'WORK'
                }],
                PHONE: [{
                    VALUE: leadData.phone || '',
                    VALUE_TYPE: 'WORK'
                }],
                COMPANY_TITLE: leadData.company,
                COMMENTS: `Como conheceu: ${leadData.source || 'Não informado'}\nOrigem: Landing Page ZNPJ+`,
                SOURCE_ID: 'WEB',
                SOURCE_DESCRIPTION: 'Landing Page ZNPJ+',
                STATUS_ID: 'NEW',
                CURRENCY_ID: 'BRL',
                ASSIGNED_BY_ID: 1,
                UTM_SOURCE: 'ZNPJ+ Landing Page',
                UTM_MEDIUM: 'Organic',
                UTM_CAMPAIGN: 'Trial Request',
                UF_CRM_1706029934: leadData.bitrixDomain
            }
        };

        // Enviar para o Bitrix24 da Zopu
        const response = await fetch('https://zopu.bitrix24.com.br/rest/7/fyfjd56zlvaxpdox/crm.lead.add.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bitrix24Data)
        });

        const result = await response.json();
        
        if (result.result) {
            console.log('Lead criado no Bitrix24 da Zopu:', {
                leadId: result.result,
                data: leadData
            });
            
            res.json({ 
                success: true, 
                message: `Lead criado com sucesso! ID: ${result.result}`,
                leadId: result.result
            });
        } else {
            throw new Error('Erro na resposta do Bitrix24');
        }
    } catch (error) {
        console.error('Erro ao criar lead:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao criar lead no Bitrix24' 
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 ZNPJ+ Server rodando na porta ${PORT}`);
    console.log(`📱 Landing Page: http://localhost:${PORT}/landing`);
    console.log(`🏠 Página Principal: http://localhost:${PORT}/index`);
    console.log(`❤️ Desenvolvido pela Zopu - www.zopu.com.br`);
});
