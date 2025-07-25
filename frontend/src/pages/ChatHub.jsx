import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Gift, 
  User,
  Search,
  Heart,
  Star,
  Smile
} from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const ChatHub = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedGift, setSelectedGift] = useState('');
  const messagesEndRef = useRef(null);

  const gifts = [
    { icon: '❤️', name: 'Heart' },
    { icon: '🌹', name: 'Rose' },
    { icon: '⭐', name: 'Star' },
    { icon: '🎁', name: 'Gift' },
    { icon: '☕', name: 'Coffee' },
    { icon: '🍰', name: 'Cake' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const response = await api.chat.getUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await api.chat.getHistory(userId);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await api.chat.sendMessage({
        receiverId: selectedUser.id,
        message: newMessage,
        gift: selectedGift
      });
      
      setNewMessage('');
      setSelectedGift('');
      fetchMessages(selectedUser.id);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 fade-in">
      {/* Users List */}
      <div className="w-80 card-dreamy flex flex-col">
        <div className="p-4 border-b border-beige-100">
          <h2 className="text-lg font-semibold text-beige-900 mb-3">Chat Hub</h2>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-beige-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-dreamy pl-10 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rosegold-500"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center p-8">
              <MessageCircle className="w-12 h-12 text-beige-300 mx-auto mb-3" />
              <p className="text-beige-500">No users found</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredUsers.map((chatUser) => (
                <button
                  key={chatUser.id}
                  onClick={() => setSelectedUser(chatUser)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedUser?.id === chatUser.id
                      ? 'bg-rosegold-100 border border-rosegold-200'
                      : 'hover:bg-beige-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-rosegold-400 to-beige-500 rounded-full flex items-center justify-center text-white font-medium">
                      {chatUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-beige-900 truncate">
                        {chatUser.username}
                      </p>
                      <p className="text-xs text-beige-500">
                        Click to start chatting
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 card-dreamy flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-beige-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-rosegold-400 to-beige-500 rounded-full flex items-center justify-center text-white font-medium">
                  {selectedUser.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-beige-900">{selectedUser.username}</h3>
                  <p className="text-sm text-beige-500">Online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-beige-300 mx-auto mb-3" />
                  <p className="text-beige-500">No messages yet</p>
                  <p className="text-sm text-beige-400">Start the conversation!</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isCurrentUser = message.senderId === user.id;
                  const showDate = index === 0 || 
                    formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);

                  return (
                    <React.Fragment key={message.id}>
                      {showDate && (
                        <div className="text-center">
                          <span className="text-xs text-beige-400 bg-beige-50 px-3 py-1 rounded-full">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          isCurrentUser
                            ? 'bg-rosegold-500 text-white'
                            : 'bg-beige-100 text-beige-900'
                        }`}>
                          <p className="text-sm">{message.message}</p>
                          
                          {message.gift && (
                            <div className="mt-1 flex items-center space-x-1">
                              <span className="text-lg">{message.gift}</span>
                              <span className="text-xs opacity-75">Gift sent</span>
                            </div>
                          )}
                          
                          <p className={`text-xs mt-1 ${
                            isCurrentUser ? 'text-rosegold-100' : 'text-beige-500'
                          }`}>
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-beige-100">
              {/* Gift Selection */}
              <div className="flex items-center space-x-2 mb-3">
                <Gift className="w-4 h-4 text-beige-500" />
                <span className="text-sm text-beige-600">Send a gift:</span>
                {gifts.map((gift) => (
                  <button
                    key={gift.name}
                    onClick={() => setSelectedGift(selectedGift === gift.icon ? '' : gift.icon)}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedGift === gift.icon
                        ? 'bg-rosegold-100 border border-rosegold-300'
                        : 'hover:bg-beige-100'
                    }`}
                    title={gift.name}
                  >
                    <span className="text-lg">{gift.icon}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={sendMessage} className="flex space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 input-dreamy"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-beige-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-beige-600 mb-2">
                Select a user to start chatting
              </h3>
              <p className="text-beige-500">
                Choose someone from the list to begin a conversation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHub;
