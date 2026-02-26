"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
// ✨ 아까 만든 서버 액션을 불러옵니다
import { loadMoreMovies } from "@/app/actions";

interface Movie {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
}

export default function InfiniteMovieGrid({
                                              initialMovies,
                                              initialAverages,
                                          }: {
    initialMovies: Movie[];
    initialAverages: Record<number, number>;
}) {
    const [movies, setMovies] = useState<Movie[]>(initialMovies);
    const [averages, setAverages] = useState<Record<number, number>>(initialAverages);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    // 화면 맨 밑에 닿았는지 감지하는 센서 역할
    const observerRef = useRef<HTMLDivElement>(null);

    const loadMore = async () => {
        if (loading) return;
        setLoading(true);
        const nextPage = page + 1;

        // 다음 페이지 데이터 가져오기!
        const data = await loadMoreMovies(nextPage);

        // 기존 영화들 밑에 새 영화들 이어붙이기
        setMovies((prev) => [...prev, ...data.movies]);
        setAverages((prev) => ({ ...prev, ...data.avgWaterLevels }));
        setPage(nextPage);
        setLoading(false);
    };

    // 스크롤 감지 로직 (Intersection Observer)
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                // 센서가 화면에 보이면 loadMore 실행!
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { threshold: 1.0 }
        );

        if (observerRef.current) observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [page, loading]);

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {movies.map((movie, index) => {
                    const avgLevel = averages[movie.id] || 0;
                    const avgPercent = Math.round((avgLevel / 500) * 100);

                    return (
                        // key에 index를 더해서 중복 에러 방지
                        <Link href={`/movie/${movie.id}`} key={`${movie.id}-${index}`} className="group flex flex-col gap-3">
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

            {/* ✨ 여기가 화면 맨 밑에 있는 '센서' 입니다! */}
            <div ref={observerRef} className="h-20 flex items-center justify-center mt-10">
                {loading && <p className="text-blue-500 font-bold text-sm animate-pulse tracking-widest uppercase">Loading more...</p>}
            </div>
        </>
    );
}