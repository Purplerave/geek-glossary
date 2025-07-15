import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const termsDirectory = path.join(process.cwd(), 'content/terms');

export function getAllTermSlugs() {
  const fileNames = fs.readdirSync(termsDirectory);

  return fileNames.map((fileName) => ({
    slug: fileName.replace(/\.md$/, ''),
  }));
}

export function getTermData(slug: string) {
  const fullPath = path.join(termsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  return {
    slug,
    content: matterResult.content,
    ...matterResult.data,
  };
}