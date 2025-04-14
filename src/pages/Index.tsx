import React from 'react';
import ChatInterface from '@/components/ChatInterface';

// Add interface for Index props
interface IndexProps {
  isEmbedded?: boolean;
}

const Index = ({ isEmbedded = false }: IndexProps) => {
  return (
    <div className={`ask-bg-transparent ask-overflow-hidden ask-flex ask-flex-col ask-p-4 ask-font-sans ${isEmbedded ? '' : 'ask-min-h-screen'}`}>
      <div className="ask-w-full ask-max-w-4xl ask-mx-auto ask-h-full ask-flex ask-flex-col">
        <div className="ask-w-full ask-flex-1 ask-flex ask-flex-col">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
};

export default Index;
