"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchInput() {
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault(); // 엔터 쳤을 때 페이지 새로고침 되는 거 방지!
        if (!query.trim()) return;

        // 검색어를 달고 검색 결과 페이지로 이동! (예: /search?q=아이언맨)
        router.push(`/search?q=${encodeURIComponent(query)}`);
    };

    return (
        <form onSubmit={handleSearch} className="relative hidden sm:block">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies..."
                // ✨ 기존 성준님 디자인 그대로 가져왔습니다! 글자색만 검은색으로 고정.
                className="w-40 bg-zinc-100 border-none rounded-full py-1.5 px-4 text-xs focus:w-60 focus:ring-1 focus:ring-zinc-300 transition-all outline-none text-black"
            />
        </form>
    );
}