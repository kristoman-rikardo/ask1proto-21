
import { useRef, useEffect } from 'react';
import { Button } from '@/types/chat';
import { MessageStreamingHook } from '@/hooks/useMessageStreaming';
import { useCompletionEventHandler } from './useCompletionEventHandler';
import { useTextAndChoiceHandler } from './useTextAndChoiceHandler';
import { processContentStream } from '@/utils/streamingProcessUtils';
import { useStepProgressManager } from './useStepProgressManager';
import { useTextTraceManager } from './useTextTraceManager';
import { logTraceEvent } from '@/utils/traceLogger';

export function useTraceEventHandler(
  streaming: MessageStreamingHook,
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
  setButtons: React.Dispatch<React.SetStateAction<Button[]>>,
  setIsButtonsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setStepsTotal: React.Dispatch<React.SetStateAction<number>>,
  setCurrentStepIndex: React.Dispatch<React.SetStateAction<number>>
) {
  const receivedFirstTraceRef = useRef<boolean>(false);
  
  // Initialize our specialized managers
  const stepProgressManager = useStepProgressManager(setStepsTotal, setCurrentStepIndex);
  const textTraceManager = useTextTraceManager();
  
  const completionHandler = useCompletionEventHandler(
    streaming,
    setIsTyping
  );
  
  const processStreamCallback = (content: string, msgId: string) => {
    stepProgressManager.receivedFirstTextRef.current = true;
    
    // Clear timeout references when we start processing text
    stepProgressManager.clearProgressTimeouts();
    
    processContentStream(
      content, 
      msgId, 
      streaming.wordTrackerRef.current, 
      streaming.updatePartialMessage,
      completionHandler.streamingStateRef.current,
      () => {
        if (
          completionHandler.streamingStateRef.current.messageCompleted && 
          !completionHandler.streamingStateRef.current.isStreaming && 
          streaming.partialMessageIdRef.current
        ) {
          const currentMsgId = streaming.partialMessageIdRef.current;
          const finalText = streaming.wordTrackerRef.current.getCurrentProcessedText();
          streaming.updatePartialMessage(currentMsgId, finalText, false);
          streaming.partialMessageIdRef.current = null;
          completionHandler.streamingStateRef.current.isStreaming = false;
          completionHandler.streamingStateRef.current.waitingForMoreContent = false;
          streaming.currentCompletionContentRef.current = '';
        }
      }
    );
  };
  
  const textAndChoiceHandler = useTextAndChoiceHandler(
    streaming,
    setIsTyping,
    setButtons,
    setIsButtonsLoading,
    processStreamCallback
  );
  
  // Cleanup all timeouts
  useEffect(() => {
    return () => {
      stepProgressManager.clearProgressTimeouts();
      textTraceManager.clearTextTraceTimeouts();
    };
  }, []);
  
  const handleTraceEvent = (trace: any) => {
    const traceType = trace.type || 'unknown';
    
    // Log the trace with our utility
    logTraceEvent(traceType, trace.payload);
    
    if (trace.type === 'speak' || 
        trace.type === 'text' || 
        (trace.type === 'completion' && trace.payload?.state === 'start')) {
      receivedFirstTraceRef.current = true;
      
      // Clear timeout when we receive actual trace data
      stepProgressManager.clearProgressTimeouts();
      
      // Reset progress for every new message, not just the first one
      if (trace.type === 'completion' && trace.payload?.state === 'start') {
        stepProgressManager.resetProgressCircles();
      }
    }
    
    // Check for special block ID
    if (trace.type === 'block' && trace.payload?.blockID) {
      stepProgressManager.handleSpecialBlockId(trace.payload.blockID);
    }
    
    // Handle steps data if available
    if (!stepProgressManager.handleStepsFromPayload(trace.payload)) {
      // Set up progress timeouts if no steps data
      stepProgressManager.setupProgressTimeouts();
    }
    
    switch (trace.type) {
      case 'speak':
      case 'text':
        // Complete progress circles before starting text streaming
        completionHandler.streamingStateRef.current.messageCompleted = true;
        
        // Add a brief delay before showing the text to ensure circles complete
        textTraceManager.clearTextTraceTimeouts();
        
        textTraceManager.progressCompleteTimeoutRef.current = setTimeout(() => {
          textAndChoiceHandler.handleTextOrSpeakEvent(trace);
          stepProgressManager.receivedFirstTextRef.current = true;
        }, 500); // 500ms delay to show completed circles before text starts
        break;
      
      case 'completion':
        // Handle completion events
        if (trace.payload?.state === 'start') {
          // Always reset progress circles for new messages
          stepProgressManager.resetProgressCircles();
        }
        completionHandler.handleCompletionEvent(trace.payload);
        break;
      
      case 'choice':
        console.log('🔴 BUTTON TRACE RECEIVED:', trace.payload?.buttons?.length || 0, 'buttons');
        textAndChoiceHandler.handleChoiceEvent(trace);
        break;
      
      case 'end':
        console.log('Session ended');
        completionHandler.streamingStateRef.current.messageCompleted = true;
        
        if (
          completionHandler.streamingStateRef.current.accumulatedContent.length > 0 && 
          !completionHandler.streamingStateRef.current.isStreaming && 
          streaming.partialMessageIdRef.current
        ) {
          processStreamCallback(
            completionHandler.streamingStateRef.current.accumulatedContent,
            streaming.partialMessageIdRef.current
          );
          completionHandler.streamingStateRef.current.accumulatedContent = '';
        }
        
        // Clear all timeouts on session end
        stepProgressManager.clearProgressTimeouts();
        textTraceManager.clearTextTraceTimeouts();
        break;
      
      default:
        break;
    }
  };

  return {
    handleTraceEvent,
    receivedFirstTraceRef
  };
}
