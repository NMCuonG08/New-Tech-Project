// UpdatePrompt component - Hiển thị khi có bản cập nhật

export function UpdatePrompt({ onUpdate }) {
    return (
        <div className="sticky top-0 z-50 w-full backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white shadow-lg">
                <span className="text-lg">🔄</span>
                <span className="font-medium">Có bản cập nhật mới!</span>
                <button
                    onClick={onUpdate}
                    className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-blue-600 shadow-md transition-all hover:shadow-xl"
                >
                    Cập nhật ngay
                </button>
            </div>
        </div>
    );
}
