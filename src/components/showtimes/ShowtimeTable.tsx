type Showtime = {
    id: number;
    movieTitle: string;
    cinemaName: string;
    startTime: string;
    endTime: string;
};

type Props = {
    items: Showtime[];
    onDelete: (row: Showtime) => Promise<void> | void;
    busyId: number | null;
};

export default function ShowtimeTable({ items, onDelete, busyId }: Props) {
    return (
        <div className="cinema-table-card" style={{ marginTop: 16, maxWidth: 980 }}>
            <table className="cinema-table">
                <thead>
                    <tr>
                        <th>Movie Title</th>
                        <th>Cinema</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th className="w-1">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan={5} style={{ padding: 16, textAlign: "center", color: "#6b7280" }}>
                                No showtimes yet. Add your first showtime above.
                            </td>
                        </tr>
                    ) : (
                        items.map((s) => (
                            <tr key={s.id}>
                                <td className="font-medium">{s.movieTitle}</td>
                                <td>{s.cinemaName}</td>
                                <td>{new Date(s.startTime).toLocaleString()}</td>
                                <td>{new Date(s.endTime).toLocaleString()}</td>
                                <td style={{ textAlign: "right" }}>
                                    <button
                                        onClick={() => onDelete(s)}
                                        disabled={busyId === s.id}
                                        className="danger"
                                    >
                                        {busyId === s.id ? "Deleting…" : "Delete"}
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
