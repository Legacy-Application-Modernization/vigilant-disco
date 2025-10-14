import type { FC } from 'react';
import type { ConversionStep } from '../../types/conversion';

interface ConversionStepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const ConversionStepper: FC<ConversionStepperProps> = ({ currentStep, onStepClick }) => {
  const steps: ConversionStep[] = [
    { number: 1, title: 'Upload PHP Files', subtitle: 'Select your PHP source code' },
    { number: 2, title: 'Code Analysis', subtitle: 'AI analyzes patterns & dependencies' },
    { number: 3, title: 'Transformation', subtitle: 'Convert PHP to Node.js' },
    { number: 4, title: 'Review & Edit', subtitle: 'Validate transformed code' },
    { number: 5, title: 'Export', subtitle: 'Download your Node.js project' },
  ];

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute left-0 right-0 h-px bg-gray-300" />
        
        {/* Steps */}
        {steps.map((step) => (
          <div 
            key={step.number} 
            className="flex flex-col items-center z-10" 
            onClick={() => onStepClick(step.number)}
          >
            {/* Step Circle */}
            <div 
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold mb-2 transition-all cursor-pointer
                ${currentStep === step.number 
                  ? 'bg-emerald-500 text-white' 
                  : currentStep > step.number 
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-400'}`}
            >
              {step.number}
            </div>
            
            {/* Step Text */}
            <div className="text-center">
              <div 
                className={`font-medium ${currentStep === step.number ? 'text-gray-900' : 'text-gray-500'}`}
              >
                {step.title}
              </div>
              <div className="text-xs text-gray-500">
                {step.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversionStepper;