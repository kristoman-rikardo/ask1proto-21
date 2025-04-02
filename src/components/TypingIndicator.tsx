
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTypingAnimation } from '@/hooks/useTypingAnimation';
import { Loader } from 'lucide-react';

export interface TypingIndicatorProps {
  steps?: number;
  currentStep?: number;
  isTyping?: boolean;
  textStreamingStarted?: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  isTyping = true,
  textStreamingStarted = false,
  steps = 3,
  currentStep = 0
}) => {
  // If not typing, don't show anything
  if (!isTyping) return null;
  
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  
  // Updated loading messages in Norwegian
  const loadingMessages = [
    "Tenker...",
    "Resonnerer...",
    "Grubler...",
    "Henter informasjon...",
    "Samler kunnskap...",
    "Drøfter..."
  ];
  
  // Rotate through loading messages
  useEffect(() => {
    if (!textStreamingStarted) {
      const interval = setInterval(() => {
        setLoadingTextIndex(prev => (prev + 1) % loadingMessages.length);
      }, 2500);
      
      return () => clearInterval(interval);
    }
  }, [loadingMessages, textStreamingStarted]);

  const { currentProgress, visibleSteps, getCheckpointStatus } = useTypingAnimation({ 
    isTyping, 
    steps, 
    currentStep, 
    textStreamingStarted 
  });
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-start space-y-2"
    >
      <div className="flex items-center space-x-2 mb-1">
        <Loader size={16} className="animate-spin text-gray-600" />
        <span className="text-sm text-gray-600 font-medium">
          {loadingMessages[loadingTextIndex]}
        </span>
      </div>
      
      <div className="relative h-10 w-10">
        <svg className="w-full h-full" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r="20"
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            className="text-gray-200"
          />
          <motion.circle
            cx="22"
            cy="22"
            r="20"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={2 * Math.PI * 20} // 2πr where r=20
            strokeDashoffset={(2 * Math.PI * 20) * (1 - (currentProgress * 1.35) / 100)} // Multiply by 1.35 to start with 35% more progress
            fill="transparent"
            className="text-gray-500"
            transform="rotate(-90, 22, 22)" // Start from the top (12 o'clock)
            strokeLinecap="round"
            initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
            animate={{ 
              strokeDashoffset: textStreamingStarted 
                ? 0 
                : (2 * Math.PI * 20) * (1 - (currentProgress * 1.35) / 100)
            }}
            transition={{ 
              duration: 0.5,
              ease: "easeInOut" 
            }}
          />
        </svg>
      </div>
      
      {!textStreamingStarted && visibleSteps > 1 && (
        <div className="text-xs text-gray-500 mt-1">
          {getCheckpointStatus(currentStep) === 'loading' ? 
            `Steg ${currentStep + 1} av ${visibleSteps}` : 
            'Behandler forespørselen...'
          }
        </div>
      )}
    </motion.div>
  );
};

export default TypingIndicator;
