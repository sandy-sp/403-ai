export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>/g, ''); // Strip HTML tags
  const wordCount = text.trim().split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return readTime || 1;
}

export function generateExcerpt(
  content: string,
  maxLength: number = 160
): string {
  // Strip HTML tags
  const text = content.replace(/<[^>]*>/g, '');
  
  // Remove extra whitespace
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  
  // Find the last space before maxLength
  const truncated = cleanText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

export function extractHeadings(content: string): Array<{
  id: string;
  text: string;
  level: number;
}> {
  const headingRegex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h\1>/gi;
  const headings: Array<{ id: string; text: string; level: number }> = [];
  
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]*>/g, ''),
    });
  }
  
  return headings;
}

export function countWords(content: string): number {
  const text = content.replace(/<[^>]*>/g, '');
  return text.trim().split(/\s+/).length;
}

export function countCharacters(content: string): number {
  const text = content.replace(/<[^>]*>/g, '');
  return text.length;
}
