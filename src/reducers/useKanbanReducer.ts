// kanbanReducer.ts


export interface Contact {
  id: string;
  name: string; 
  custom_attributes?: Record<string, string>;
  [key: string]: unknown;
}

export interface BoardState {
  [key: string]: Contact[]; 
}


export type KanbanAction =
  | { type: 'INIT'; payload: BoardState } 
  | { type: 'MOVE_CARD'; payload: { source: string; destination: string; contact: Contact } }; 


export function kanbanReducer(state: BoardState, action: KanbanAction): BoardState {
  switch (action.type) {
    case 'INIT': {
      // Ensure the payload is an object and not null, then return it.
      // This helps in initial state setup or resetting the board.
      return typeof action.payload === 'object' && action.payload !== null
        ? action.payload
        : state;
    }

    case 'MOVE_CARD': {
      const { source, destination, contact } = action.payload;

      const newState: BoardState = {
        ...state,
        // Ensure that source and destination arrays always exist, even if empty.
        // This prevents issues if a column is new or temporarily empty.
        [source]: [...(state[source] || [])],
        [destination]: [...(state[destination] || [])],
      };

      // Remove the contact from the source column.
      newState[source] = newState[source].filter(c => c.id !== contact.id);

      // It looks like you're removing the contact from the destination
      // before adding it. This line is usually not needed if the contact
      // is guaranteed to not be in the destination before the move.
      // However, if a contact could somehow appear in multiple lists,
      // keeping this line ensures it's only in one place after the move.
      // For a typical Kanban, it's usually enough to just add it.
      // I'll keep it as it was in your original JS, but you might review this.
      newState[destination] = newState[destination].filter(c => c.id !== contact.id);

      // Add the contact to the destination column.
      newState[destination].push(contact);

      return newState;
    }

    default:
      // For any unhandled action type, return the current state.
      return state;
  }
}