import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import InfiniteMovieGrid from "@/components/InfiniteMovieGrid";
import { loadMoreMovies } from "./actions";

// ✨ B: 우리 실험실 반응이 가장 뜨거운 TOP 5 랭킹 가져오기
async function getTopRankedMovies() {
    const aggregations = await db.review.groupBy({
        by: ['movieId'],
        _avg: { waterLevel: true },
        _count: { waterLevel: true } // 리뷰가 몇 개인지도 가져옴
    });

    // 리뷰가 1개 이상인 것 중에 평균 물 높이가 제일 높은 5개만 컷!
    const top5Ids = aggregations
        .filter(agg => agg._count.waterLevel > 0)
        .sort((a, b) => (b._avg.waterLevel || 0) - (a._avg.waterLevel || 0))
        .slice(0, 5);

    // TMDB에 포스터 달라고 요청하기
    const topMovies = await Promise.all(
        top5Ids.map(async (agg) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/movie/${agg.movieId}?language=en-US`, {
                headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}` }
            });
            const movie = await res.json();
            return {
                ...movie,
                avgLevel: agg._avg.waterLevel || 0
            };
        })
    );
    return topMovies;
}

export default async function HomePage() {
    const topRankedMovies = await getTopRankedMovies();

    // 무한 스크롤을 위한 '첫 페이지(1페이지)' 데이터 미리 깔아두기
    const { movies: initialMovies, avgWaterLevels: initialAverages } = await loadMoreMovies(1);

    return (
        <div className="min-h-screen bg-black text-white pt-20 pb-20 px-10">
            <div className="max-w-screen-xl mx-auto">

                {/* 🏆 [상단] Lab Top 5 랭킹 (가로 스크롤) */}
                {topRankedMovies.length > 0 && (
                    <div className="mb-24">
                        <h2 className="text-3xl font-black tracking-tighter mb-8 uppercase italic text-blue-500">
                            🏆 Lab Top 5
                        </h2>
                        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
                            {topRankedMovies.map((movie, index) => {
                                const avgPercent = Math.round((movie.avgLevel / 500) * 100);
                                return (
                                    <Link href={`/movie/${movie.id}`} key={`top-${movie.id}`} className="group relative min-w-[280px] h-[400px] rounded-3xl overflow-hidden shrink-0 border border-zinc-800 hover:border-blue-500 transition-all">
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                            alt={movie.title} fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                                        {/* 힙한 순위 뱃지 */}
                                        <div className="absolute top-5 left-5 bg-blue-600 text-white text-xl font-black w-10 h-10 flex items-center justify-center rounded-full shadow-lg">
                                            {index + 1}
                                        </div>

                                        <div className="absolute bottom-6 left-6 right-6">
                                            <h3 className="font-black text-2xl truncate mb-2">{movie.title}</h3>
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-4 h-6 border-x-2 border-b-2 border-zinc-400 rounded-b-sm overflow-hidden">
                                                    <div className="absolute bottom-0 w-full bg-blue-500" style={{ height: `${avgPercent}%` }} />
                                                </div>
                                                <span className="text-lg font-black text-blue-400">{avgPercent}%</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 🎬 [하단] 무한 스크롤 타이틀 */}
                <div className="mb-10">
                    <h2 className="text-3xl font-black tracking-tighter mb-2 uppercase italic">
                        Popular Now
                    </h2>
                    <p className="text-zinc-500 text-sm tracking-widest uppercase">
                        Keep scrolling to explore more lab results
                    </p>
                </div>

                {/* ✨ 우리가 만든 무한 스크롤 컴포넌트 장착! */}
                <InfiniteMovieGrid initialMovies={initialMovies} initialAverages={initialAverages} />
            </div>
        </div>
    );
}