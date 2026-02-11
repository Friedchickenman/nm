import Image from "next/image";
import Link from "next/link";

// 1. TMDB에서 영화 데이터를 가져오는 함수
async function getPopularMovies() {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/movie/popular?language=en-US&page=1`,
        {
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
                accept: "application/json",
            },
            // 데이터를 24시간마다 갱신하도록 설정 (원하는 대로 조절 가능)
            next: { revalidate: 86400 },
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch movies");
    }

    const data = await res.json();
    return data.results; // 영화 20개 리스트가 들어있습니다.
}

export default async function HomePage() {
    const movies = await getPopularMovies();

    return (
        <div className="max-w-screen-xl mx-auto px-6 py-10">
            <h1 className="text-2xl font-black mb-8 tracking-tighter">DISCOVER</h1>

            {/* 영화 포스터 그리드 레이아웃 */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {movies.map((movie: any) => (
                    <Link href={`/movie/${movie.id}`} key={movie.id} className="group cursor-pointer">
                        {/* 포스터 이미지 */}
                        <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-zinc-900">
                            <Image
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={movie.title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>

                        {/* 영화 제목 및 정보 */}
                        <div className="mt-3">
                            <h2 className="text-sm font-bold truncate">{movie.title}</h2>
                            <p className="text-xs text-zinc-500 mt-1">
                                {movie.release_date.split("-")[0]} • ★ {movie.vote_average.toFixed(1)}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}