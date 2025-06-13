// KanbanBoard.tsx
import React, { useEffect, useReducer, useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { kanbanReducer, Contact, BoardState } from '../../reducers/useKanbanReducer';
import Notification from '@/components/kanban/Notification';
import ErrorMessage from '@/components/kanban/ErrorMessage';
import { useKanbanData, CustomAttribute, SelectedAttribute } from '../../hooks/useKanbanData';
import KanbanColumn from '@/components/kanban/KanbanColumn';
// IMPORTS FOR NEXT.JS ROUTING
import { useRouter, useSearchParams } from 'next/navigation'; // <-- Changed here
import { getCustomAttributes } from '../../services/chatwoot-api';

interface NotificationState {
  type: 'error' | 'success';
  message: string;
}

function KanbanBoard() {
  const {
    contacts,
    columns,
    attribute,
    loading,
    error,
    updateContactAttribute,
    listAttributes,
    displayNames,
  } = useKanbanData();

  const [board, dispatch] = useReducer(kanbanReducer, {} as BoardState);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  // USE NEXT.JS ROUTER AND SEARCH PARAMS
  const router = useRouter(); // <-- Changed here
  const searchParams = useSearchParams(); // <-- Changed here

  const [attrDisplayNames, setAttrDisplayNames] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    async function fetchDisplayNames() {
      const defs: CustomAttribute[] = await getCustomAttributes();
      const map: Record<string, string> = {};
      defs.forEach((def) => {
        if (def.attribute_key && def.attribute_key.startsWith('kbw_')) {
          map[def.attribute_key] = def.attribute_display_name || def.attribute_key;
        }
      });
      if (mounted) setAttrDisplayNames(map);
    }
    fetchDisplayNames();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!loading && contacts.length && columns.length && attribute) {
      const organized: BoardState = columns.reduce((acc: BoardState, col: string) => {
        acc[col] = [];
        return acc;
      }, { "Não definido": [] });

      contacts.forEach((contact) => {
        const value = contact.custom_attributes?.[attribute.attribute_key] ?? "Não definido";
        if (!organized[value]) {
          organized[value] = [];
        }
        organized[value].push(contact);
      });

      dispatch({ type: 'INIT', payload: organized });
    }
  }, [contacts, columns, attribute, loading]);

  const onDragEnd = async ({ source, destination }: DropResult) => {
    if (!destination) return;

    const sourceList = Array.from(board[source.droppableId]);
    const [moved] = sourceList.splice(source.index, 1);
    const destList = Array.from(board[destination.droppableId] || []);
    destList.splice(destination.index, 0, moved);

    const prevBoard = JSON.parse(JSON.stringify(board));
    dispatch({
      type: 'MOVE_CARD',
      payload: {
        source: source.droppableId,
        destination: destination.droppableId,
        contact: moved,
      },
    });

    try {
      if (!attribute?.attribute_key) {
        throw new Error("Attribute key is undefined.");
      }
      const newValue = destination.droppableId === "Não definido" ? undefined : destination.droppableId;
      await updateContactAttribute(moved.id, attribute.attribute_key, newValue);
    } catch (err: unknown) {
      let errorMessage = "Um erro desconhecido ocorreu.";
      if (err instanceof Error) {
        errorMessage = `Erro ao atualizar estágio: ${err.message}`;
      } else if (typeof err === 'string') {
        errorMessage = `Erro ao atualizar estágio: ${err}`;
      }
      setNotification({ type: 'error', message: errorMessage });
      dispatch({ type: 'INIT', payload: prevBoard });
      console.error('[KanbanBoard] Falha ao atualizar estágio:', err);
    }
  };

  const handleAttributeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newKey = e.target.value;
    // Create new search params based on the current ones
    const currentParams = new URLSearchParams(searchParams.toString()); // <-- Changed here
    currentParams.set('kbw', newKey);

    // Use router.push to navigate and update the URL query parameters
    router.push(`?${currentParams.toString()}`); // <-- Changed here
  };

  if (loading) return <div className="p-4">Carregando Kanban...</div>;
  if (error) return <ErrorMessage message={`Erro ao carregar dados: ${error.message}`} />;
  if (!attribute?.attribute_key) return <ErrorMessage message="Nenhum atributo customizado do tipo lista encontrado ou atributo inválido." />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {notification && <Notification type={notification.type} message={notification.message} />}

      <div className="mb-4">
        <label htmlFor="attribute-select" className="block text-sm font-medium text-gray-700 mb-1">
          Selecione o atributo:
        </label>
        <select
          id="attribute-select"
          value={attribute?.attribute_key}
          onChange={handleAttributeChange}
          className="border border-gray-300 rounded p-2"
        >
          {listAttributes.map((attr: CustomAttribute) => (
            <option key={attr.attribute_key} value={attr.attribute_key}>
              {attr.attribute_display_name || attr.attribute_key}
            </option>
          ))}
        </select>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto">
          {["Não definido", ...columns].map((col) => (
            <KanbanColumn
              key={col}
              stage={col}
              contacts={board[col] || []}
              attrDisplayNames={displayNames}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default KanbanBoard;