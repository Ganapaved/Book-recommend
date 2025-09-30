import {useParams} from 'react-router-dom';
import { useEffect,useState } from 'react';
import { authFetch } from '../utils/api';
import BookChatbot from './Bookchatbot'; 
import { Link } from 'react-router-dom';

export default function Bookpreview() {
    const  {id} = useParams();
    const [chatOpen , setChatOpen] = useState(false);
    const [book , setBook] = useState(null);

    useEffect(()=>{
        authFetch(`/book/${id}`)
        .then((res)=>res.json())
        .then((data)=>setBook(data.book_present))
    },[id]);

    if(!book) return <div>Loading Book...</div>

    return (
        <div className="bookpreview-container">
            <div className="bookpreview-card">
                {book.photo ? (
                    <img
                    src={`data:image/jpeg;base64,${book.photo}`}
                    alt={`Cover for ${book.title}`}
                    className="bookpreview-img"
                    />
                ) : (
                    <img
                    src="https://via.placeholder.com/150"
                    alt="No cover available"
                    className="bookpreview-img"
                    />
                )}
                <div className="bookpreview-info">
                    <h2 className="bookpreview-title">{book.title}</h2>
                    <p className="bookpreview-author"><strong>Author:</strong> {book.author}</p>
                    <p className="bookpreview-genres"><strong>Genres:</strong> {book.genres.join(", ")}</p>
                    <p className="bookpreview-desc"><strong>Description:</strong> {book.description}</p>
                </div>
            </div>
           
            <div className="chat-btn-wrapper">
                <div className="chat-btn-overlay"></div>
                <Link to={`/bookai/${book.title}`}>
                    <button className="chat-btn" onClick={() => setChatOpen(true)}>
                    🤖 Ask AI about book
                    </button>
                </Link>
            </div>
        </div>
    );
}

