export default function Sidebar() {
    return (
        <div className="w-64 bg-gray-800 p-6 flex flex-col gap-6 border-r border-gray-700">
            <h2 className="text-2xl font-bold tracking-wide">NFL Assistant</h2>

            <nav className="flex flex-col gap-4">
                <a className="hover:text-blue-400 transition">Dashboard</a>
                <a className="hover:text-blue-400 transition">Games</a>
                <a className="hover:text-blue-400 transition">Predictions</a>
                <a className="hover:text-blue-400 transition">Models</a>
            </nav>
        </div>
    );
}
