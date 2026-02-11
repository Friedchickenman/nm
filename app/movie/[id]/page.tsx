import Image from "next/image";
import ReviewForm from "./ReviewForm";

// TMDB API에서 영화 상세 정보를 가져오는 함수
async function getMovieDetail(id: string) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/movie/${id}?language=en-US`, // 영어로 데이터 요청
        {
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
                accept: "application/json",
            },
        }
    );
    if (!res.ok) return null;
    return res.json();
}

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Next.js 15+ 방식에 맞춰 params를 await 합니다.
    const { id } = await params;
    const movie = await getMovieDetail(id);

    if (!movie) {
        return (
            <div className="flex items-center justify-center min-h-screen text-white bg-black">
                <p className="text-xl font-bold">Movie not found (ID: {id})</p>
            </div>
        );
    }

    // 로그인 시스템 연동 전까지 사용할 임시 유저 아이디
    const tempUserId = "cl-12345";

    return (
        <div className="min-h-screen bg-black text-white">
            {/* 1. 배경 포스터 섹션 (상단 고정) */}
            <div className="relative h-[65vh] w-full">
                <Image
                    src={`https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}`}
                    alt={movie.title}
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                {/* 하단 그라데이션 (텍스트 가독성 확보) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                <div className="absolute bottom-10 left-10 right-10">
                    <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-4 uppercase italic">
                        {movie.title}
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-3xl line-clamp-3 leading-relaxed">
                        {movie.overview}
                    </p>
                </div>
            </div>

            {/* 2. 상세 정보 및 비커 리뷰 섹션 */}
            <div className="p-10 max-w-screen-xl mx-auto">
                <div className="flex items-center gap-6 text-sm font-bold tracking-widest text-zinc-500 uppercase">
                    <span>{movie.release_date?.split("-")[0]}</span>
                    <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                    <span className="text-blue-500">★ {movie.vote_average.toFixed(1)}</span>
                    <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                    <span>{movie.runtime} MIN</span>
                </div>

                {/* 비커 시스템 영역 */}
                <div className="mt-24 border-t border-zinc-900 pt-16">
                    <h2 className="text-3xl font-black mb-2 tracking-tighter uppercase">Mood Measurement</h2>
                    <p className="text-zinc-500 mb-10 text-sm">Fill the beaker based on the emotional impact of this movie.</p>

                    {/* 비커 입력 폼 컴포넌트 호출 */}
                    <ReviewForm
                        movieId={Number(id)}
                        userId={tempUserId}
                    />
                </div>
            </div>
        </div>
    );
}