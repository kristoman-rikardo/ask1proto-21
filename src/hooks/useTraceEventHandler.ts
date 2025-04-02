
import { useRef, useEffect } from 'react';
import { Button } from '@/types/chat';
import { MessageStreamingHook } from '@/hooks/useMessageStreaming';
import { useTraceDataHandler } from './useTraceDataHandler';
import { logTraceEvent } from '@/utils/traceLogger';

export { createLoadingPhaseEvent } from './useLoadingPhaseManager';

export function useTraceEventHandler(
  streaming: MessageStreamingHook,
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
  setButtons: React.Dispatch<React.SetStateAction<Button[]>>,
  setIsButtonsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setStepsTotal: React.Dispatch<React.SetStateAction<number>>,
  setCurrentStepIndex: React.Dispatch<React.SetStateAction<number>>,
  setCarouselData: React.Dispatch<React.SetStateAction<any | null>>
) {
  const traceDataHandler = useTraceDataHandler(
    streaming,
    setIsTyping,
    setButtons,
    setIsButtonsLoading,
    setStepsTotal,
    setCurrentStepIndex,
    setCarouselData
  );
  
  // Cleanup all timeouts
  useEffect(() => {
    return () => {
      traceDataHandler.stepProgressManager.clearProgressTimeouts();
      traceDataHandler.textStreamingStartedRef.current = false;
    };
  }, []);
  
  const handleTraceEvent = (trace: any) => {
    const traceType = trace.type || 'unknown';
    
    // Log the trace with our utility
    logTraceEvent(traceType, trace.payload);
    
    // For user messages, reset the tracking state
    if (trace.type === 'user') {
      traceDataHandler.handleUserMessage();
    }
    
    if (trace.type === 'speak' || 
        trace.type === 'text' || 
        (trace.type === 'completion' && trace.payload?.state === 'start')) {
      traceDataHandler.receivedFirstTraceRef.current = true;
      
      // Clear timeout when we receive actual trace data
      traceDataHandler.stepProgressManager.clearProgressTimeouts();
    }
    
    // Check for special block ID - support multiple block IDs
    if (trace.type === 'block' && trace.payload?.blockID) {
      traceDataHandler.handleSpecialBlock(trace.payload.blockID);
    }
    
    // Handle steps data if available
    if (!traceDataHandler.stepProgressManager.handleStepsFromPayload(trace.payload)) {
      // Set up progress timeouts if no steps data
      traceDataHandler.stepProgressManager.setupProgressTimeouts();
    }
    
    switch (trace.type) {
      case 'speak':
      case 'text':
        traceDataHandler.handleTextOrSpeechTrace(trace);
        break;
      
      case 'completion':
        // Handle completion events
        if (trace.payload?.state === 'start') {
          traceDataHandler.handleCompletionStart();
        }
        traceDataHandler.completionHandler.handleCompletionEvent(trace.payload);
        break;
      
      case 'choice':
        console.log('🔴 BUTTON TRACE RECEIVED:', trace.payload?.buttons?.length || 0, 'buttons');
        traceDataHandler.textAndChoiceHandler.handleChoiceEvent(trace);
        break;
      
      case 'carousel':
        console.log('🟣 CAROUSEL TRACE RECEIVED:', trace.payload?.cards?.length || 0, 'cards');
        traceDataHandler.textAndChoiceHandler.handleCarouselEvent(trace);
        // Switch to streaming phase when carousel is displayed
        traceDataHandler.loadingPhaseManager.switchToStreamingPhase();
        break;
      
      case 'end':
        traceDataHandler.handleSessionEnd();
        break;
      
      default:
        break;
    }
  };

  return {
    handleTraceEvent,
    receivedFirstTraceRef: traceDataHandler.receivedFirstTraceRef,
    textStreamingStartedRef: traceDataHandler.textStreamingStartedRef
  };
}
