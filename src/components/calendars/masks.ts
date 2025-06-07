// src/lib/masks.ts

// ... (todas as funções formatCpf, cleanCpf, formatCnpj, cleanCnpj, etc., permanecem as mesmas) ...

import { MaskType } from '@/components/calendars/types'; // Importa o novo tipo

/**
 * Função utilitária para aplicar a formatação da máscara.
 * @param value O valor atual do campo.
 * @param maskType O tipo de máscara a ser aplicada (do BaseFormField.mask).
 * @returns O valor formatado.
 */
export const applyMask = (value: string, maskType?: MaskType): string => {
  if (value === undefined || value === null) return ''; // Garante que o valor não é null/undefined
  const stringValue = String(value); // Converte para string para as operações de máscara

  switch (maskType) {
    case 'cpf':
      return formatCpf(stringValue);
    case 'cnpj':
      return formatCnpj(stringValue);
    case 'phone':
      return formatPhone(stringValue);
    case 'currency':
      return formatCurrency(stringValue);
    case 'date':
      return formatDate(stringValue);
    case 'time':
      return formatTime(stringValue);
    // Para 'number', 'email', 'tel', 'url', 'password', 'text', não aplicamos formatação visual aqui
    default:
      return stringValue;
  }
};

/**
 * Função utilitária para limpar o valor de acordo com o tipo de máscara.
 * @param value O valor formatado.
 * @param maskType O tipo de máscara.
 * @returns O valor limpo.
 */
export const cleanValueByMask = (value: string, maskType?: MaskType): string | number => {
  if (value === undefined || value === null) return ''; // Garante que o valor não é null/undefined
  const stringValue = String(value); // Converte para string para as operações de limpeza

  switch (maskType) {
    case 'cpf':
      return cleanCpf(stringValue);
    case 'cnpj':
      return cleanCnpj(stringValue);
    case 'phone':
      return cleanPhone(stringValue);
    case 'currency':
      // Para moeda, limpa para dígitos. Se o seu Zod espera um Number, converta aqui.
      // Ex: return parseFloat(cleanCurrency(stringValue)) / 100;
      return cleanCurrency(stringValue);
    case 'date':
      return cleanDate(stringValue);
    case 'time':
      return cleanTime(stringValue);
    case 'number':
      // Para inputType='number', queremos o valor como Number ou string vazia
      const cleanedNumber = stringValue.replace(/[^0-9.-]/g, ''); // Permite dígitos, ponto e traço para negativos/decimais
      return cleanedNumber === '' ? '' : Number(cleanedNumber);
    // Para 'email', 'tel', 'url', 'password', 'text', o valor já está "limpo" para o propósito do React Hook Form
    default:
      return stringValue;
  }
};

// ... (todas as funções formatXxx e cleanXxx individuais permanecem as mesmas) ...

// **Funções de formatação individuais (mantidas para clareza)**
export const formatCpf = (value: string): string => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, ''); // Remove tudo que não é dígito
  return cleaned
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export const cleanCpf = (value: string): string => {
  return value ? value.replace(/\D/g, '') : '';
};

export const formatCnpj = (value: string): string => {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '');
    return cleaned
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
};

export const cleanCnpj = (value: string): string => {
    return value ? value.replace(/\D/g, '') : '';
};

export const formatPhone = (value: string): string => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 10) {
    return cleaned.replace(/^(\d{2})(\d{4})(\d)/, '($1) $2-$3');
  }
  return cleaned.replace(/^(\d{2})(\d{5})(\d)/, '($1) $2-$3');
};

export const cleanPhone = (value: string): string => {
  return value ? value.replace(/\D/g, '') : '';
};

export const formatCurrency = (value: string): string => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  if (cleaned === '') return '';

  const intValue = parseInt(cleaned, 10);
  if (isNaN(intValue)) return '';

  const floatValue = intValue / 100;

  return floatValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const cleanCurrency = (value: string): string => {
  if (!value) return '';
  return value.replace(/R\$\s?/, '').replace(/\./g, '').replace(/,/g, '');
};

export const formatDate = (value: string): string => {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '');
    return cleaned
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1$2');
};

export const cleanDate = (value: string): string => {
    return value ? value.replace(/\D/g, '') : '';
};

export const formatTime = (value: string): string => {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '');
    return cleaned
        .replace(/(\d{2})(\d)/, '$1:$2');
};

export const cleanTime = (value: string): string => {
    return value ? value.replace(/\D/g, '') : '';
};