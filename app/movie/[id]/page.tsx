import Image from "next/image";
import ReviewForm from "./ReviewForm";

async function getMovieDetail(id: string) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/movie/${id}?language=en-US`,
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

// 중요: params 자체를 Promise로 받아서 await 해줘야 합니다!
export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const movie = await getMovieDetail(id);

    if (!movie) { /* ... 생략 ... */ }

    // 임시로 userId를 지정 (나중에 로그인을 붙이면 실제 유저 ID로 바꿀 거예요)
    const tempUserId = "cl-12345";

    return (
        <div className="min-h-screen bg-black text-white">
            {/* 배경 큰 이미지 섹션 */}
            <div className="relative h-[60vh] w-full">
                {/* ... 기존 이미지 코드 ... */}
            </div>

            {/* 추가 정보 및 리뷰 섹션 */}
            <div className="p-10 max-w-screen-xl mx-auto">
                <div className="flex gap-4 text-sm text-zinc-400">
                    <span>{movie.release_date}</span>
                    <span>•</span>
                    <span>★ {movie.vote_average.toFixed(1)}</span>
                </div>

                {/* +++ 2. 여기에 비커 리뷰 폼을 넣습니다 +++ */}
                <div className="mt-20">
                    <h2 className="text-2xl font-bold mb-4 tracking-tighter">My Beaker</h2>
                    <ReviewForm
                        movieId={Number(id)}
                        userId={tempUserId}
                    />
                </div>
            </div>
        </div>
    );
}