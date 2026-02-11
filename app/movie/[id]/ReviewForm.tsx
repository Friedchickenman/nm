"use client";

import { useState } from "react";
import { saveReview } from "./actions";

export default function ReviewForm({ movieId, userId }: { movieId: number; userId: string }) {
    const [level, setLevel] = useState(0); // 0~100 (%)
    const [content, setContent] = useState("");
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async () => {
        setIsPending(true);
        // 비커 %를 500ml 기준으로 환산해서 저장
        const waterLevel = Math.round((level / 100) * 500);

        const result = await saveReview({ movieId, waterLevel, content, userId });

        if (result.success) {
            alert("영화의 감동이 비커에 저장되었습니다! 🧪");
            setContent("");
        }
        setIsPending(false);
    };

    return (
        <div className="mt-12 p-8 bg-zinc-900/50 rounded-3xl border border-zinc-800">
            <div className="flex flex-col md:flex-row gap-10 items-center">
                {/* 비커 UI */}
                <div className="relative w-24 h-36 border-x-2 border-b-2 border-zinc-600 rounded-b-lg bg-zinc-800/30 overflow-hidden">
                    <div
                        className="absolute bottom-0 w-full bg-blue-500/50 transition-all duration-500"
                        style={{ height: `${level}%` }}
                    />
                </div>

                {/* 조절 및 입력 섹션 */}
                <div className="flex-1 w-full space-y-4">
                    <input
                        type="range" min="0" max="100" value={level}
                        onChange={(e) => setLevel(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="이 영화에 대한 한 줄 평을 남겨주세요."
                        className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                        {isPending ? "기록 중..." : "비커 채우기 (기록)"}
                    </button>
                </div>
            </div>
        </div>
    );
}