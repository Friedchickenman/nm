import Image from "next/image";
import Link from "next/link";

// TMDB에 "이 검색어로 영화 좀 찾아줘!" 라고 요청하는 함수
async function searchMovies(query: string) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`,
        {
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
                accept: "application/json",
            },
        }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results;
}

export default async function SearchPage({
                                             searchParams,
                                         }: {
    searchParams: Promise<{ q?: string }>;
}) {
    // URL에서 ?q= 에 들어있는 검색어 빼오기
    const { q } = await searchParams;

    if (!q) return <div className="pt-40 text-center text-white">Please enter a search term.</div>;

    // TMDB에서 검색 결과 가져오기
    const movies = await searchMovies(q);

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20 px-10">
            <div className="max-w-screen-xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-10 uppercase italic">
                    Results for "{q}"
                </h1>

                {movies.length === 0 ? (
                    <p className="text-zinc-500 italic">No movies found in the lab database.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {movies.map((movie: any) => (
                            <Link href={`/movie/${movie.id}`} key={movie.id} className="group flex flex-col gap-3">
                                <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 group-hover:border-blue-500 transition-colors">
                                    {movie.poster_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                            alt={movie.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs">No Image</div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm truncate group-hover:text-blue-400 transition-colors">
                                        {movie.title}
                                    </h3>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        {movie.release_date?.split("-")[0]}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}