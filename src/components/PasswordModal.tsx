import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, Eye, EyeOff, X } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  fileName: string;
  errorMessage?: string;
  isLoading: boolean;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  fileName,
  errorMessage,
  isLoading,
  onSubmit,
  onCancel,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    onSubmit(password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                PDF Password Required
              </h3>
              <p className="text-xs text-gray-500 truncate max-w-[220px]">
                {fileName}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-xs text-gray-600 mb-4">
            Your PDF is password protected. Enter the password to continue.
          </p>

          {/* Password Input */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Enter PDF Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="pdf-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                autoFocus
                disabled={isLoading}
                className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700 font-mono tracking-wide"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Helper Tips for Indian Documents */}
          <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-xl text-[11px] text-gray-600 space-y-1">
            <p className="font-semibold text-gray-800">Common password formats:</p>
            <p>&bull; <strong>e-Aadhaar:</strong> First 4 letters of name in CAPITAL + 4-digit Birth Year (e.g., <code className="bg-gray-200 px-1 py-0.5 rounded font-mono">ANAS1996</code>)</p>
            <p>&bull; <strong>e-PAN / Bank:</strong> Date of birth (DDMMYYYY) or Pin Code</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5">
            <button
              id="btn-password-cancel"
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-password-unlock"
              type="submit"
              disabled={isLoading || !password.trim()}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-lg shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Decrypting...</span>
                </>
              ) : (
                <span>Unlock PDF</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
