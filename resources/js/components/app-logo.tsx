

export default function AppLogo() {
    return (
        <>
            <div className="flex size-8 items-center justify-center overflow-hidden rounded-lg">
                <img src="/logo.webp" alt="Logo" className="size-full object-cover" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-bold text-primary">
                    Kawaii Animes
                </span>
            </div>
        </>
    );
}
