"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveReview(formData: {
    movieId: number;
    waterLevel: number;
    content: string;
    userId: string;
}) {
    try {
        // 1. Prisma를 사용해 Review 테이블에 새 데이터 생성
        await db.review.create({
            data: {
                movieId: formData.movieId,
                waterLevel: formData.waterLevel,
                content: formData.content,
                userId: formData.userId,
            },
        });

        // 2. 데이터가 바뀌었으니 상세 페이지를 새로고침하여 반영
        revalidatePath(`/movie/${formData.movieId}`);
        return { success: true };
    } catch (error) {
        console.error("저장 실패:", error);
        return { success: false };
    }
}