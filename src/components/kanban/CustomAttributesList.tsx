// CustomAttributesList.tsx
import React from 'react';

interface CustomAttributesListProps {
  attributes: Record<string, string | number>;
  displayNames: Record<string, string>;
}

export default function CustomAttributesList({
  attributes,
  displayNames,
}: CustomAttributesListProps) {
  return (
    <div className="mt-2 text-xs text-gray-500">
      {Object.entries(attributes)
        .filter(([key, value]) => key.startsWith('kbw_') && value != null && value !== '')
        .map(([key, value]) => (
          <div key={key} className="truncate" title={String(value)}>
            <span className="font-semibold">{displayNames[key] || key.replace('kbw_', '')}: </span>
            <span>
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
    </div>
  );
}
