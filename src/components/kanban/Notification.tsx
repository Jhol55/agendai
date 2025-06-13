import React from 'react';

type NotificationProps = {
  type: 'error' | 'success';
  message: string;
};

export default function Notification({ type, message }: NotificationProps) {
  const styles: Record<NotificationProps['type'], string> = {
    error: 'bg-red-100 border border-red-400 text-red-700',
    success: 'bg-green-100 border border-green-400 text-green-700',
  };

  return (
    <div className={`p-4 mb-4 rounded ${styles[type]}`} role="alert">
      <strong className="font-bold">
        {type === 'error' ? 'Erro:' : 'Sucesso:'}{' '}
      </strong>
      <span>{message}</span>
    </div>
  );
}
