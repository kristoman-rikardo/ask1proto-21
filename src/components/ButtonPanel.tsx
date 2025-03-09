
import React from 'react';
import { Loader } from 'lucide-react';
import { usePulsatingButton } from '@/hooks/usePulsatingButton';

interface Button {
  name: string;
  request: any;
}

interface ButtonPanelProps {
  buttons: Button[];
  isLoading: boolean;
  onButtonClick: (button: Button) => void;
}

const ButtonPanel: React.FC<ButtonPanelProps> = ({ 
  buttons, 
  isLoading, 
  onButtonClick 
}) => {
  // Use our custom hook for the pulsating button effect
  const pulsatingButton = usePulsatingButton({ 
    itemsCount: buttons.length,
    interval: 5000, // Less frequent to avoid distracting animations
    pulsationChance: 0.6  // Lower chance of pulsation
  });

  // Loading state component
  const LoadingIndicator = () => (
    <div className="h-[120px] flex items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <Loader className="w-8 h-8 text-gray-600 animate-spin" />
        <span className="text-sm text-gray-500 mt-2 font-medium">Loading options...</span>
      </div>
    </div>
  );

  // Button list component with stable layout
  const ButtonList = () => (
    <div className="h-[120px] grid grid-cols-2 gap-3 p-3 content-start overflow-hidden">
      {buttons.map((button, index) => (
        <button
          key={button.name} // More stable key to prevent respawning
          onClick={() => onButtonClick(button)}
          className={`choice-button whitespace-normal text-left transition-all duration-300 
            ${pulsatingButton === index ? 'shadow-md scale-[1.02]' : ''}`}
        >
          {button.name}
        </button>
      ))}
    </div>
  );

  return (
    <div className="w-full bg-gray-50 border-t border-gray-200 p-3">
      {isLoading ? <LoadingIndicator /> : <ButtonList />}
    </div>
  );
};

export default ButtonPanel;
