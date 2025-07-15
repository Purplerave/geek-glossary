import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Term } from './types';

const termsDirectory = path.join(process.cwd(), 'src', 'content', 'terms');

export function getAllTermSlugs() {
  const fileNames = fs.readdirSync(termsDirectory);

  return fileNames.map((fileName) => ({
    slug: fileName.replace(/\.md$/, ''),
  }));
}

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

export async function getAllTermsForSearchIndex(): Promise<Array<{ slug: string; title: string; description: string }>> {
  const slugs = getAllTermSlugs();
  const allTermsData = await Promise.all(
    slugs.map(async ({ slug }) => getTermData(slug))
  );

  return allTermsData
    .filter((term): term is Term => term !== undefined)
    .map(({ slug, title, description }) => ({
      slug,
      title,
      description,
    }));
}

export async function getAllTermTitlesAndSlugs(): Promise<Array<{ title: string; slug: string }>> {
  const slugs = getAllTermSlugs();
  const allTermsData = await Promise.all(
    slugs.map(async ({ slug }) => getTermData(slug))
  );

  return allTermsData
    .filter((term): term is Term => term !== undefined)
    .map(({ title, slug }) => ({
      title,
      slug,
    }));
}
