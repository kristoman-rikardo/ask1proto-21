
import React, { useRef, useEffect, useState } from 'react';
import { parseMarkdown } from '@/lib/voiceflow';
import TypingIndicator from '../TypingIndicator';
import { Message } from '@/hooks/useChatSession';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
}

// Component for message feedback
const MessageFeedback = ({
  messageId
}: {
  messageId: string;
}) => {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  useEffect(() => {
    // Check for existing feedback when component mounts
    const existingFeedback = JSON.parse(localStorage.getItem('messageFeedback') || '{}');
    if (existingFeedback[messageId]) {
      setFeedback(existingFeedback[messageId]);
    }
  }, [messageId]);
  const handleFeedback = (type: 'positive' | 'negative') => {
    // Toggle feedback if already selected
    const newFeedback = feedback === type ? null : type;
    setFeedback(newFeedback);

    // Store feedback in localStorage
    const existingFeedback = JSON.parse(localStorage.getItem('messageFeedback') || '{}');
    if (newFeedback === null) {
      delete existingFeedback[messageId];
    } else {
      existingFeedback[messageId] = newFeedback;
    }
    localStorage.setItem('messageFeedback', JSON.stringify(existingFeedback));
    console.log(`Feedback for message ${messageId}: ${newFeedback || 'removed'}`);
  };
  return <div className="flex flex-col gap-2 absolute right-2 top-1/2 -translate-y-1/2">
      <button onClick={() => handleFeedback('positive')} className="p-1 hover:scale-110 transition-all duration-200" aria-label="Thumbs up">
        <ThumbsUp size={18} className={`${feedback === 'positive' ? 'text-green-500' : 'text-gray-300'} hover:text-green-500`} />
      </button>
      <button onClick={() => handleFeedback('negative')} className="p-1 hover:scale-110 transition-all duration-200" aria-label="Thumbs down">
        <ThumbsDown size={18} className={`${feedback === 'negative' ? 'text-red-500' : 'text-gray-300'} hover:text-red-500`} />
      </button>
    </div>;
};
const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isTyping
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] px-[8px] py-[8px] mx-[4px] my-[4px] rounded-none">
      {messages.map((message, index) => <div key={message.id} id={`message-${message.id}`} ref={index === messages.length - 1 ? lastMessageRef : null} className={`px-4 py-3 rounded-xl max-w-[85%] relative ${message.type === 'user' ? 'chat-message-user ml-auto bg-gray-200' : 'chat-message-agent mr-auto shadow-md bg-[#FAFAFA]'}`}>
          <div dangerouslySetInnerHTML={{
        __html: parseMarkdown(message.content || '')
      }} className={message.type === 'agent' ? 'prose prose-sm' : 'bg-stone-200'} />
          {message.type === 'agent' && <MessageFeedback messageId={message.id} />}
        </div>)}
      
      {isTyping && <TypingIndicator />}
      
      <div ref={messagesEndRef} />
    </div>;
};
export default ChatMessages;
