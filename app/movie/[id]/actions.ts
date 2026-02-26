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
        await db.review.create({
            data: {
                movieId: formData.movieId,
                waterLevel: formData.waterLevel,
                content: formData.content,
                userId: formData.userId,
            },
        });

        revalidatePath(`/movie/${formData.movieId}`);
        return { success: true };
    } catch (error) {
        console.error("Save failed:", error);
        return { success: false };
    }
}

export async function updateReview({
                                       reviewId,
                                       waterLevel,
                                       content,
                                   }: {
    reviewId: string;
    waterLevel: number;
    content: string;
}) {
    try {
        // 1. Prisma를 통해 DB에 있는 해당 리뷰를 찾아서 값을 덮어씌웁니다.
        await db.review.update({
            where: { id: reviewId },
            data: {
                waterLevel: waterLevel,
                content: content,
            },
        });

        // 2. 화면 새로고침 없이 최신 데이터를 불러오도록 캐시를 날려줍니다.
        revalidatePath("/movie/[id]", "page");

        return { success: true };
    } catch (error) {
        console.error("Failed to update review:", error);
        return { success: false, message: "Failed to update review." };
    }
}

export async function deleteReview(reviewId: string) {
    try {
        await db.review.delete({
            where: { id: reviewId },
        });

        // 삭제 후 화면 새로고침
        revalidatePath("/movie/[id]", "page");

        return { success: true };
    } catch (error) {
        console.error("Failed to delete review:", error);
        return { success: false };
    }
}