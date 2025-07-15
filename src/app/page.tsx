import { getAllTermsForSearchIndex } from "@/lib/server-utils";
import HomePageClient from "@/components/HomePageClient";
import { SearchTerm } from "@/lib/types";

export default async function Home() {
  const allTermsData: SearchTerm[] = await getAllTermsForSearchIndex();

  return <HomePageClient allTermsData={allTermsData} />;
}
