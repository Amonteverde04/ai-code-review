interface ToastProps {
    title: string;
    icon: React.ReactNode;
}

export default function ErrorToast({ title, icon }: ToastProps) {
    return (
    <div className="flex flex-col gap-2 warning-container glow-container" aria-label="Warning container">
        <div className="flex sm:flex-row flex-col gap-2 items-center" aria-label="Warning message">
            {icon}
            <h1>{title}</h1>
        </div>
    </div>
    );
}