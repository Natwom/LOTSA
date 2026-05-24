import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AdminAuthContext';
import axios from '../api/axios';
import { Send, Shield, Users, Hash } from 'lucide-react';

export default function AdminChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    axios.get('/chats/conversations').then((res) => setConversations(res.data));
    const token = localStorage.getItem('admin_token');
    ws.current = new WebSocket(`ws://localhost:8000/api/chats/ws?token=${token}`);
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') setMessages((prev) => [...prev, data.payload]);
    };
    return () => ws.current?.close();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async (convId) => {
    setActiveConv(convId);
    const res = await axios.get(`/chats/conversations/${convId}/messages`);
    setMessages(res.data);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeConv) return;
    ws.current.send(JSON.stringify({ type: 'send_message', conversation_id: activeConv, content: input }));
    setInput('');
  };

  const sendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    // Broadcast to all active conversations
    conversations.forEach((conv) => {
      ws.current.send(JSON.stringify({ type: 'send_message', conversation_id: conv.id, content: `📢 ADMIN BROADCAST: ${broadcastMsg}` }));
    });
    setBroadcastMsg('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Chat Moderation</h1>
          <p className="text-gray-500 mt-1">Monitor conversations and send broadcasts</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Shield size={16} /> Admin Broadcast
        </h3>
        <form onSubmit={sendBroadcast} className="flex gap-2">
          <input
            value={broadcastMsg}
            onChange={(e) => setBroadcastMsg(e.target.value)}
            placeholder="Send announcement to all chat groups..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 text-sm">
            Broadcast
          </button>
        </form>
      </div>

      <div className="flex h-[calc(100vh-20rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Users size={18} /> Conversations
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => loadMessages(conv.id)}
                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${activeConv === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
              >
                <div className="flex items-center gap-2">
                  {conv.is_group ? <Hash size={14} className="text-gray-400" /> : <Users size={14} className="text-gray-400" />}
                  <span className="font-medium text-gray-800 text-sm">{conv.name || 'Private Chat'}</span>
                </div>
                <div className="text-xs text-gray-500 truncate mt-1 pl-5">{conv.last_message || 'No messages'}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {activeConv ? (
            <>
              <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                <Shield size={14} className="text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Moderator View</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${msg.sender_id === user?.id ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'}`}
                    >
                      <div className="text-xs opacity-70 mb-1">{msg.sender_id === user?.id ? 'You' : `User #${msg.sender_id}`}</div>
                      {msg.content}
                      <div className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-blue-200' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 flex gap-2 bg-white">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message as admin..."
                  className="flex-1 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button type="submit" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50">Select a conversation to monitor</div>
          )}
        </div>
      </div>
    </div>
  );
}