import { SymbolIcon } from "@radix-ui/react-icons";

interface LoadingProps {
    text: string;
    justify: "justify-center" | "justify-start" | "justify-end";
}

export default function Loading({ text, justify }: LoadingProps) {
    return (
        <div className={`flex flex-row gap-2 items-center ${justify}`} aria-label="Loading container">
            <SymbolIcon className="w-5 h-5 animate-spin" aria-label="Loading icon" />
            <p className="dots">{text}<span className="dot-container"><span className="dot-animation"></span></span></p>
        </div>
    );
}