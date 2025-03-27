// src/lib/voiceflow.ts
import { v4 as uuidv4 } from 'uuid';

const RUNTIME_API_KEY = import.meta.env.VITE_VOICEFLOW_API_KEY;
const RUNTIME_ENDPOINT = 'https://general-runtime.voiceflow.com';
const PROJECT_ID = import.meta.env.VITE_VOICEFLOW_PROJECT_ID;

// User session ID
const USER_ID = 'user_' + uuidv4();

export function parseMarkdown(text: string): string {
  if (!text) return '';
  
  // Convert markdown links: [text](url)
  text = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g, 
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
  );
  
  // Handle bold: **text** or __text__
  text = text.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
  
  // Handle italic: *text* or _text_
  text = text.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
  
  // Handle line breaks
  text = text.replace(/\n/g, '<br />');
  
  return text;
}

// Simple delay function for animations
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Send a launch request to Voiceflow Dialog API
export async function vfSendLaunch(
  variables: Record<string, any> = {}, 
  traceHandler: (trace: any) => void
): Promise<void> {
  console.log('Sending launch request to Voiceflow');
  
  await sendRequest(
    {
      type: 'launch',
      payload: {}
    },
    variables,
    traceHandler
  );
}

// Send a message to Voiceflow Dialog API
export async function vfSendMessage(
  message: string, 
  traceHandler: (trace: any) => void,
  variables: Record<string, any> = {}
): Promise<void> {
  console.log(`Sending message to Voiceflow: ${message}`);
  
  await sendRequest(
    {
      type: 'text',
      payload: message
    },
    variables,
    traceHandler
  );
}

// Send an action to Voiceflow Dialog API (for button clicks)
export async function vfSendAction(
  action: any,
  traceHandler: (trace: any) => void,
  variables: Record<string, any> = {}
): Promise<void> {
  console.log('Sending action to Voiceflow:', action);
  
  await sendRequest(
    action,
    variables,
    traceHandler
  );
}

// Core function to send requests to Voiceflow Dialog API
async function sendRequest(
  action: any,
  variables: Record<string, any> = {},
  traceHandler: (trace: any) => void
): Promise<void> {
  if (!RUNTIME_API_KEY || !PROJECT_ID) {
    console.error('Missing Voiceflow API key or project ID');
    throw new Error('Missing Voiceflow API key or project ID');
  }

  const queryParams = new URLSearchParams({
    completion_events: 'true', // Enable streaming completion events
  });

  try {
    // Make the request to the Voiceflow Dialog API
    const response = await fetch(
      `${RUNTIME_ENDPOINT}/v2/project/${PROJECT_ID}/user/${USER_ID}/interact/stream?${queryParams}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: RUNTIME_API_KEY,
        },
        body: JSON.stringify({
          action,
          ...(Object.keys(variables).length > 0 && { variables }),
        }),
      }
    );

    if (!response.ok || !response.body) {
      throw new Error(`API failed with status ${response.status}`);
    }

    // Create EventSource parser
    const parser = createParser(event => {
      if (event.type === 'event' && event.event === 'trace') {
        try {
          const trace = JSON.parse(event.data);
          traceHandler(trace);
        } catch (error) {
          console.error('Error parsing trace event:', error);
        }
      }
    });

    // Process the streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      parser.feed(chunk);
    }

  } catch (error) {
    console.error('Error sending request to Voiceflow:', error);
    throw error;
  }
}

// EventSource parser for SSE
interface EventSourceParserOptions {
  onEvent: (event: { type: string; event?: string; data: string; id?: string }) => void;
}

function createParser(onEvent: EventSourceParserOptions['onEvent']) {
  let data = '';
  let eventId = '';
  let eventType = '';
  let eventData = '';

  return {
    feed(chunk: string): void {
      data += chunk;
      processData();
    },
  };

  function processData() {
    let index = 0;
    let startingPosition = 0;
    let newLinePosition = -1;

    while ((newLinePosition = data.indexOf('\n', index)) !== -1) {
      const line = data.slice(index, newLinePosition);
      index = newLinePosition + 1;

      if (line.startsWith('event:')) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith('id:')) {
        eventId = line.slice(3).trim();
      } else if (line.startsWith('data:')) {
        eventData = line.slice(5).trim();
      } else if (line === '') {
        // Empty line denotes the end of an event
        if (eventType && eventData) {
          onEvent({
            type: 'event',
            event: eventType,
            data: eventData,
            id: eventId,
          });
        }
        eventType = '';
        eventId = '';
        eventData = '';
      }
    }

    // Keep any unprocessed data for the next chunk
    data = data.slice(index);
  }
}
