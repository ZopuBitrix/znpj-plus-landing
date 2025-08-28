import axios from 'axios';
import logger from '../utils/logger.js';

class ReceitaService {
  constructor() {
    this.baseUrl = 'https://receitaws.com.br/v1/cnpj';
    this.cache = new Map();
    this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 horas
  }

  cleanCnpj(cnpj) {
    return cnpj.replace(/\D/g, '');
  }

  validateCnpj(cnpj) {
    const cleanCnpj = this.cleanCnpj(cnpj);
    
    if (cleanCnpj.length !== 14) {
      throw new Error('CNPJ deve ter 14 dígitos');
    }

    // Validação básica de dígitos verificadores
    let soma = 0;
    let peso = 2;

    for (let i = 11; i >= 0; i--) {
      soma += parseInt(cleanCnpj.charAt(i)) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }

    const digito1 = ((soma % 11) < 2) ? 0 : 11 - (soma % 11);

    soma = 0;
    peso = 2;

    for (let i = 12; i >= 0; i--) {
      soma += parseInt(cleanCnpj.charAt(i)) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }

    const digito2 = ((soma % 11) < 2) ? 0 : 11 - (soma % 11);

    if (parseInt(cleanCnpj.charAt(12)) !== digito1 || parseInt(cleanCnpj.charAt(13)) !== digito2) {
      throw new Error('CNPJ inválido');
    }

    return cleanCnpj;
  }

  getCachedData(cnpj) {
    const cached = this.cache.get(cnpj);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(cnpj, data) {
    this.cache.set(cnpj, {
      data,
      timestamp: Date.now()
    });
  }

  async consultarCnpj(cnpj) {
    try {
      const cleanCnpj = this.validateCnpj(cnpj);
      
      // Verificar cache primeiro
      const cachedData = this.getCachedData(cleanCnpj);
      if (cachedData) {
        logger.info(`Dados do CNPJ ${cleanCnpj} recuperados do cache`);
        return cachedData;
      }

      logger.info(`Consultando CNPJ: ${cleanCnpj}`);

      const response = await axios.get(`${this.baseUrl}/${cleanCnpj}`, {
        timeout: 30000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ZNPJ+/1.0'
        }
      });

      if (response.status !== 200) {
        throw new Error(`Erro na API da Receita Federal: ${response.status}`);
      }

      const data = response.data;
      
      if (!data || data.status === 'ERROR') {
        throw new Error(data.message || 'CNPJ não encontrado ou inválido');
      }

      const formattedData = this.formatarDadosReceita(data);
      
      // Salvar no cache
      this.setCachedData(cleanCnpj, formattedData);
      
      logger.info(`Consulta ao CNPJ ${cleanCnpj} realizada com sucesso`);
      return formattedData;

    } catch (error) {
      logger.error(`Erro ao consultar CNPJ ${cnpj}`, { error: error.message });
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout na consulta à Receita Federal');
      }
      
      if (error.response) {
        if (error.response.status === 429) {
          throw new Error('Limite de consultas excedido. Tente novamente em alguns minutos.');
        }
        throw new Error(`Erro na API: ${error.response.status} - ${error.response.statusText}`);
      }
      
      throw error;
    }
  }

  formatarDadosReceita(data) {
    return {
      cnpj: data.cnpj,
      nome: data.nome,
      nome_fantasia: data.fantasia,
      logradouro: data.logradouro,
      numero: data.numero,
      bairro: data.bairro,
      municipio: data.municipio,
      uf: data.uf,
      cep: data.cep,
      situacao: data.situacao,
      data_abertura: data.abertura,
      email: data.email,
      telefone: data.telefone,
      capital_social: data.capital_social,
      natureza_juridica: data.natureza_juridica,
      porte: data.porte,
      inscricao_estadual: data.inscricao_estadual,
      inscricao_municipal: data.inscricao_municipal,
      atividade_principal: data.atividade_principal,
      atividades_secundarias: data.atividades_secundarias,
      quadro_socios: data.qsa,
      ultima_atualizacao: new Date().toISOString()
    };
  }
}

export default new ReceitaService();
