import { Contact, CustomAttribute } from '../hooks/useKanbanData'; // Ensure these types are imported from their source

// It's good practice to use NEXT_PUBLIC_ for client-side accessible env variables in Next.js
const CHATWOOT_URL = process.env.NEXT_PUBLIC_CHATWOOT_URL || '';
const ACCOUNT_ID = process.env.NEXT_PUBLIC_CHATWOOT_ACCOUNT_ID || '';
const TOKEN = process.env.NEXT_PUBLIC_CHATWOOT_TOKEN || '';

// Basic validation for environment variables
if (!CHATWOOT_URL) {
  console.error("Environment variable NEXT_PUBLIC_CHATWOOT_URL is not set.");
}
if (!ACCOUNT_ID) {
  console.error("Environment variable NEXT_PUBLIC_CHATWOOT_ACCOUNT_ID is not set.");
}
if (!TOKEN) {
  console.error("Environment variable NEXT_PUBLIC_CHATWOOT_TOKEN is not set.");
}


const chatwootHeaders = {
  'Content-Type': 'application/json',
  'api_access_token': TOKEN,
};

async function chatwootFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  // Ensure ACCOUNT_ID is present before attempting to construct the URL
  if (!ACCOUNT_ID) {
    throw new Error("Chatwoot ACCOUNT_ID is missing. Please check your environment variables.");
  }
  if (!CHATWOOT_URL) {
    throw new Error("Chatwoot URL is missing. Please check your environment variables.");
  }
  
  // Construct the full URL with the account ID
  const url = `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}${endpoint}`;
  console.error('chatwootFetch', url, options); // Using console.error for visibility during dev/debug

  try {
    const response = await fetch(url, { ...options, headers: chatwootHeaders });
    
    // Attempt to read response as text first, then parse as JSON
    const responseText = await response.text();
    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      // If parsing fails, use the raw text
      responseData = responseText;
    }

    if (!response.ok) {
      const errorDetails = {
        message: `Erro na API: ${url} ${response.status}`,
        status: response.status,
        url,
        method: options.method || 'GET',
        requestBody: options.body,
        headers: chatwootHeaders,
        response: responseData,
        stack: (new Error()).stack
      };
      console.error('Detalhes do erro Chatwoot:', errorDetails);
      const error = new Error(errorDetails.message);
      Object.assign(error, errorDetails); // Attach details to the error object
      throw error;
    }
    return responseData;
  } catch (error) {
    console.error('Erro na requisição Chatwoot:', error);
    throw error;
  }
}

// Retorna todos os contatos
export async function getContacts(): Promise<Contact[]> {
  try {
    const data = await chatwootFetch('/contacts');
    // Ensure data.payload exists and is an array of Contact, or default to an empty array
    return (data.payload || []) as Contact[]; 
  } catch (error) {
    console.error('Erro ao buscar contatos:', error);
    throw error;
  }
}

// Retorna todos os atributos customizados (lista) apenas do tipo contact_attribute
export async function getCustomAttributes(): Promise<CustomAttribute[]> {
  try {
    // Crucial fix: Add attribute_model=1 query parameter for contact attributes
    const data = await chatwootFetch('/custom_attribute_definitions?attribute_model=1');
    
    // Chatwoot API typically returns payload, but sometimes directly the array
    const allAttributes = data.payload || data;

    const filtered = Array.isArray(allAttributes)
      ? allAttributes.filter((attr: any) => attr.attribute_model === 'contact_attribute') as CustomAttribute[]
      : [];
    
    return filtered;
  } catch (error) {
    console.error('Erro ao buscar atributos customizados:', error);
    throw error;
  }
}

// Retorna um atributo customizado específico pelo ID
export async function getCustomAttributeById(id: number): Promise<CustomAttribute> {
  try {
    const data = await chatwootFetch(`/custom_attribute_definitions/${id}`);
    return (data.payload || data) as CustomAttribute; // Type assertion for safety
  } catch (error) {
    console.error(`Erro ao buscar atributo customizado por ID (${id}):`, error);
    throw error;
  }
}

// Atualiza o valor de um atributo customizado do contato
export async function updateContactCustomAttribute(
  contactId: string | number,
  attributeKeyOrFullCustomAttributes: string, 
  value?: string | null 
): Promise<string> {
  let body: { custom_attributes: string | Record<string, string | undefined | null> };

  if (typeof attributeKeyOrFullCustomAttributes === 'string') {
    body = {
      custom_attributes: {
        [attributeKeyOrFullCustomAttributes]: value
      }
    };
  } else {
    body = {
      custom_attributes: attributeKeyOrFullCustomAttributes
    };
  }

  try {
    return await chatwootFetch(`/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error(`Erro ao atualizar atributo customizado para contato ${contactId}:`, error);
    throw error;
  }
}