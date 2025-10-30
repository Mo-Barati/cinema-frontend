type Cinema = {
    id: number;
    name: string;
    address?: string;
    city?: string;
    postcode?: string;
    phone?: string;
    email?: string;
};

type Props = {
    items: Cinema[];
    onDelete: (row: Cinema) => Promise<void> | void;
    busyId: number | null;
};

export default function CinemaTable({ items, onDelete, busyId }: Props) {
    return (
        <div className="cinema-table-card" style={{ marginTop: 16, maxWidth: 980 }}>
            <table className="cinema-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Address</th>
                        <th>City</th>
                        <th>Postcode</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th className="w-1">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan={7} style={{ padding: 16, textAlign: "center", color: "#6b7280" }}>
                                No cinemas yet. Add your first cinema above.
                            </td>
                        </tr>
                    ) : (
                        items.map((c) => (
                            <tr key={c.id}>
                                <td className="font-medium">{c.name}</td>
                                <td>{c.address || "—"}</td>
                                <td>{c.city || "—"}</td>
                                <td>{c.postcode || "—"}</td>
                                <td>{c.phone || "—"}</td>
                                <td>{c.email || "—"}</td>
                                <td style={{ textAlign: "right" }}>
                                    <button
                                        onClick={() => onDelete(c)}
                                        disabled={busyId === c.id}
                                        className="danger"
                                    >
                                        {busyId === c.id ? "Deleting…" : "Delete"}
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
  