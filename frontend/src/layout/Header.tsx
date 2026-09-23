import { useEffect, useState } from "react";

export default function Header() {
    const [dark, setDark] = useState(true);

    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [dark]);

    return (
        <header className="p-6 border-b border-gray-700 bg-gray-800 dark:bg-gray-900 flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-wide">NFL Betting Assistant</h1>

            <button
                onClick={() => setDark(!dark)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition"
            >
                {dark ? "Light Mode" : "Dark Mode"}
            </button>
        </header>
    );
}
