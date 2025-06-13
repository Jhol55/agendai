import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; 
import { getContacts, getCustomAttributes, updateContactCustomAttribute } from '../services/chatwoot-api';

export interface Contact {
  id: string;
  name: string;
  custom_attributes?: Record<string, string>;
  [key: string]: unknown;
}

export interface CustomAttribute {
  id: number;
  attribute_key: string;
  attribute_display_name: string;
  attribute_display_type: 'list' | 'text' | 'number' | 'date';
  attribute_values?: string[];
  default_value?: string;
}

export interface SelectedAttribute {
  attribute_key: string;
  attribute_values: string[];
}

export function useDynamicKanbanData(reloadFlag = 0) {
  // Use Next.js useRouter and useSearchParams
  const router = useRouter(); // To potentially navigate or get pathname, though not directly used for search params here
  const searchParams = useSearchParams(); // To read query parameters

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [attribute, setAttribute] = useState<SelectedAttribute | null>(null);
  const [listAttributes, setListAttributes] = useState<CustomAttribute[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const lastParamRef = useRef<string | null>(null);
  const lastAttributeKeyRef = useRef<string | null>(null);

  const columns = useMemo<string[]>(() => {
    if (!attribute) return [];
    return attribute.attribute_values || [];
  }, [attribute]);

  const displayNames = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    listAttributes.forEach(attr => {
      map[attr.attribute_key] = attr.attribute_display_name || attr.attribute_key;
    });
    return map;
  }, [listAttributes]);

  useEffect(() => {
    // Get the 'kbw' parameter using useSearchParams
    const param = searchParams.get('kbw'); // <-- Changed here

    if (lastParamRef.current === param) {
      return;
    }
    lastParamRef.current = param;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        let attrs: CustomAttribute[] = [];
        let selectedAttr: CustomAttribute | null = null;

        attrs = await getCustomAttributes() as CustomAttribute[];
        const validListAttrs = attrs.filter(
          a => a.attribute_display_type === 'list' && a.attribute_values?.length
        );
        setListAttributes(validListAttrs);

        if (param) {
          selectedAttr = attrs.find(
            a => a.attribute_display_type === 'list' && a.attribute_key === param
          ) || null;
        }

        if (!selectedAttr) {
          selectedAttr = attrs.find(
            a => a.attribute_display_type === 'list' && a.attribute_key.startsWith('kbw_')
          ) || null;
        }

        if (!selectedAttr) {
          selectedAttr = attrs.find(a => a.attribute_display_type === 'list') || null;
        }

        if (!selectedAttr) {
          throw new Error('Nenhum atributo tipo lista encontrado.');
        }

        const contactsData: Contact[] = await getContacts();
        setContacts(contactsData);

        if (lastAttributeKeyRef.current !== selectedAttr.attribute_key) {
          setAttribute({
            attribute_key: selectedAttr.attribute_key,
            attribute_values: selectedAttr.attribute_values || []
          });
          lastAttributeKeyRef.current = selectedAttr.attribute_key;
        } else {
        }

      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error('[DEBUG] Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [searchParams, reloadFlag]); // <-- searchParams is now the dependency

  return { contacts, columns, attribute, listAttributes, displayNames, loading, error };
}

export function useUpdateContactAttribute(
  onSuccess: () => void,
  attribute: SelectedAttribute | null,
  contactsFromHook: Contact[]
) {
  const [updating, setUpdating] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<Error | null>(null);

  const updateContactAttribute = useCallback(async (
    contactId: string,
    attributeKey: string,
    value: string | undefined
  ) => {
    if (typeof value === 'undefined') {
      setUpdating(true);
      setUpdateError(null);
      try {
        let contactToUpdate: Contact | undefined;

        if (Array.isArray(contactsFromHook)) {
          contactToUpdate = contactsFromHook.find(c => c.id === contactId);
        }

        if (!contactToUpdate) {
          const allContacts = await getContacts() as Contact[];
          contactToUpdate = allContacts.find(c => c.id === contactId);
        }

        if (!contactToUpdate) {
          throw new Error(`Contact with ID ${contactId} not found.`);
        }

        const customAttrs = { ...(contactToUpdate.custom_attributes || {}) };
        delete customAttrs[attributeKey];

        await updateContactCustomAttribute(contactId, '', customAttrs);

        if (typeof onSuccess === 'function') {
          onSuccess();
        }
      } catch (error: unknown) {
        setUpdateError(error instanceof Error ? error : new Error(String(error)));
        console.error('[DEBUG] Erro ao remover atributo do contato:', error);
      } finally {
        setUpdating(false);
      }
      return;
    }

    if (!attribute?.attribute_values?.includes(value)) {
      const errMsg = `[DEBUG] Valor inválido para coluna: "${value}". Valores permitidos: ${JSON.stringify(attribute?.attribute_values)}`;
      setUpdateError(new Error(errMsg));
      console.error(errMsg);
      return;
    }

    setUpdating(true);
    setUpdateError(null);
    try {
      await updateContactCustomAttribute(contactId, attributeKey, value);
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (error: unknown) {
      setUpdateError(error instanceof Error ? error : new Error(String(error)));
      console.error('[DEBUG] Erro ao atualizar atributo do contato:', error);
    } finally {
      setUpdating(false);
    }
  }, [onSuccess, attribute, contactsFromHook]);

  return { updateContactAttribute, updating, updateError };
}

export function useKanbanData() {
  const [reloadFlag, setReloadFlag] = useState<number>(0);

  const { contacts, columns, attribute, listAttributes, displayNames, loading, error } = useDynamicKanbanData(reloadFlag);
  const reloadKanban = useCallback(() => setReloadFlag(f => f + 1), []);

  const { updateContactAttribute, updating, updateError } = useUpdateContactAttribute(reloadKanban, attribute, contacts);

  return {
    contacts,
    columns,
    attribute,
    listAttributes,
    displayNames,
    loading,
    error,
    updateContactAttribute,
    updating,
    updateError,
    reloadKanban
  };
}