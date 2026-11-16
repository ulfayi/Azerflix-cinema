import { HomeClient } from "@/components/HomeClient";
import { getAllMovies, getFeaturedMovies } from "@/lib/movies";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const allMovies = getAllMovies();
  const heroMovies = getFeaturedMovies(4);

  return <HomeClient allMovies={allMovies} heroMovies={heroMovies} />;
}
