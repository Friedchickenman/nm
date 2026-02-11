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