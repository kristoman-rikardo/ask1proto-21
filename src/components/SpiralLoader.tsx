
import React, { useState, useEffect } from 'react';

interface SpiralLoaderProps {
  phrases?: string[];
  interval?: number;
  size?: 'small' | 'medium' | 'large';
}

const SpiralLoader: React.FC<SpiralLoaderProps> = ({ 
  phrases = [
    "Funderer...",
    "Undrer...",
    "Krekulerer...",
    "Ressonerer...",
    "Legger sammen to og to...",
    "Grubler intenst...",
    "Tenker i sirkler...",
    "Filosoferer...",
    "Pønsker ut noe lurt...",
  ],
  interval = 3000,
  size = 'medium'
}) => {
  const [currentPhrase, setCurrentPhrase] = useState(phrases[0]);
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      index = (index + 1) % phrases.length;
      setCurrentPhrase(phrases[index]);
    }, interval);
    
    return () => clearInterval(timer);
  }, [phrases, interval]);

  // Size mapping for the container - making all sizes smaller
  const sizeClasses = {
    small: 'w-20 h-20',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  // Size mapping for the text - also smaller
  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-xs',
    large: 'text-sm'
  };

  // Size mapping for the circles - making all circles smaller
  const getCircleStyle = (index: number) => {
    const sizes = {
      small: [4, 3, 2, 5, 3, 4, 4],
      medium: [6, 5, 4, 7, 5, 6, 6],
      large: [10, 8, 6, 12, 7, 9, 11]
    };
    
    const baseSize = sizes[size][index % sizes[size].length];
    
    return {
      width: `${baseSize}px`,
      height: `${baseSize}px`
    };
  };

  return (
    <div className={`relative ${sizeClasses[size]} mx-auto`}>
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${textSizeClasses[size]} text-gray-700 font-light animate-pulse text-center w-full`}>
        {currentPhrase}
      </div>
      <div className="spiral w-full h-full">
        {[...Array(7)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-black/30 animate-random-orbit"
            style={{
              ...getCircleStyle(i),
              animationDuration: `${2 + (i * 0.3)}s`,
              animationDelay: `${i * 0.2}s`,
              top: `${15 + (i * 10)}%`,
              left: `${20 + (i * 8)}%`,
              animationDirection: i % 2 === 0 ? 'normal' : 'reverse'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SpiralLoader;
