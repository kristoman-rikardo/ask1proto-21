
/**
 * Streams text word by word with a fade-in animation
 * 
 * @param fullText The complete text to stream
 * @param onUpdate Callback function to update UI with each change
 * @param onComplete Callback function when streaming is complete
 * @param minDelay Optional minimum delay between words (default: 5ms)
 * @param maxDelay Optional maximum delay between words (default: 30ms)
 */
export const streamWords = (
  fullText: string,
  onUpdate: (text: string) => void,
  onComplete: () => void,
  minDelay: number = 5,
  maxDelay: number = 30
): void => {
  const words = fullText.split(/(\s+)/); // Split by whitespace but keep separators
  let index = 0;
  let currentDisplay = '';

  const appendNextWord = () => {
    if (index < words.length) {
      // Get the current word (could be actual word or whitespace)
      const word = words[index];
      
      if (word.trim()) {
        // This is an actual word, wrap it with fade-in class
        currentDisplay += `<span class="word-fade-in">${word}</span>`;
      } else {
        // This is whitespace, add it directly
        currentDisplay += word;
      }
      
      onUpdate(currentDisplay);
      index++;
      
      // Schedule next update with a random delay in the specified range
      const randomDelay = minDelay + Math.random() * (maxDelay - minDelay);
      setTimeout(appendNextWord, randomDelay);
    } else {
      // When complete, provide the raw text without spans for cleaner final state
      onComplete();
    }
  };

  // Start the streaming process
  appendNextWord();
};

/**
 * Tracks already processed words to avoid re-animating them
 * Used for real-time streaming scenarios
 */
export class StreamingWordTracker {
  private processedText: string = '';
  private currentBuffer: string = '';
  private lastProcessedIndex: number = 0;
  private formattedOutput: string = ''; // Store the formatted output with fade-in spans

  /**
   * Updates the buffer with new content and returns any new complete words
   * 
   * @param newContent New content to append to the buffer
   * @returns Object containing processed text, formatted output with spans, and newCompleteWords
   */
  appendContent(newContent: string): { 
    processedText: string, 
    formattedOutput: string,
    newCompleteWords: string 
  } {
    this.currentBuffer += newContent;
    
    // Find word boundaries (space, punctuation followed by space, etc.)
    const wordBoundaryRegex = /(\s+|[.,!?;:]\s*)/g;
    let match;
    let lastIndex = 0;
    let newWords = '';
    let newFormattedWords = '';
    
    // Reset regex state
    wordBoundaryRegex.lastIndex = this.lastProcessedIndex;
    
    while ((match = wordBoundaryRegex.exec(this.currentBuffer)) !== null) {
      if (match.index >= this.lastProcessedIndex) {
        // Extract the word before this boundary
        const word = this.currentBuffer.substring(this.lastProcessedIndex, match.index);
        if (word) {
          // Add to processed text and new words
          this.processedText += word + match[0];
          newWords += word + match[0];
          
          // Add to formatted output with fade-in span
          this.formattedOutput += `<span class="word-fade-in">${word}</span>${match[0]}`;
          newFormattedWords += `<span class="word-fade-in">${word}</span>${match[0]}`;
        } else {
          // Just a boundary with no preceding word
          this.processedText += match[0];
          newWords += match[0];
          this.formattedOutput += match[0];
          newFormattedWords += match[0];
        }
        
        // Update last processed index to after this match
        this.lastProcessedIndex = match.index + match[0].length;
        lastIndex = this.lastProcessedIndex;
      }
    }
    
    return { 
      processedText: this.processedText, 
      formattedOutput: this.formattedOutput,
      newCompleteWords: newWords 
    };
  }

  /**
   * Finalizes the buffer, processing any remaining content
   * 
   * @returns Object containing the complete processed text and formatted output
   */
  finalize(): { text: string, formattedOutput: string } {
    if (this.lastProcessedIndex < this.currentBuffer.length) {
      const remaining = this.currentBuffer.substring(this.lastProcessedIndex);
      this.processedText += remaining;
      this.formattedOutput += `<span class="word-fade-in">${remaining}</span>`;
    }
    return { 
      text: this.processedText,
      formattedOutput: this.formattedOutput
    };
  }

  /**
   * Gets the current state of the processed text
   * 
   * @returns Current processed text
   */
  getCurrentProcessedText(): string {
    return this.processedText;
  }

  /**
   * Gets the formatted output with fade-in spans
   * 
   * @returns Formatted output
   */
  getFormattedOutput(): string {
    return this.formattedOutput;
  }

  /**
   * Gets the complete text (processed + buffer)
   * 
   * @returns Complete text
   */
  getCompleteText(): string {
    return this.processedText + this.currentBuffer.substring(this.lastProcessedIndex);
  }

  /**
   * Resets the tracker state
   */
  reset(): void {
    this.processedText = '';
    this.currentBuffer = '';
    this.lastProcessedIndex = 0;
    this.formattedOutput = '';
  }
}
