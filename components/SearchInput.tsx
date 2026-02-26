"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // ✨ 썸네일용 이미지 추가

export default function SearchInput() {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]); // 연관 검색어 목록
    const [isFocused, setIsFocused] = useState(false); // 검색창 포커스 여부
    const router = useRouter();

    // ✨ 1. 디바운싱(Debouncing)으로 연관 검색어 가져오기
    useEffect(() => {
        const fetchSuggestions = async () => {
            // 두 글자 이상 입력했을 때만 검색!
            if (query.trim().length < 2) {
                setSuggestions([]);
                return;
            }

            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`,
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
                            accept: "application/json",
                        },
                    }
                );
                if (res.ok) {
                    const data = await res.json();
                    // 상위 5개만 잘라서 드롭다운에 보여주기
                    setSuggestions(data.results.slice(0, 5));
                }
            } catch (error) {
                console.error("Failed to fetch suggestions:", error);
            }
        };

        // 0.3초(300ms) 동안 추가 타이핑이 없으면 fetchSuggestions 실행!
        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId); // 타이핑 계속하면 이전 타이머 취소
    }, [query]);

    // 엔터 쳤을 때: 전체 검색 결과 페이지로 이동
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setIsFocused(false);
        router.push(`/search?q=${encodeURIComponent(query)}`);
    };

    // 연관 검색어 클릭했을 때: 해당 영화 상세 페이지로 바로 이동
    const handleSuggestionClick = (movieId: number) => {
        setIsFocused(false);
        setQuery(""); // 검색창 비우기
        router.push(`/movie/${movieId}`);
    };

    return (
        <div className="relative hidden sm:block">
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                        // 클릭 이벤트가 먼저 실행될 수 있게 0.2초 여유 주기
                        setTimeout(() => setIsFocused(false), 200);
                    }}
                    placeholder="Search movies..."
                    // 포커스 시 길이가 w-64로 슉! 늘어납니다.
                    className="w-40 bg-zinc-100 border-none rounded-full py-1.5 px-4 text-xs focus:w-64 focus:ring-1 focus:ring-zinc-300 transition-all outline-none text-black relative z-50"
                />
            </form>

            {/* ✨ 2. 연관 검색어 드롭다운 메뉴 */}
            {isFocused && query.trim().length >= 2 && (
                <div className="absolute top-full mt-3 w-72 right-0 bg-white/95 backdrop-blur-md border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden z-50">
                    {suggestions.length > 0 ? (
                        <div className="flex flex-col">
                            {suggestions.map((movie) => (
                                <button
                                    key={movie.id}
                                    onClick={() => handleSuggestionClick(movie.id)}
                                    className="flex items-center gap-3 p-3 hover:bg-zinc-100 transition-colors text-left w-full border-b border-zinc-100 last:border-none"
                                >
                                    {/* 작은 포스터 썸네일 */}
                                    <div className="relative w-8 h-12 bg-zinc-200 rounded-md overflow-hidden shrink-0">
                                        {movie.poster_path && (
                                            <Image
                                                src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                                alt={movie.title}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    {/* 영화 제목 및 개봉년도 */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-black truncate">{movie.title}</p>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                                            {movie.release_date?.split("-")[0]}
                                        </p>
                                    </div>
                                </button>
                            ))}
                            {/* 전체 보기 버튼 */}
                            <button
                                onClick={(e) => handleSearch(e as any)}
                                className="p-3 text-xs text-blue-500 font-black tracking-widest uppercase hover:bg-blue-50 transition-colors text-center bg-zinc-50/50"
                            >
                                See all results
                            </button>
                        </div>
                    ) : (
                        <div className="p-6 text-center text-xs text-zinc-500 font-bold tracking-widest uppercase">
                            No movies found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}