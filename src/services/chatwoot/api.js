
import { api } from "../api";


export async function getContacts() {
  console.log('api.js: getContacts chamado');
  try {
    const data = await api(true).get('chatwoot?endpoint=contacts');
    return data.payload || [];
  } catch (error) {
    console.error('Erro ao buscar contatos:', error);
    throw error;
  }
}

/**
 * Retorna todos os atributos customizados (lista) apenas do tipo contact_attribute.
 */
export async function getCustomAttributes() {
  console.log('api.js: getCustomAttributes chamado');
  try {
    const data = await api().get('chatwoot?endpoint=custom_attribute_definitions');
    const all = data.payload || data || [];
    const filtered = Array.isArray(all)
      ? all.filter(attr => attr.attribute_model === 'contact_attribute')
      : [];
    return filtered;
  } catch (error) {
    console.error('Erro ao buscar atributos customizados:', error);
    throw error;
  }
}

/**
 * Retorna um atributo customizado específico pelo ID.
 */
export async function getCustomAttributeById(id) {
  console.log('api.js: getCustomAttributeById chamado', id);
  try {
    const data = await api().get(`chatwoot?endpoint=custom_attribute_definitions/${id}`);
    return data.payload || data;
  } catch (error) {
    console.error('Erro ao buscar atributo customizado por ID:', error);
    throw error;
  }
}

/**
 * Atualiza o valor de um atributo customizado do contato.
 */
export async function updateContactCustomAttribute(contactId, attributeKey, value) {
  console.log('api.js: updateContactCustomAttribute chamado', contactId, attributeKey, value);
  try {
    return await api().put(`chatwoot?contacts/${contactId}`, { custom_attributes: { [attributeKey]: value } });
  } catch (error) {
    console.error('Erro ao atualizar atributo customizado:', error);
    throw error;
  }
}