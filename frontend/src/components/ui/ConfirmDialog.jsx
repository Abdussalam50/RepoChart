import React, { useState } from 'react';
import { Button } from './Button';

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Konfirmasi',
  onConfirm,
  onCancel,
  danger = false,
  requireTypeToDelete = false
}) {
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <h3 className={`text-xl font-semibold mb-2 ${danger ? 'text-red-600' : 'text-slate-900'}`}>
          {title}
        </h3>
        <p className="text-slate-600 mb-4 whitespace-pre-wrap">{message}</p>

        {requireTypeToDelete && (
          <div className="mb-4">
            <p className="text-sm text-slate-500 mb-2">
              Ketik <strong>DELETE</strong> untuk melanjutkan
            </p>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button
            className={danger ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
            onClick={onConfirm}
            disabled={requireTypeToDelete && input !== 'DELETE'}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
