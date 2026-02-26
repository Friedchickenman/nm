import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

// 1. TMDB에서 영화 포스터와 제목을 가져오는 함수
async function getMovieMinimal(id: number) {
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

export default async function ArchivePage() {
    // 2. 현재 로그인한 유저 확인
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/");
    }

    // 3. 내 아이디로 쓴 리뷰만 가져오기
    const myReviews = await db.review.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    });

    // 4. 리뷰에 TMDB 영화 정보 합치기
    const archives = await Promise.all(
        myReviews.map(async (review) => {
            const movie = await getMovieMinimal(review.movieId);
            return {
                ...review,
                movieTitle: movie?.title || "Unknown Movie",
                moviePoster: movie?.poster_path,
            };
        })
    );

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20 px-10">
            <div className="max-w-screen-xl mx-auto">
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 uppercase italic">
                    My Archive
                </h1>
                <p className="text-zinc-500 mb-16 text-sm tracking-widest uppercase">
                    Your personal laboratory records
                </p>

                {archives.length === 0 ? (
                    <div className="p-20 border border-dashed border-zinc-800 rounded-3xl text-center">
                        <p className="text-zinc-500 italic">No experimental data recorded yet.</p>
                        <Link href="/" className="inline-block mt-4 text-blue-500 font-bold hover:underline">
                            Go explore movies →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {archives.map((item) => (
                            <Link
                                href={`/movie/${item.movieId}`}
                                key={item.id}
                                className="group flex gap-5 bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800/50 hover:border-blue-500/50 transition-all hover:bg-zinc-900/80"
                            >
                                {item.moviePoster ? (
                                    <div className="relative w-24 h-36 rounded-xl overflow-hidden shrink-0 shadow-lg">
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w500${item.moviePoster}`}
                                            alt={item.movieTitle}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-24 h-36 bg-zinc-800 rounded-xl shrink-0" />
                                )}

                                <div className="flex flex-col flex-1 py-1">
                                    <h3 className="font-bold text-lg leading-tight line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">
                                        {item.movieTitle}
                                    </h3>
                                    <p className="text-zinc-400 text-sm italic line-clamp-2 flex-1">
                                        "{item.content}"
                                    </p>

                                    <div className="flex items-center gap-3 mt-4">
                                        <div className="relative w-5 h-7 border-x-2 border-b-2 border-zinc-600 rounded-b-sm bg-zinc-950 overflow-hidden">
                                            <div
                                                className="absolute bottom-0 w-full bg-blue-500/60"
                                                style={{ height: `${(item.waterLevel / 500) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-black text-blue-500 tracking-wider">
                                            {Math.round((item.waterLevel / 500) * 100)}%
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}