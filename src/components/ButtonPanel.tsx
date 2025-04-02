
import React from 'react';

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
  // Log button state changes
  React.useEffect(() => {
    if (buttons.length > 0) {
      console.log(`📱 ButtonPanel rendering ${buttons.length} buttons`);
    }
  }, [buttons]);
  
  // Custom loader component with updated animation
  const LoadingIndicator = () => (
    <div className="h-[80px] flex flex-col items-center justify-center">
      <div className="loader"></div>
      <p className="text-gray-500 mt-2 text-sm font-light">Laster spørsmål...</p>
    </div>
  );

  // Sparkle SVG icon
  const SparkleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
      fill="currentColor" className="size-5 inline-block ml-1 text-gray-400">
      <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785
              l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238
              1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192
              -.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785l-.238
              -1.192ZM6.949 5.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1
              -.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.684a1 1 0 0 1
              .633.632l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1
              .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1
              -.633-.633L6.95 5.684ZM13.949 13.684a1 1 0 0 0-1.898 0l-.184
              .551a1 1 0 0 1-.632.633l-.551.183a1 1 0 0 0 0 1.898l.551.183a1 1
              0 0 1 .633.633l.183.551a1 1 0 0 0 1.898 0l.184-.551a1 1 0 0 1
              .632-.633l.551-.183a1 1 0 0 0 0-1.898l-.551-.184a1 1 0 0 1
              -.633-.632l-.183-.551Z" />
    </svg>
  );

  // Updated ButtonList with improved padding and spacing
  const ButtonList = () => (
    <div className="flex flex-wrap gap-2 px-4 py-2 content-start">
      {buttons.map((button, index) => (
        <button 
          key={`button-${index}-${button.name.substring(0, 10)}`} 
          onClick={() => onButtonClick(button)} 
          title={button.name} 
          className="choice-button whitespace-nowrap overflow-hidden text-ellipsis transition-all 
                   duration-300 text-base text-left rounded-2xl 
                   px-4 py-2.5 border border-gray-100 shadow-sm hover:shadow-md
                   hover:bg-gray-100 max-w-full bg-gray-50"
          style={{ maxWidth: '100%' }}
        >
          {button.name}
          <SparkleIcon />
        </button>
      ))}
    </div>
  );
  
  return (
    <div className="w-full bg-transparent border-t border-transparent p-0 relative">
      {isLoading ? <LoadingIndicator /> : buttons.length > 0 ? <ButtonList /> : <div className="h-[5px]"></div>}
    </div>
  );
};

export default ButtonPanel;
