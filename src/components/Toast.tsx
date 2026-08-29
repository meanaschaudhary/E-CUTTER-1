import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const Icon =
    toast.type === 'success'
      ? CheckCircle2
      : toast.type === 'error'
      ? AlertCircle
      : Info;

  const bgStyles =
    toast.type === 'success'
      ? 'bg-slate-900 text-white border-emerald-500/40'
      : toast.type === 'error'
      ? 'bg-red-900 text-white border-red-500/50'
      : 'bg-slate-900 text-white border-blue-500/40';

  const iconStyles =
    toast.type === 'success'
      ? 'text-emerald-400'
      : toast.type === 'error'
      ? 'text-red-400'
      : 'text-blue-400';

  return (
    <div
      className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-center justify-between space-x-3 text-xs animate-in slide-in-from-bottom-2 ${bgStyles}`}
    >
      <div className="flex items-center space-x-2.5 min-w-0">
        <Icon className={`w-4 h-4 shrink-0 ${iconStyles}`} />
        <span className="font-semibold truncate">{toast.text}</span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-white p-1"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
