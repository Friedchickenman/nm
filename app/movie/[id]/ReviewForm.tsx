"use client";

import { useState } from "react";
// ✨ 이따가 만들 updateReview 액션도 미리 불러옵니다. (빨간 줄 떠도 무시하세요!)
import { saveReview, updateReview } from "./actions";

// ✨ 1. Props에 수정 모드를 위한 선택적(Optional) 항목들을 추가합니다.
interface ReviewFormProps {
    movieId: number;
    userId: string;
    reviewId?: string;           // 수정할 리뷰의 ID (이게 있으면 수정 모드!)
    initialWaterLevel?: number;  // 기존 DB에 있던 물 높이 (0~500)
    initialContent?: string;     // 기존 리뷰 내용
    onCancel?: () => void;       // 수정 취소 버튼을 눌렀을 때 실행할 함수
}

export default function ReviewForm({
                                       movieId,
                                       userId,
                                       reviewId,
                                       initialWaterLevel,
                                       initialContent,
                                       onCancel
                                   }: ReviewFormProps) {
    // ✨ 2. 기존 데이터가 있으면 퍼센트로 변환해서 초기값으로 세팅하고, 없으면 0으로 둡니다.
    const initialPercent = initialWaterLevel ? Math.round((initialWaterLevel / 500) * 100) : 0;

    const [level, setLevel] = useState(initialPercent);
    const [content, setContent] = useState(initialContent || "");
    const [isPending, setIsPending] = useState(false);

    // reviewId가 전달되었다면 이 폼은 "수정 모드"로 작동합니다.
    const isEditMode = !!reviewId;

    const handleSubmit = async () => {
        if (!content.trim()) return alert("Please share your vibe first!");

        setIsPending(true);
        const waterLevel = Math.round((level / 100) * 500);

        // ✨ 3. 모드에 따라 다른 서버 액션을 실행합니다.
        let result;
        if (isEditMode) {
            // 수정 모드: updateReview 실행
            result = await updateReview({ reviewId, waterLevel, content });
        } else {
            // 작성 모드: 기존 saveReview 실행
            result = await saveReview({ movieId, waterLevel, content, userId });
        }

        if (result.success) {
            if (isEditMode && onCancel) {
                onCancel(); // 수정을 성공적으로 마쳤으면 폼을 닫아줍니다.
            } else {
                setContent(""); // 새 글 작성이면 입력창을 비워줍니다.
                setLevel(0);
            }
        } else {
            alert("Failed to sync with the lab. Try again.");
        }
        setIsPending(false);
    };

    return (
        <div className="mt-12 p-8 bg-zinc-900/40 rounded-3xl border border-zinc-800/50 backdrop-blur-md">
            <div className="flex flex-col md:flex-row gap-12 items-center">

                {/* 비커 시각화 영역 (기존과 동일) */}
                <div className="relative w-28 h-40 border-x-4 border-b-4 border-zinc-500 rounded-b-2xl bg-zinc-800/20 overflow-hidden shrink-0">
                    <div
                        className="absolute bottom-0 w-full bg-blue-500/40 transition-all duration-700 ease-out"
                        style={{ height: `${level}%` }}
                    >
                        <div className="absolute top-0 w-full h-1 bg-blue-300/50 animate-pulse" />
                    </div>
                </div>

                {/* 인터렉션 영역 */}
                <div className="flex-1 w-full space-y-6">
                    <div>
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4 block">
                            Adjust Water Level: {level}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="10"
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

                    {/* ✨ 4. 버튼 영역: 수정 모드일 때는 취소 버튼도 함께 보여줍니다. */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleSubmit}
                            disabled={isPending}
                            className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-tighter transition-all disabled:opacity-50"
                        >
                            {isPending ? "Syncing..." : (isEditMode ? "Update Mood" : "Record Mood")}
                        </button>

                        {isEditMode && onCancel && (
                            <button
                                onClick={onCancel}
                                disabled={isPending}
                                className="px-6 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-black text-sm uppercase tracking-tighter transition-all"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}