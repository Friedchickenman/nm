import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";
// ✨ 방금 만든 진짜 검색창 불러오기!
import SearchInput from "./SearchInput";

export default async function NavBar() {

    const session = await auth();

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-zinc-100">
            <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">

                {/* 왼쪽 로고 및 메뉴 */}
                <div className="flex items-center gap-10">
                    <Link href="/" className="text-lg font-black tracking-tighter hover:opacity-70 transition-opacity">
                        Mvcount
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-zinc-500">

                        {session?.user && (
                            <Link href="/archive" className="hover:text-black transition-colors">Archive</Link>
                        )}

                        <Link href="/" className="hover:text-black transition-colors">Community</Link>
                    </div>
                </div>

                {/* 오른쪽 검색창 및 로그인/아웃 버튼 */}
                <div className="flex items-center gap-6">

                    {/* ✨ 가짜 input을 지우고 진짜 SearchInput으로 교체! */}
                    <SearchInput />

                    {session?.user ? (
                        <div className="flex items-center gap-4">
                            <img
                                src={session.user.image || ""}
                                alt="Profile"
                                className="w-8 h-8 rounded-full border border-zinc-200"
                            />
                            <form action={async () => {
                                "use server";
                                await signOut();
                            }}>
                                <button className="text-[13px] font-semibold text-zinc-400 hover:text-black transition-colors">
                                    Log out
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 text-[13px] font-semibold">
                            <form action={async () => {
                                "use server";
                                await signIn("google");
                            }}>
                                <button className="text-zinc-400 hover:text-black transition-colors">
                                    Log in
                                </button>
                            </form>

                            <form action={async () => {
                                "use server";
                                await signIn("google");
                            }}>
                                <button className="bg-black text-white px-4 py-1.5 rounded-full hover:bg-zinc-800 transition-all">
                                    Sign up
                                </button>
                            </form>
                        </div>
                    )}
                </div>

            </div>
        </nav>
    );
}