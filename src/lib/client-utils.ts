export function getRandomRelatedTerms(allTerms: Array<{ title: string; slug: string }>, currentSlug: string, count: number) {
  const filteredTerms = allTerms.filter(term => term.slug !== currentSlug);
  const shuffled = filteredTerms.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
