import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from '../api/axios'
import { Send, Paperclip, Image as ImageIcon, MessageSquare, Users, Search, User, Plus, X, UsersRound } from 'lucide-react'

// FIX: Nairobi time formatters
const formatNairobiTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-GB', {
    timeZone: 'Africa/Nairobi',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

const formatNairobiDateTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  
  if (isToday) {
    return date.toLocaleTimeString('en-GB', {
      timeZone: 'Africa/Nairobi',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }
  return date.toLocaleDateString('en-GB', {
    timeZone: 'Africa/Nairobi',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

const formatChatTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  
  if (isToday) {
    return date.toLocaleTimeString('en-GB', {
      timeZone: 'Africa/Nairobi',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }
  return date.toLocaleDateString('en-GB', {
    timeZone: 'Africa/Nairobi',
    day: 'numeric',
    month: 'short'
  })
}

export default function Chat() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [users, setUsers] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [activeTab, setActiveTab] = useState('messages')
  const [searchQuery, setSearchQuery] = useState('')
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [creatingGroup, setCreatingGroup] = useState(false)
  const ws = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchConversations()
    fetchUsers()

    const token = localStorage.getItem('token')
    const WS_BASE = 'wss://lotsa-api.onrender.com'
    
    const connect = () => {
      ws.current = new WebSocket(`${WS_BASE}/api/chats/ws?token=${token}`)

      ws.current.onopen = () => console.log('✅ WebSocket connected')
      
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log('📨 Received:', data)
        if (data.type === 'message') {
          setMessages(prev => [...prev, data.payload])
          fetchConversations()
        }
      }

      ws.current.onclose = (e) => {
        console.log('❌ WebSocket closed:', e.code, e.reason)
        if (e.code !== 1008) {
          setTimeout(connect, 3000)
        }
      }

      ws.current.onerror = (err) => {
        console.error('WebSocket error:', err)
      }
    }

    connect()

    return () => {
      if (ws.current) {
        ws.current.onclose = null
        ws.current.close()
      }
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = () => {
    axios.get('/chats/conversations').then(res => {
      // FIX: ensure most recent is first (backend sorts, but double-check)
      const sorted = (res.data || []).sort((a, b) => {
        const aTime = a.last_message_at ? new Date(a.last_message_at) : new Date(a.created_at)
        const bTime = b.last_message_at ? new Date(b.last_message_at) : new Date(b.created_at)
        return bTime - aTime
      })
      setConversations(sorted)
    }).catch(() => {})
  }

  const fetchUsers = () => {
    axios.get('/auth/users').then(res => {
      const all = (res.data || []).filter(u => u.id !== user?.id)
      setUsers(all)
    }).catch(() => {})
  }

  const loadMessages = async (convId) => {
    setActiveConv(convId)
    try {
      const res = await axios.get(`/chats/conversations/${convId}/messages`)
      setMessages(res.data || [])
    } catch (err) {
      console.error('Failed to load messages', err)
    }
  }

  const startConversation = async (otherUser) => {
    try {
      const res = await axios.post('/chats/conversations', {
        is_group: false,
        participant_ids: [otherUser.id]
      })
      const newConv = res.data
      setConversations(prev => {
        const exists = prev.find(c => c.id === newConv.id)
        if (exists) return prev
        return [newConv, ...prev]
      })
      setActiveTab('messages')
      loadMessages(newConv.id)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to start conversation')
    }
  }

  const createGroup = async (e) => {
    e.preventDefault()
    if (!groupName.trim()) return
    setCreatingGroup(true)
    try {
      const res = await axios.post('/chats/groups', {
        is_group: true,
        name: groupName.trim(),
        participant_ids: []
      })
      const newConv = res.data
      setConversations(prev => [newConv, ...prev])
      setShowGroupModal(false)
      setGroupName('')
      setActiveTab('messages')
      loadMessages(newConv.id)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create group')
    }
    setCreatingGroup(false)
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (!input.trim() || !activeConv) return
    
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      alert('Connection lost. Please refresh the page.')
      return
    }
    
    ws.current.send(JSON.stringify({
      type: 'send_message',
      conversation_id: activeConv,
      content: input.trim()
    }))
    setInput('')
  }

  const activeConversation = conversations.find(c => c.id === activeConv)
  const filteredUsers = users.filter(u =>
    (u.profile?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-lg">Chat</h2>
            <button
              onClick={() => setShowGroupModal(true)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Create Group Chat"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'messages' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <MessageSquare size={14} /> Messages
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <Users size={14} /> Users
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'messages' ? (
            conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                No conversations yet.<br />Click + to create a group or switch to "Users" to DM.
              </div>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => loadMessages(conv.id)}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-white transition-colors ${activeConv === conv.id ? 'bg-white border-l-4 border-l-blue-600' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      {conv.is_group && <UsersRound size={14} className="text-blue-500 shrink-0" />}
                      <div className="font-medium text-gray-900 truncate">
                        {conv.name || 'Private Chat'}
                      </div>
                    </div>
                    {/* FIX: Show Nairobi time of last message */}
                    {conv.last_message_at && (
                      <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                        {formatChatTime(conv.last_message_at)}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 truncate mt-0.5">
                    {conv.last_message || 'No messages yet'}
                  </div>
                </button>
              ))
            )
          ) : (
            <>
              <div className="p-3 border-b border-gray-200 bg-white sticky top-0">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {filteredUsers.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">No users found</div>
              ) : (
                filteredUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => startConversation(u)}
                    className="w-full text-left p-4 border-b border-gray-100 hover:bg-white transition-colors flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {u.profile?.full_name || u.email}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {u.profile?.admission_number || u.email}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConv ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {activeConversation?.is_group
                  ? <UsersRound size={14} />
                  : (activeConversation?.name || 'C').charAt(0).toUpperCase()
                }
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">
                  {activeConversation?.name || 'Chat'}
                </h3>
                <p className="text-xs text-gray-500">
                  {activeConversation?.is_group ? 'Group chat' : `${messages.length} messages`}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-8">No messages yet. Say hello!</div>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.sender_id === user?.id
                let senderName = 'Unknown'
                if (isMe) {
                  senderName = 'You'
                } else if (msg.sender_name && msg.sender_name !== 'Unknown') {
                  senderName = msg.sender_name
                } else if (msg.sender?.profile?.full_name) {
                  senderName = msg.sender.profile.full_name
                } else if (msg.sender?.email) {
                  senderName = msg.sender.email
                }

                return (
                  <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      {(activeConversation?.is_group || !isMe) && (
                        <span className={`text-xs font-semibold mb-0.5 px-1 ${isMe ? 'text-blue-600' : 'text-gray-500'}`}>
                          {senderName}
                        </span>
                      )}
                      <div className={`px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                        {msg.content}
                        {/* FIX: Nairobi time in message bubbles */}
                        <div className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                          {msg.created_at ? formatNairobiTime(msg.created_at) : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 flex gap-2">
              <button type="button" className="p-2 text-gray-400 hover:text-gray-600"><Paperclip size={20} /></button>
              <button type="button" className="p-2 text-gray-400 hover:text-gray-600"><ImageIcon size={20} /></button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button type="submit" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
            <MessageSquare size={48} className="opacity-30" />
            <p className="text-sm">Select a conversation or a user to start chatting</p>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <UsersRound size={20} className="text-blue-600" /> New Group Chat
              </h3>
              <button onClick={() => setShowGroupModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              This will create a group with <strong>all registered students</strong> automatically.
            </p>
            <form onSubmit={createGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                <input
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g., General Announcements"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                <Users size={16} className="inline mr-1" />
                All {users.length + 1} registered members will be added automatically
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingGroup}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  {creatingGroup ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}