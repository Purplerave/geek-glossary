export interface Term {
  slug: string;
  title: string;
  description: string;
  content: string;
  imagePrompt?: string;
  amazonKeywords?: string[];
  optimizedAmazonSearch?: string;
}

export interface SearchTerm {
  slug: string;
  title: string;
  description: string;
}
