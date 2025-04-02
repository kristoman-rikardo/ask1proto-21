
import React, { useState, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

interface ChatInputAreaProps {
  onSendMessage: (message: string) => void;
}

const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  onSendMessage
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const placeholder = "Spør om produktet...";
  
  React.useEffect(() => {
    if (inputValue.trim()) {
      setIsButtonVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsButtonVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [inputValue]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  return (
    <div className="w-full bg-transparent p-4">
      <div className="flex items-center space-x-2 relative">
        <input 
          ref={inputRef} 
          type="text" 
          value={inputValue} 
          onChange={e => setInputValue(e.target.value)} 
          onKeyPress={e => e.key === 'Enter' && handleSend()} 
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`flex-1 px-4 py-2 pr-10 font-light font-sans transition-all duration-300 
            rounded-2xl bg-gray-50/90 
            border border-gray-200 
            shadow-sm hover:shadow-md 
            focus:border-gray-300 focus:ring-2 focus:ring-gray-200/70 
            active:translate-y-[1px]
            ${isFocused ? 'bg-white' : ''}`} 
          style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 300 }}
        />
        
        <div 
          className={`absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-300 transform 
            ${isButtonVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
        >
          {!isButtonVisible && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm text-gray-600">
              Tenker<span className="dots-animation">...</span>
            </div>
          )}
          
          <button 
            onClick={handleSend}
            className="p-1.5 bg-gray-300 text-gray-600 rounded-full 
                     transition-all duration-200 transform hover:scale-110 active:scale-90
                     hover:bg-gray-300 active:shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-gray-300/50"
            aria-label="Send message"
          >
            <ArrowRight size={14} className="transform transition-transform duration-300 -rotate-45" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInputArea;
