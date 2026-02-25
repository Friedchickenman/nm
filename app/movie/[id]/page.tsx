import Image from "next/image";
import { db } from "@/lib/db";
import ReviewForm from "./ReviewForm";
import { auth } from "@/auth";

// 1. TMDB API에서 영화 상세 정보를 가져오는 함수
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

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const movie = await getMovieDetail(id);

    const session = await auth();

    // 2. DB에서 이 영화의 리뷰 목록을 최신순으로 가져오기
    const reviews = await db.review.findMany({
        where: { movieId: Number(id) },
        orderBy: { createdAt: 'desc' },
        include: { user: true }
    });

    if (!movie) return <div className="p-20 text-white">Movie not found.</div>;

    return (
        <div className="min-h-screen bg-black text-white">
            {/* 🎥 [상단] 포스터 배경 섹션 - 이 부분이 가장 위에 있어야 합니다 */}
            <div className="relative h-[60vh] w-full">
                <Image
                    src={`https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}`}
                    alt={movie.title}
                    fill
                    className="object-cover opacity-50"
                    priority
                />
                {/* 텍스트 가독성을 위한 그라데이션 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                {/* 영화 제목 및 요약 */}
                <div className="absolute bottom-10 left-10 right-10">
                    <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-4 uppercase italic">
                        {movie.title}
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-3xl line-clamp-2">
                        {movie.overview}
                    </p>
                </div>
            </div>

            {/* 🧪 [하단] 상세 정보 및 비커 리뷰 섹션 */}
            <div className="p-10 max-w-screen-xl mx-auto">
                <div className="flex items-center gap-6 text-sm font-bold tracking-widest text-zinc-500 uppercase">
                    <span>{movie.release_date?.split("-")[0]}</span>
                    <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                    <span className="text-blue-500">★ {movie.vote_average.toFixed(1)}</span>
                </div>

                {/* 비커 입력 폼 */}
                <div className="mt-24 border-t border-zinc-900 pt-16">
                    <h2 className="text-3xl font-black mb-2 tracking-tighter uppercase italic">Mood Measurement</h2>
                    <p className="text-zinc-500 mb-10 text-xs">Analyze your emotions through the beaker.</p>
                    {session?.user ? (
                        <ReviewForm movieId={Number(id)} userId={session.user.id as string} />
                    ) : (
                        <div className="p-10 border border-zinc-800 rounded-2xl bg-zinc-950/50 text-center">
                            <p className="text-zinc-400 text-sm font-semibold uppercase tracking-widest mb-4">
                                Authentication Required
                            </p>
                            <p className="text-zinc-500 text-xs">Please log in from the top right to record your experimental data.</p>
                        </div>
                    )}
                </div>

                {/* 리뷰 목록 표시 */}
                <div className="mt-32">
                    <h2 className="text-2xl font-black mb-10 tracking-tighter uppercase">Recent Beakers</h2>
                    {reviews.length === 0 ? (
                        <p className="text-zinc-700 italic text-sm">No experimental data yet.</p>
                    ) : (
                        <div className="grid gap-10">
                            {reviews.map((review) => (
                                <div key={review.id} className="flex gap-8 items-start border-b border-zinc-900 pb-10">
                                    {/* 리스트 내 작은 비커 아이콘 */}
                                    <div className="relative w-10 h-14 border-x-2 border-b-2 border-zinc-700 rounded-b-lg bg-zinc-950 overflow-hidden shrink-0">
                                        <div
                                            className="absolute bottom-0 w-full bg-blue-500/20"
                                            style={{ height: `${(review.waterLevel / 500) * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                                                {review.user?.name || "Anonymous Lab Member"}
                                            </span>
                                        </div>
                                        <p className="text-lg italic text-zinc-200">"{review.content}"</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}