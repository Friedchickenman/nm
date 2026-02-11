import Link from "next/link";

export default function NavBar() {
    return (
        <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-zinc-100">
            <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">

                <div className="flex items-center gap-10">
                    <Link href="/" className="text-lg font-black tracking-tighter hover:opacity-70 transition-opacity">
                        Mvcount
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-zinc-500">
                        <Link href="/" className="hover:text-black transition-colors">Discover</Link>
                        <Link href="/" className="hover:text-black transition-colors">Archive</Link>
                        <Link href="/" className="hover:text-black transition-colors">Community</Link>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative hidden sm:block">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-40 bg-zinc-100 border-none rounded-full py-1.5 px-4 text-xs focus:w-60 focus:ring-1 focus:ring-zinc-300 transition-all outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-4 text-[13px] font-semibold">
                        <Link href="/login" className="text-zinc-400 hover:text-black transition-colors">
                            Log in
                        </Link>
                        <Link href="/login" className="bg-black text-white px-4 py-1.5 rounded-full hover:bg-zinc-800 transition-all">
                            Sign up
                        </Link>
                    </div>
                </div>

            </div>
        </nav>
    );
}