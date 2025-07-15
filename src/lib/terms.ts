import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const termsDirectory = path.join(process.cwd(), 'src', 'content', 'terms');

export function getAllTermSlugs(): Array<{ params: { slug: string } }> {
  const fileNames = fs.readdirSync(termsDirectory);
  return fileNames.map((fileName) => ({
    params: { slug: fileName.replace(/\.md$/, '') },
  }));
}

export async function getTermData(slug: string) {
  const fullPath = path.join(termsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the term metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Combine the data with the slug and contentHtml
  return {
    slug,
    contentHtml,
    ...(matterResult.data as { title: string; description: string; imagePrompt: string; amazonKeywords: string[] }),
  };
}
