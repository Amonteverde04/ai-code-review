import { ROUTES } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 gap-4 md:gap-0 navbar-container" aria-label="Navbar">
          <div className="flex items-center gap-2 logo-container" aria-label="Logo container">
            <Image src="/logo.svg" alt="logo" aria-label="logo" width={25} height={25} />
            <h1 className="text-2xl md:text-3xl font-bold" aria-label="Logo text">AI Code Review</h1>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 w-full md:w-auto">
            {ROUTES.map((route, index) => (
              <Link href={route.path}
                key={index}
                className="text-base md:text-lg font-bold nav-link flex items-center gap-2">
                <route.icon className="w-5 h-5" aria-label={route.name + ' icon'} />
                <p>{route.name}</p>
              </Link>
            ))}
          </div>
        </nav>
    );
}