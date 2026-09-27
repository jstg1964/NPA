import { useEffect, useState } from "react";

export default function Header() {
    const [dark, setDark] = useState(true);

    // Light mode toggle logic preserved — re-add a button here to use it
    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [dark]);

    // Suppress unused warning — remove when button is re-added
    void setDark;

    return (
        <header className="p-6 border-b border-gray-700 bg-gray-800 dark:bg-gray-900 flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-wide">NFL Betting Assistant</h1>
        </header>
    );
}
