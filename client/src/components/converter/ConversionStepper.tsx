import type { FC } from 'react';
import type { ConversionStep } from '../../types/conversion';

interface ConversionStepperProps {
  currentStep: number;
  completedSteps: number[]; // Array of completed step numbers
  onStepClick: (step: number) => void;
}

const ConversionStepper: FC<ConversionStepperProps> = ({ currentStep, completedSteps, onStepClick }) => {
  const steps: ConversionStep[] = [
    { number: 1, title: 'Upload PHP Files', subtitle: 'Select your PHP source code' },
    { number: 2, title: 'Code Analysis', subtitle: 'AI analyzes patterns & dependencies' },
    { number: 3, title: 'Transformation', subtitle: 'Convert PHP to Node.js' },
    { number: 4, title: 'Export', subtitle: 'Download your Node.js project' },
  ];

  const isStepAccessible = (stepNumber: number) => {
    // Step is accessible if it's completed or it's the current step
    return completedSteps.includes(stepNumber) || stepNumber === currentStep;
  };

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute left-0 right-0 h-px bg-gray-300" />
        
        {/* Steps */}
        {steps.map((step) => {
          const accessible = isStepAccessible(step.number);
          const completed = completedSteps.includes(step.number);
          
          return (
          <div 
            key={step.number} 
            className="flex flex-col items-center z-10" 
            onClick={() => accessible && onStepClick(step.number)}
          >
            {/* Step Circle */}
            <div 
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold mb-2 transition-all
                ${accessible ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-60'}
                ${currentStep === step.number 
                  ? 'bg-emerald-500 text-white' 
                  : completed 
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
          );
        })}
      </div>
    </div>
  );
};

export default ConversionStepper;