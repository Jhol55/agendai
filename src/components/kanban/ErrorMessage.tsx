// ErrorMessage.tsx
import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
    >
      <strong className="font-bold">Erro: </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
}
