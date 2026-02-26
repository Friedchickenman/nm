import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";

// 1. TMDB에서 인기 영화 목록 가져오기
async function getPopularMovies() {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/movie/popular?language=en-US&page=1`,
        {
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
                accept: "application/json",
            },
            // 캐시 설정: 1시간마다 새로운 인기 영화로 갱신!
            next: { revalidate: 3600 }
        }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results;
}

export default async function HomePage() {
    // 2. TMDB 영화 데이터 불러오기
    const movies = await getPopularMovies();

    // 3. ✨ 핵심: 우리 DB에서 영화별 비커(waterLevel) '평균값' 계산하기!
    const aggregations = await db.review.groupBy({
        by: ['movieId'],
        _avg: {
            waterLevel: true, // 물 높이 평균 내줘!
        },
    });

    // 4. 영화 ID를 열쇠(Key)로 해서, 평균값을 바로바로 찾을 수 있게 정리 (Map 형태)
    const avgWaterLevels = aggregations.reduce((acc, curr) => {
        acc[curr.movieId] = curr._avg.waterLevel;
        return acc;
    }, {} as Record<number, number | null>);

    return (
        <div className="min-h-screen bg-black text-white pt-20 pb-20 px-10">
            <div className="max-w-screen-xl mx-auto">
                {/* 헤더 섹션 */}
                <div className="mb-16">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 uppercase italic">
                        Discover
                    </h1>
                    <p className="text-zinc-500 text-sm tracking-widest uppercase">
                        Explore popular movies and lab results
                    </p>
                </div>

                {/* 영화 포스터 그리드 */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {movies.map((movie: any) => {
                        // 5. 이 영화의 평균 비커 수위 가져오기 (아무도 리뷰 안 썼으면 0%)
                        const avgLevel = avgWaterLevels[movie.id] || 0;
                        const avgPercent = Math.round((avgLevel / 500) * 100);

                        return (
                            <Link
                                href={`/movie/${movie.id}`}
                                key={movie.id}
                                className="group flex flex-col gap-3"
                            >
                                {/* 포스터 영역 */}
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

                                    {/* ✨ 포스터 우측 상단에 뜨는 '평균 비커 수위' 오버레이 */}
                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1.5 rounded-lg flex items-center gap-2 border border-white/10 shadow-lg">
                                        <div className="relative w-3 h-4 border-x border-b border-zinc-400 rounded-b-sm overflow-hidden">
                                            <div
                                                className="absolute bottom-0 w-full bg-blue-500"
                                                style={{ height: `${avgPercent}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-black text-white">{avgPercent}%</span>
                                    </div>
                                </div>

                                {/* 영화 정보 영역 */}
                                <div>
                                    <h3 className="font-bold text-sm truncate group-hover:text-blue-400 transition-colors">
                                        {movie.title}
                                    </h3>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        {movie.release_date?.split("-")[0]}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}