import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const termsDirectory = path.join(process.cwd(), 'src', 'content', 'terms');

export function getAllTermSlugs() {
  const fileNames = fs.readdirSync(termsDirectory);

  return fileNames.map((fileName) => ({
    slug: fileName.replace(/\.md$/, ''),
  }));
}

import { Term } from './types';

// ... (resto del código)

export function getTermData(slug: string): Term | undefined {
  const fullPath = path.join(termsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    return undefined;
  }
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  return {
    slug,
    content: matterResult.content,
    ...(matterResult.data as Omit<Term, 'content' | 'slug'>)
  } as Term;
}