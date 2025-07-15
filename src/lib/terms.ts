import { remark } from 'remark';
import html from 'remark-html';

export async function processMarkdownToHtml(markdownContent: string, allTerms: Array<{ title: string; slug: string }>): Promise<string> {
  let processedMarkdown = markdownContent;

  // Sort terms by title length in descending order to avoid replacing substrings of longer titles
  const sortedTerms = [...allTerms].sort((a, b) => b.title.length - a.title.length);

  sortedTerms.forEach(term => {
    // Create a regex to match the whole word, case-insensitive
    // Use negative lookarounds to avoid matching inside HTML tags or already linked text
    const regex = new RegExp(`(?<!<a[^>]*>|/a>|\w)(${term.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?!\w|[^<]*<\/a>)`, 'gi');

    processedMarkdown = processedMarkdown.replace(regex, (match) => {
      // Ensure we don't link the term if it's the current page's title
      // This check is more robust if done in the page component, but as a fallback here
      if (match.toLowerCase() === term.title.toLowerCase()) {
        return `<a href="/terms/${term.slug}" class="text-purple-300 hover:underline">${match}</a>`;
      }
      return match; // Return original match if not a direct title match
    });
  });

  const processedContent = await remark()
    .use(html)
    .process(processedMarkdown);
  return processedContent.toString();
}