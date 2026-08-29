import React from 'react';
import { Upload, Crop, Layers, Printer, Check } from 'lucide-react';

export type WorkflowStep = 'upload' | 'crop-front' | 'crop-back' | 'export';

interface WorkflowBarProps {
  currentStep: WorkflowStep;
  onStepClick: (step: WorkflowStep) => void;
  hasDocument: boolean;
  hasBackSide: boolean;
  hasCropped: boolean;
}

export const WorkflowBar: React.FC<WorkflowBarProps> = ({
  currentStep,
  onStepClick,
  hasDocument,
  hasBackSide,
  hasCropped,
}) => {
  const steps: Array<{
    id: WorkflowStep;
    num: string;
    label: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    enabled: boolean;
  }> = [
    {
      id: 'upload',
      num: '01',
      label: 'Upload Document',
      subtitle: 'PDF or Image',
      icon: Upload,
      enabled: true,
    },
    {
      id: 'crop-front',
      num: '02',
      label: '1. Crop Front Size',
      subtitle: 'Position Front Card',
      icon: Crop,
      enabled: hasDocument,
    },
    {
      id: 'crop-back',
      num: '03',
      label: '2. Crop Back Size',
      subtitle: 'Same PDF / Page',
      icon: Layers,
      enabled: hasDocument,
    },
    {
      id: 'export',
      num: '04',
      label: '3. Print & Export',
      subtitle: '100% Actual Scale',
      icon: Printer,
      enabled: hasDocument,
    },
  ];

  return (
    <div className="no-print bg-white border-b border-gray-200 px-4 sm:px-8 py-3 shrink-0 shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted =
            (step.id === 'upload' && hasDocument) ||
            (step.id === 'crop-front' && (currentStep === 'crop-back' || currentStep === 'export')) ||
            (step.id === 'crop-back' && currentStep === 'export' && hasBackSide);

          return (
            <React.Fragment key={step.id}>
              <button
                id={`step-button-${step.id}`}
                disabled={!step.enabled}
                type="button"
                onClick={() => onStepClick(step.id)}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold ring-1 ring-blue-700/20'
                    : isCompleted
                    ? 'text-gray-800 hover:bg-gray-50'
                    : step.enabled
                    ? 'text-gray-600 hover:bg-gray-50'
                    : 'text-gray-400 cursor-not-allowed opacity-50'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <span>{step.num}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold tracking-tight whitespace-nowrap">
                      {step.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-normal truncate hidden sm:block">
                    {step.subtitle}
                  </p>
                </div>
              </button>

              {idx < steps.length - 1 && (
                <div className="hidden md:block w-8 h-[1px] bg-gray-200 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
