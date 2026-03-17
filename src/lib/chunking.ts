export const DEFAULT_MAX_TOKENS = 4000;
export const CHARS_PER_TOKEN_ESTIMATE = 4;

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN_ESTIMATE);
}

export function needsChunking(text: string, maxTokens: number = DEFAULT_MAX_TOKENS): boolean {
  return estimateTokens(text) > maxTokens * 0.8;
}

export function chunkText(text: string, maxTokens: number = DEFAULT_MAX_TOKENS): string[] {
  const maxChars = maxTokens * CHARS_PER_TOKEN_ESTIMATE;
  
  if (text.length <= maxChars) {
    return [text];
  }
  
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length + 2 > maxChars) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      if (paragraph.length > maxChars) {
        const sentences = paragraph.split(/(?<=[.!?])\s+/);
        let sentenceChunk = '';
        
        for (const sentence of sentences) {
          if (sentenceChunk.length + sentence.length + 1 > maxChars) {
            if (sentenceChunk.length > 0) {
              chunks.push(sentenceChunk.trim());
              sentenceChunk = '';
            }
            
            if (sentence.length > maxChars) {
              for (let i = 0; i < sentence.length; i += maxChars) {
                chunks.push(sentence.slice(i, i + maxChars));
              }
            } else {
              sentenceChunk = sentence;
            }
          } else {
            sentenceChunk += (sentenceChunk ? ' ' : '') + sentence;
          }
        }
        
        if (sentenceChunk.length > 0) {
          currentChunk = sentenceChunk;
        }
      } else {
        currentChunk = paragraph;
      }
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

export function estimateTotalTokens(chunks: string[]): number {
  return chunks.reduce((sum, chunk) => sum + estimateTokens(chunk), 0);
}