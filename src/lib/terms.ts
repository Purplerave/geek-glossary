import { remark } from 'remark';
import html from 'remark-html';

// This file will now only contain client-side compatible utilities if needed
// For now, it's just a placeholder for remark/html processing

export async function processMarkdownToHtml(markdownContent: string): Promise<string> {
  const processedContent = await remark()
    .use(html)
    .process(markdownContent);
  return processedContent.toString();
}
