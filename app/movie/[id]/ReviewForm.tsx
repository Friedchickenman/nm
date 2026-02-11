"use client";

import { useState } from "react";
import { saveReview } from "./actions";

export default function ReviewForm({ movieId, userId }: { movieId: number; userId: string }) {
    const [level, setLevel] = useState(0); // 비커 물 높이 (0, 10, 20... 100)
    const [content, setContent] = useState(""); // 한 줄 평 내용
    const [isPending, setIsPending] = useState(false); // 저장 중 상태 확인

    const handleSubmit = async () => {
        setIsPending(true);

        // 10% 단위로 끊긴 level 값을 500ml 기준으로 환산 (예: 20% -> 100ml)
        const waterLevel = Math.round((level / 100) * 500);

        // 서버 액션을 통해 DB에 저장
        const result = await saveReview({ movieId, waterLevel, content, userId });

        if (result.success) {
            alert("Movie vibe saved to your beaker! 🧪");
            setContent("");
        } else {
            alert("Failed to save. Please try again.");
        }
        setIsPending(false);
    };

    return (
        <div className="mt-12 p-8 bg-zinc-900/40 rounded-3xl border border-zinc-800/50 backdrop-blur-md">
            <div className="flex flex-col md:flex-row gap-12 items-center">

                {/* 비커 시각화 영역 */}
                <div className="relative w-28 h-40 border-x-4 border-b-4 border-zinc-500 rounded-b-2xl bg-zinc-800/20 overflow-hidden">
                    <div
                        className="absolute bottom-0 w-full bg-blue-500/40 transition-all duration-700 ease-out"
                        style={{ height: `${level}%` }}
                    >
                        <div className="absolute top-0 w-full h-1 bg-blue-300/50 animate-pulse" />
                    </div>
                </div>

                {/* 인터렉션 영역 (슬라이더 및 입력창) */}
                <div className="flex-1 w-full space-y-6">
                    <div>
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4 block">
                            Adjust Water Level: {level}%
                        </label>
                        {/* step="10" 속성을 추가하여 10% 단위로만 조절되게 만듭니다. */}
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="10" // 👈 이 부분이 핵심입니다! 0, 10, 20... 순으로 움직입니다.
                            value={level}
                            onChange={(e) => setLevel(Number(e.target.value))}
                            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>

                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your one-line review here..."
                        className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                        rows={3}
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-tighter transition-all disabled:opacity-50"
                    >
                        {isPending ? "Syncing..." : "Record Mood"}
                    </button>
                </div>
            </div>
        </div>
    );
}