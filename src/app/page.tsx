import { getAllTermsForSearchIndex } from "@/lib/server-utils";
import HomePageClient from "@/components/HomePageClient";

interface SearchTerm {
  slug: string;
  title: string;
  description: string;
}

export default async function Home() {
  const allTermsData: SearchTerm[] = await getAllTermsForSearchIndex();

  return <HomePageClient allTermsData={allTermsData} />;
}
