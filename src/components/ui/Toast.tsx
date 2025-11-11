// cinema-frontend/src/components/ui/Toast.tsx
export default function Toast({ msg }: { msg: string }) {
    if (!msg) return null;
    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed right-6 bottom-6 bg-black text-white px-4 py-2 rounded-xl shadow"
        >
            {msg}
        </div>
    );
}
