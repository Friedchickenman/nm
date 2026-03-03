"use client";

import { useState } from "react";
import ReviewForm from "./ReviewForm";
import { deleteReview } from "./actions";

// 1. 타입 정의 수정: content가 null일 수 있음을 명시합니다.
interface ReviewItemProps {
    review: {
        id: string;
        content: string | null; // ✨ string에서 string | null로 변경하여 에러 해결
        waterLevel: number;
        userId: string;
        user: { name: string | null } | null;
    };
    currentUserId?: string;
    movieId: number;
}

export default function ReviewItem({ review, currentUserId, movieId }: ReviewItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const isMyReview = currentUserId === review.userId;

    // [수정 모드] 화면
    if (isEditing) {
        return (
            <div className="border-b border-zinc-900 pb-10">
                <ReviewForm
                    movieId={movieId}
                    userId={currentUserId!}
                    reviewId={review.id}
                    initialWaterLevel={review.waterLevel}
                    initialContent={review.content ?? ""} // ✨ null일 경우 빈 문자열 전달
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        );
    }

    // [일반 모드] 화면
    return (
        <div className="flex gap-8 items-start border-b border-zinc-900 pb-10 group">
            {/* 비커 아이콘 */}
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

                    {isMyReview && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-xs font-bold text-zinc-500 hover:text-blue-500 transition-colors uppercase tracking-widest"
                            >
                                Edit
                            </button>
                            <button
                                onClick={async () => {
                                    if (confirm("Are you sure you want to discard this beaker? 🗑️")) {
                                        await deleteReview(review.id);
                                    }
                                }}
                                className="text-xs font-bold text-red-500 hover:text-red-400 transition-all uppercase tracking-widest"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* 텍스트 렌더링: content가 null이면 안내 문구를 띄워 런타임 에러를 방지합니다. */}
                <p className="text-lg italic text-zinc-200">
                    {review.content || "No detailed observation provided."}
                </p>
            </div>
        </div>
    );
}