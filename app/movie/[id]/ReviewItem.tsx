"use client";

import { useState } from "react";
import ReviewForm from "./ReviewForm";

// 타입 정의 (Prisma에서 불러온 리뷰 데이터 모양)
interface ReviewItemProps {
    review: {
        id: string;
        content: string;
        waterLevel: number;
        userId: string;
        user: { name: string | null } | null;
    };
    currentUserId?: string; // 현재 로그인한 사람의 ID
    movieId: number;
}

export default function ReviewItem({ review, currentUserId, movieId }: ReviewItemProps) {
    // ✨ 이 스위치가 true가 되면 리뷰 텍스트 대신 '수정 폼'이 나타납니다!
    const [isEditing, setIsEditing] = useState(false);

    // ✨ 핵심: 지금 로그인한 사람과, 이 글을 쓴 사람의 ID가 같은지 확인!
    const isMyReview = currentUserId === review.userId;

    // 1. [수정 모드] 일 때의 화면 (ReviewForm 재활용!)
    if (isEditing) {
        return (
            <div className="border-b border-zinc-900 pb-10">
                <ReviewForm
                    movieId={movieId}
                    userId={currentUserId!} // 수정 모드일 땐 무조건 내 글이므로 ! 사용
                    reviewId={review.id}
                    initialWaterLevel={review.waterLevel}
                    initialContent={review.content}
                    onCancel={() => setIsEditing(false)} // 취소 버튼 누르면 폼 닫기
                />
            </div>
        );
    }

    // 2. [일반 모드] 일 때의 화면 (기존 성준님의 힙한 리스트 디자인 그대로!)
    return (
        <div className="flex gap-8 items-start border-b border-zinc-900 pb-10 group">
            {/* 작은 비커 아이콘 */}
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

                    {/* ✨ 내 글일 때만 [Edit] 버튼이 나타납니다! (마우스 올리면 스윽 나타남) */}
                    {isMyReview && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-3">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-xs font-bold text-zinc-500 hover:text-blue-500 transition-colors uppercase tracking-widest"
                            >
                                Edit
                            </button>
                        </div>
                    )}
                </div>
                <p className="text-lg italic text-zinc-200">"{review.content}"</p>
            </div>
        </div>
    );
}