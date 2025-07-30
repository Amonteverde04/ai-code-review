import Image from "next/image";

export default function Navbar() {
    return (
        <nav className="flex items-center p-4 navbar-container" aria-label="Navbar">
            <div className="flex items-center gap-2 logo-container" aria-label="Logo container">
                <Image src="/logo.svg" alt="logo" aria-label="logo" width={25} height={25} />
                <h1 className="text-3xl font-bold" aria-label="Logo text">AI Code Review</h1>
            </div>
        </nav>
    );
}