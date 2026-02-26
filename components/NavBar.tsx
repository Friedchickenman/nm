import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";

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
                        <Link href="/" className="hover:text-black transition-colors">Discover</Link>

                        {/* ✨ 로그인한 유저에게만 Archive(마이페이지) 버튼을 보여줍니다! */}
                        {session?.user && (
                            <Link href="/archive" className="hover:text-black transition-colors">Archive</Link>
                        )}

                        <Link href="/" className="hover:text-black transition-colors">Community</Link>
                    </div>
                </div>

                {/* 오른쪽 검색창 및 로그인/아웃 버튼 */}
                <div className="flex items-center gap-6">
                    <div className="relative hidden sm:block">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-40 bg-zinc-100 border-none rounded-full py-1.5 px-4 text-xs focus:w-60 focus:ring-1 focus:ring-zinc-300 transition-all outline-none"
                        />
                    </div>

                    {session?.user ? (
                        // 로그인된 상태
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
                        // 로그아웃 상태
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