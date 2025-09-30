import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { authFetch } from "../utils/api";
import ReactMarkdown from 'react-markdown';
import './styles/BookChatbot.css';

export default function BookChatbot(){
    const {title} = useParams();
    const [messages , setMessages] = useState([
        {
            role : "assistant" , 
            content : `Hello! I'm your AI reading companion for "${title}". I'm here to discuss the book, answer questions, explore themes, and help you dive deeper into the story. What would you like to know?`
        }
    ]);
    const [input  , setInput] = useState("");
    const [Loading,setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, Loading]);

    const sendMessage = async ()=>{
        if(!input.trim()) return;
        const newMessage = {role : 'user' , content : input};
        setMessages([...messages,newMessage]);
        setInput("");
        setLoading(true);

        try{
            const res = await authFetch('/bookai/chat',{
                method : 'POST',
                body : JSON.stringify({question : input,title:title})
            });
            const data = await res.json();
            setMessages((prev)=>[
                ...prev,
                {role:'assistant',content:data.answer || "I apologize, but I couldn't generate a response. Please try asking your question again."}
            ])
        }catch(err){
            setMessages((prev)=>[
                ...prev,
                {role:'assistant',content:"I'm having trouble connecting right now. Please check your connection and try again."}
            ]);
        }
        finally{
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="chatbot-container">
            <div className="chatbot-header">
                <div className="header-content">
                    <div className="ai-avatar">
                        <div className="avatar-icon">📚</div>
                        <div className="status-indicator"></div>
                    </div>
                    <div className="header-text">
                        <h2>Book AI Assistant</h2>
                        <p>Discussing: <span className="book-title">"{title}"</span></p>
                    </div>
                </div>
            </div>

            <div className="chatbot-messages">
                {messages.map((msg, i) => (
                    <div key={i} className={`message-wrapper ${msg.role}`}>
                        <div className="message-avatar">
                            {msg.role === 'user' ? (
                                <div className="user-avatar">👤</div>
                            ) : (
                                <div className="ai-avatar-small">🤖</div>
                            )}
                        </div>
                        <div className="message-content">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                    </div>
                ))}
                
                {Loading && (
                    <div className="message-wrapper assistant">
                        <div className="message-avatar">
                            <div className="ai-avatar-small">🤖</div>
                        </div>
                        <div className="message-content typing-indicator">
                            <div className="typing-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <span className="typing-text">AI is thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-input-container">
                <div className="input-wrapper">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything about the book..."
                        rows="1"
                        disabled={Loading}
                    />
                    <button 
                        onClick={sendMessage} 
                        disabled={!input.trim() || Loading}
                        className="send-button"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div className="input-hint">
                    Press Enter to send • Shift + Enter for new line
                </div>
            </div>
        </div>
    );
}