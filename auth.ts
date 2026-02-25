import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
    // 우리가 만든 Prisma DB와 연결합니다. (로그인하면 User 테이블에 자동 저장됨!)
    adapter: PrismaAdapter(db),

    // 구글 로그인을 사용하겠다고 선언합니다.
    providers: [Google],

    // 세션 전략을 설정합니다. (호환성을 위해 jwt 방식 사용)
    session: { strategy: "jwt" },

    callbacks: {
        session({ session, token }) {
            // 토큰(신분증)에 있는 유저 고유 ID를 세션 객체에 강제로 꽂아 넣습니다.
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            return session;
        },
    },
});