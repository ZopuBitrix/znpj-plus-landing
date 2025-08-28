import logger from '../utils/logger.js';

class Bitrix24Service {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 segundo
  }

  async retryOperation(operation, retries = this.maxRetries) {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error) {
        logger.warn(`Tentativa ${i + 1} falhou`, { error: error.message });
        
        if (i === retries - 1) {
          throw error;
        }
        
        // Aguardar antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
      }
    }
  }

  validateCompanyData(companyData) {
    if (!companyData || typeof companyData !== 'object') {
      throw new Error('Dados da empresa inválidos');
    }

    if (!companyData.ID) {
      throw new Error('ID da empresa é obrigatório');
    }

    return true;
  }

  validateLeadData(leadData) {
    if (!leadData || typeof leadData !== 'object') {
      throw new Error('Dados do lead inválidos');
    }

    if (!leadData.ID) {
      throw new Error('ID do lead é obrigatório');
    }

    return true;
  }

  validateFieldMapping(fieldMapping) {
    const requiredFields = [
      'field_cnpj',
      'field_company_name',
      'field_street',
      'field_number',
      'field_neighborhood',
      'field_city',
      'field_cep',
      'field_situation'
    ];

    for (const field of requiredFields) {
      if (!fieldMapping[field]) {
        throw new Error(`Campo obrigatório não mapeado: ${field}`);
      }
    }

    return true;
  }

  // ===== MÉTODOS PARA CRIAÇÃO AUTOMÁTICA DE CAMPOS =====

  async createCompanyFields(accessToken) {
    try {
      logger.info('Criando campos personalizados para empresas');

      const fieldsToCreate = [
        {
          FIELD_NAME: 'UF_CNPJ',
          EDIT_FORM_LABEL: 'CNPJ',
          LIST_COLUMN_LABEL: 'CNPJ',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_CNPJ'
        },
        {
          FIELD_NAME: 'UF_RAZAO_SOCIAL',
          EDIT_FORM_LABEL: 'Razão Social',
          LIST_COLUMN_LABEL: 'Razão Social',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_RAZAO_SOCIAL'
        },
        {
          FIELD_NAME: 'UF_LOGRADOURO',
          EDIT_FORM_LABEL: 'Logradouro',
          LIST_COLUMN_LABEL: 'Logradouro',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_LOGRADOURO'
        },
        {
          FIELD_NAME: 'UF_NUMERO',
          EDIT_FORM_LABEL: 'Número',
          LIST_COLUMN_LABEL: 'Número',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_NUMERO'
        },
        {
          FIELD_NAME: 'UF_BAIRRO',
          EDIT_FORM_LABEL: 'Bairro',
          LIST_COLUMN_LABEL: 'Bairro',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_BAIRRO'
        },
        {
          FIELD_NAME: 'UF_CIDADE',
          EDIT_FORM_LABEL: 'Cidade',
          LIST_COLUMN_LABEL: 'Cidade',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_CIDADE'
        },
        {
          FIELD_NAME: 'UF_CEP',
          EDIT_FORM_LABEL: 'CEP',
          LIST_COLUMN_LABEL: 'CEP',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_CEP'
        },
        {
          FIELD_NAME: 'UF_SITUACAO',
          EDIT_FORM_LABEL: 'Situação Cadastral',
          LIST_COLUMN_LABEL: 'Situação',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_SITUACAO'
        },
        {
          FIELD_NAME: 'UF_UF',
          EDIT_FORM_LABEL: 'UF',
          LIST_COLUMN_LABEL: 'UF',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_UF'
        },
        {
          FIELD_NAME: 'UF_EMAIL',
          EDIT_FORM_LABEL: 'Email',
          LIST_COLUMN_LABEL: 'Email',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_EMAIL'
        },
        {
          FIELD_NAME: 'UF_TELEFONE',
          EDIT_FORM_LABEL: 'Telefone',
          LIST_COLUMN_LABEL: 'Telefone',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_TELEFONE'
        },
        {
          FIELD_NAME: 'UF_CAPITAL_SOCIAL',
          EDIT_FORM_LABEL: 'Capital Social',
          LIST_COLUMN_LABEL: 'Capital Social',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_CAPITAL_SOCIAL'
        },
        {
          FIELD_NAME: 'UF_NATUREZA_JURIDICA',
          EDIT_FORM_LABEL: 'Natureza Jurídica',
          LIST_COLUMN_LABEL: 'Natureza Jurídica',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_NATUREZA_JURIDICA'
        },
        {
          FIELD_NAME: 'UF_PORTE',
          EDIT_FORM_LABEL: 'Porte',
          LIST_COLUMN_LABEL: 'Porte',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_PORTE'
        },
        {
          FIELD_NAME: 'UF_DATA_ABERTURA',
          EDIT_FORM_LABEL: 'Data de Abertura',
          LIST_COLUMN_LABEL: 'Data Abertura',
          USER_TYPE_ID: 'date',
          XML_ID: 'UF_DATA_ABERTURA'
        },
        {
          FIELD_NAME: 'UF_INSCRICAO_ESTADUAL',
          EDIT_FORM_LABEL: 'Inscrição Estadual',
          LIST_COLUMN_LABEL: 'IE',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_INSCRICAO_ESTADUAL'
        },
        {
          FIELD_NAME: 'UF_INSCRICAO_MUNICIPAL',
          EDIT_FORM_LABEL: 'Inscrição Municipal',
          LIST_COLUMN_LABEL: 'IM',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_INSCRICAO_MUNICIPAL'
        }
      ];

      const createdFields = [];

      for (const field of fieldsToCreate) {
        try {
          const result = await this.createCompanyField(field, accessToken);
          createdFields.push(result);
          logger.info(`Campo criado: ${field.FIELD_NAME}`);
        } catch (error) {
          logger.warn(`Erro ao criar campo ${field.FIELD_NAME}`, { error: error.message });
          // Continuar com os próximos campos mesmo se um falhar
        }
      }

      logger.info(`Campos criados com sucesso: ${createdFields.length}/${fieldsToCreate.length}`);
      return createdFields;

    } catch (error) {
      logger.error('Erro ao criar campos da empresa', { error: error.message });
      throw error;
    }
  }

  async createCompanyField(fieldData, accessToken) {
    return new Promise((resolve, reject) => {
      BX24.callMethod(
        "crm.company.userfield.add",
        fieldData,
        function (result) {
          if (result.error()) {
            reject(new Error(result.error_description()));
            return;
          }
          resolve(result.data());
        }
      );
    });
  }

  async createLeadFields(accessToken) {
    try {
      logger.info('Criando campos personalizados para leads');

      const fieldsToCreate = [
        {
          FIELD_NAME: 'UF_CNPJ',
          EDIT_FORM_LABEL: 'CNPJ',
          LIST_COLUMN_LABEL: 'CNPJ',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_CNPJ'
        },
        {
          FIELD_NAME: 'UF_RAZAO_SOCIAL',
          EDIT_FORM_LABEL: 'Razão Social',
          LIST_COLUMN_LABEL: 'Razão Social',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_RAZAO_SOCIAL'
        },
        {
          FIELD_NAME: 'UF_LOGRADOURO',
          EDIT_FORM_LABEL: 'Logradouro',
          LIST_COLUMN_LABEL: 'Logradouro',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_LOGRADOURO'
        },
        {
          FIELD_NAME: 'UF_NUMERO',
          EDIT_FORM_LABEL: 'Número',
          LIST_COLUMN_LABEL: 'Número',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_NUMERO'
        },
        {
          FIELD_NAME: 'UF_BAIRRO',
          EDIT_FORM_LABEL: 'Bairro',
          LIST_COLUMN_LABEL: 'Bairro',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_BAIRRO'
        },
        {
          FIELD_NAME: 'UF_CIDADE',
          EDIT_FORM_LABEL: 'Cidade',
          LIST_COLUMN_LABEL: 'Cidade',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_CIDADE'
        },
        {
          FIELD_NAME: 'UF_CEP',
          EDIT_FORM_LABEL: 'CEP',
          LIST_COLUMN_LABEL: 'CEP',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_CEP'
        },
        {
          FIELD_NAME: 'UF_SITUACAO',
          EDIT_FORM_LABEL: 'Situação Cadastral',
          LIST_COLUMN_LABEL: 'Situação',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_SITUACAO'
        },
        {
          FIELD_NAME: 'UF_UF',
          EDIT_FORM_LABEL: 'UF',
          LIST_COLUMN_LABEL: 'UF',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_UF'
        },
        {
          FIELD_NAME: 'UF_EMAIL',
          EDIT_FORM_LABEL: 'Email',
          LIST_COLUMN_LABEL: 'Email',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_EMAIL'
        },
        {
          FIELD_NAME: 'UF_TELEFONE',
          EDIT_FORM_LABEL: 'Telefone',
          LIST_COLUMN_LABEL: 'Telefone',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_TELEFONE'
        },
        {
          FIELD_NAME: 'UF_CAPITAL_SOCIAL',
          EDIT_FORM_LABEL: 'Capital Social',
          LIST_COLUMN_LABEL: 'Capital Social',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_CAPITAL_SOCIAL'
        },
        {
          FIELD_NAME: 'UF_NATUREZA_JURIDICA',
          EDIT_FORM_LABEL: 'Natureza Jurídica',
          LIST_COLUMN_LABEL: 'Natureza Jurídica',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_NATUREZA_JURIDICA'
        },
        {
          FIELD_NAME: 'UF_PORTE',
          EDIT_FORM_LABEL: 'Porte',
          LIST_COLUMN_LABEL: 'Porte',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_PORTE'
        },
        {
          FIELD_NAME: 'UF_DATA_ABERTURA',
          EDIT_FORM_LABEL: 'Data de Abertura',
          LIST_COLUMN_LABEL: 'Data Abertura',
          USER_TYPE_ID: 'date',
          XML_ID: 'UF_DATA_ABERTURA'
        },
        {
          FIELD_NAME: 'UF_INSCRICAO_ESTADUAL',
          EDIT_FORM_LABEL: 'Inscrição Estadual',
          LIST_COLUMN_LABEL: 'IE',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_INSCRICAO_ESTADUAL'
        },
        {
          FIELD_NAME: 'UF_INSCRICAO_MUNICIPAL',
          EDIT_FORM_LABEL: 'Inscrição Municipal',
          LIST_COLUMN_LABEL: 'IM',
          USER_TYPE_ID: 'string',
          XML_ID: 'UF_INSCRICAO_MUNICIPAL'
        }
      ];

      const createdFields = [];

      for (const field of fieldsToCreate) {
        try {
          const result = await this.createLeadField(field, accessToken);
          createdFields.push(result);
          logger.info(`Campo criado: ${field.FIELD_NAME}`);
        } catch (error) {
          logger.warn(`Erro ao criar campo ${field.FIELD_NAME}`, { error: error.message });
          // Continuar com os próximos campos mesmo se um falhar
        }
      }

      logger.info(`Campos criados com sucesso: ${createdFields.length}/${fieldsToCreate.length}`);
      return createdFields;

    } catch (error) {
      logger.error('Erro ao criar campos do lead', { error: error.message });
      throw error;
    }
  }

  async createLeadField(fieldData, accessToken) {
    return new Promise((resolve, reject) => {
      BX24.callMethod(
        "crm.lead.userfield.add",
        fieldData,
        function (result) {
          if (result.error()) {
            reject(new Error(result.error_description()));
            return;
          }
          resolve(result.data());
        }
      );
    });
  }

  async getDefaultFieldMapping() {
    return {
      field_cnpj: 'UF_CNPJ',
      field_company_name: 'UF_RAZAO_SOCIAL',
      field_street: 'UF_LOGRADOURO',
      field_number: 'UF_NUMERO',
      field_neighborhood: 'UF_BAIRRO',
      field_city: 'UF_CIDADE',
      field_cep: 'UF_CEP',
      field_situation: 'UF_SITUACAO',
      field_uf: 'UF_UF',
      field_email: 'UF_EMAIL',
      field_phone: 'UF_TELEFONE',
      field_capital_social: 'UF_CAPITAL_SOCIAL',
      field_natureza_juridica: 'UF_NATUREZA_JURIDICA',
      field_porte: 'UF_PORTE',
      field_data_abertura: 'UF_DATA_ABERTURA',
      field_inscricao_estadual: 'UF_INSCRICAO_ESTADUAL',
      field_inscricao_municipal: 'UF_INSCRICAO_MUNICIPAL'
    };
  }

  // ===== MÉTODOS PARA EMPRESAS =====

  async getCompanyData(companyId, accessToken) {
    try {
      logger.info(`Buscando dados da empresa: ${companyId}`);

      return new Promise((resolve, reject) => {
        BX24.callMethod(
          "crm.company.get",
          { id: companyId },
          function (result) {
            if (result.error()) {
              logger.error(`Erro ao buscar empresa ${companyId}`, {
                error: result.error_description()
              });
              reject(new Error(result.error_description()));
              return;
            }

            const companyData = result.data();
            logger.info(`Dados da empresa ${companyId} recuperados com sucesso`);
            resolve(companyData);
          }
        );
      });

    } catch (error) {
      logger.error(`Erro inesperado ao buscar empresa ${companyId}`, {
        error: error.message
      });
      throw error;
    }
  }

  async updateCompanyData(companyId, fields, accessToken) {
    try {
      logger.info(`Atualizando empresa: ${companyId}`, { fields });

      return new Promise((resolve, reject) => {
        BX24.callMethod(
          "crm.company.update",
          {
            id: companyId,
            fields: fields
          },
          function (result) {
            if (result.error()) {
              logger.error(`Erro ao atualizar empresa ${companyId}`, {
                error: result.error_description(),
                fields
              });
              reject(new Error(result.error_description()));
              return;
            }

            logger.info(`Empresa ${companyId} atualizada com sucesso`);
            resolve(result.data());
          }
        );
      });

    } catch (error) {
      logger.error(`Erro inesperado ao atualizar empresa ${companyId}`, {
        error: error.message,
        fields
      });
      throw error;
    }
  }

  async getCompanyFields(accessToken) {
    try {
      logger.info('Buscando campos disponíveis da empresa');

      return new Promise((resolve, reject) => {
        BX24.callMethod(
          "crm.company.fields",
          {},
          function (result) {
            if (result.error()) {
              logger.error('Erro ao buscar campos da empresa', {
                error: result.error_description()
              });
              reject(new Error(result.error_description()));
              return;
            }

            const fields = result.data();
            logger.info('Campos da empresa recuperados com sucesso');
            resolve(fields);
          }
        );
      });

    } catch (error) {
      logger.error('Erro inesperado ao buscar campos da empresa', {
        error: error.message
      });
      throw error;
    }
  }

  // ===== MÉTODOS PARA LEADS =====

  async getLeadData(leadId, accessToken) {
    try {
      logger.info(`Buscando dados do lead: ${leadId}`);

      return new Promise((resolve, reject) => {
        BX24.callMethod(
          "crm.lead.get",
          { id: leadId },
          function (result) {
            if (result.error()) {
              logger.error(`Erro ao buscar lead ${leadId}`, {
                error: result.error_description()
              });
              reject(new Error(result.error_description()));
              return;
            }

            const leadData = result.data();
            logger.info(`Dados do lead ${leadId} recuperados com sucesso`);
            resolve(leadData);
          }
        );
      });

    } catch (error) {
      logger.error(`Erro inesperado ao buscar lead ${leadId}`, {
        error: error.message
      });
      throw error;
    }
  }

  async updateLeadData(leadId, fields, accessToken) {
    try {
      logger.info(`Atualizando lead: ${leadId}`, { fields });

      return new Promise((resolve, reject) => {
        BX24.callMethod(
          "crm.lead.update",
          {
            id: leadId,
            fields: fields
          },
          function (result) {
            if (result.error()) {
              logger.error(`Erro ao atualizar lead ${leadId}`, {
                error: result.error_description(),
                fields
              });
              reject(new Error(result.error_description()));
              return;
            }

            logger.info(`Lead ${leadId} atualizado com sucesso`);
            resolve(result.data());
          }
        );
      });

    } catch (error) {
      logger.error(`Erro inesperado ao atualizar lead ${leadId}`, {
        error: error.message,
        fields
      });
      throw error;
    }
  }

  async getLeadFields(accessToken) {
    try {
      logger.info('Buscando campos disponíveis do lead');

      return new Promise((resolve, reject) => {
        BX24.callMethod(
          "crm.lead.fields",
          {},
          function (result) {
            if (result.error()) {
              logger.error('Erro ao buscar campos do lead', {
                error: result.error_description()
              });
              reject(new Error(result.error_description()));
              return;
            }

            const fields = result.data();
            logger.info('Campos do lead recuperados com sucesso');
            resolve(fields);
          }
        );
      });

    } catch (error) {
      logger.error('Erro inesperado ao buscar campos do lead', {
        error: error.message
      });
      throw error;
    }
  }

  // ===== MÉTODOS GENÉRICOS =====

  async createActivity(ownerId, ownerType, message, accessToken) {
    try {
      logger.info(`Criando atividade para ${ownerType}: ${ownerId}`);

      const ownerTypeId = ownerType === 'company' ? 2 : 1; // 2=Company, 1=Lead

      return new Promise((resolve, reject) => {
        BX24.callMethod(
          "crm.activity.add",
          {
            fields: {
              OWNER_ID: ownerId,
              OWNER_TYPE_ID: ownerTypeId,
              TYPE_ID: 1, // Call
              SUBJECT: "Consulta Receita Federal",
              DESCRIPTION: message,
              COMPLETED: "Y"
            }
          },
          function (result) {
            if (result.error()) {
              logger.error(`Erro ao criar atividade para ${ownerType} ${ownerId}`, {
                error: result.error_description()
              });
              reject(new Error(result.error_description()));
              return;
            }

            logger.info(`Atividade criada com sucesso para ${ownerType} ${ownerId}`);
            resolve(result.data());
          }
        );
      });

    } catch (error) {
      logger.error(`Erro inesperado ao criar atividade para ${ownerType} ${ownerId}`, {
        error: error.message
      });
      throw error;
    }
  }

  formatCompanyFields(receitaData, fieldMapping) {
    const formattedFields = {};

    // Mapear campos básicos
    const fieldMappings = {
      'field_cnpj': receitaData.cnpj,
      'field_company_name': receitaData.nome,
      'field_street': receitaData.logradouro,
      'field_number': receitaData.numero,
      'field_neighborhood': receitaData.bairro,
      'field_city': receitaData.municipio,
      'field_cep': receitaData.cep,
      'field_situation': receitaData.situacao,
      'field_uf': receitaData.uf,
      'field_email': receitaData.email,
      'field_phone': receitaData.telefone,
      'field_capital_social': receitaData.capital_social,
      'field_natureza_juridica': receitaData.natureza_juridica,
      'field_porte': receitaData.porte,
      'field_data_abertura': receitaData.data_abertura,
      'field_inscricao_estadual': receitaData.inscricao_estadual,
      'field_inscricao_municipal': receitaData.inscricao_municipal
    };

    // Aplicar mapeamento apenas para campos configurados
    for (const [bitrixField, receitaValue] of Object.entries(fieldMappings)) {
      if (fieldMapping[bitrixField] && receitaValue) {
        formattedFields[fieldMapping[bitrixField]] = receitaValue;
      }
    }

    return formattedFields;
  }

  formatLeadFields(receitaData, fieldMapping) {
    const formattedFields = {};

    // Mapear campos básicos para leads
    const fieldMappings = {
      'field_cnpj': receitaData.cnpj,
      'field_company_name': receitaData.nome,
      'field_street': receitaData.logradouro,
      'field_number': receitaData.numero,
      'field_neighborhood': receitaData.bairro,
      'field_city': receitaData.municipio,
      'field_cep': receitaData.cep,
      'field_situation': receitaData.situacao,
      'field_uf': receitaData.uf,
      'field_email': receitaData.email,
      'field_phone': receitaData.telefone,
      'field_capital_social': receitaData.capital_social,
      'field_natureza_juridica': receitaData.natureza_juridica,
      'field_porte': receitaData.porte,
      'field_data_abertura': receitaData.data_abertura,
      'field_inscricao_estadual': receitaData.inscricao_estadual,
      'field_inscricao_municipal': receitaData.inscricao_municipal,
      // Campos específicos de leads
      'field_title': receitaData.nome, // Título do lead
      'field_source': 'Receita Federal', // Origem do lead
      'field_status': 'Qualificado' // Status após enriquecimento
    };

    // Aplicar mapeamento apenas para campos configurados
    for (const [bitrixField, receitaValue] of Object.entries(fieldMappings)) {
      if (fieldMapping[bitrixField] && receitaValue) {
        formattedFields[fieldMapping[bitrixField]] = receitaValue;
      }
    }

    return formattedFields;
  }

  // Método para determinar o tipo de entidade baseado no contexto
  getEntityType(context) {
    if (context.PLACEMENT_OPTIONS) {
      const placement = JSON.parse(context.PLACEMENT_OPTIONS);
      if (placement.ENTITY_TYPE_ID === 2) {
        return 'company';
      } else if (placement.ENTITY_TYPE_ID === 1) {
        return 'lead';
      }
    }
    return 'company'; // Default
  }
}

export default new Bitrix24Service();
