export default function BookCard({ book, onLike }) {
return (
<div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 10 }}>
<div style={{ fontWeight: 700 }}>{book.title}</div>
<div style={{ color: '#555' }}>{book.author}</div>
<div style={{ fontSize: 12, margin: '6px 0' }}>{(book.genres || []).join(', ')}</div>
<button onClick={() => onLike?.(book._id)}>❤️ Like</button>
</div>
);
}