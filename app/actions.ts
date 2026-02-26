"use server";

import { db } from "@/lib/db";

// TMDB에서 N번째 페이지를 가져오고, 우리 DB에서 비커 평균값도 같이 가져오는 만능 함수
export async function loadMoreMovies(page: number) {
    // 1. TMDB 인기 영화 N페이지 호출
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/movie/popular?language=en-US&page=${page}`,
        {
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
                accept: "application/json",
            },
        }
    );
    const data = await res.json();
    const movies = data.results || [];

    // 2. 가져온 영화들의 ID만 쏙 뽑기
    const movieIds = movies.map((m: any) => m.id);

    // 3. 우리 DB에 물어봐서, 이 영화들의 비커 물 높이 '평균'만 싹 가져오기
    const aggregations = await db.review.groupBy({
        by: ['movieId'],
        where: { movieId: { in: movieIds } },
        _avg: { waterLevel: true },
    });

    // 4. 영화 ID를 열쇠로 해서 찾기 쉽게 정리
    const avgWaterLevels = aggregations.reduce((acc, curr) => {
        acc[curr.movieId] = curr._avg.waterLevel || 0;
        return acc;
    }, {} as Record<number, number>);

    return { movies, avgWaterLevels };
}