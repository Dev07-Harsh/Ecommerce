import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  MessageSquare,
  Send,
  Clock,
  Plus,
  Search
} from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'closed' | 'in_progress';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  last_updated: string;
  messages: Message[];
}

interface Message {
  id: string;
  content: string;
  sender_type: 'merchant' | 'admin';
  sender_name: string;
  created_at: string;
}

interface NewTicket {
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const Support: React.FC = () => {
  const { accessToken, user } = useAuth();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed' | 'in_progress'>('all');
  
  // New ticket form state with proper typing
  const [newTicket, setNewTicket] = useState<NewTicket>({
    subject: '',
    description: '',
    priority: 'medium'
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch tickets
  useEffect(() => {
    const fetchTickets = async () => {
      if (!accessToken) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/merchant/support-tickets`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch tickets');
        
        const data = await response.json();
        setTickets(data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast.error('Failed to load support tickets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [accessToken]);

  // Create new ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('subject', newTicket.subject);
      formData.append('description', newTicket.description);
      formData.append('priority', newTicket.priority);
      
      // Append all attachments
      attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });

      const response = await fetch(`${API_BASE_URL}/api/merchant/support-tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to create ticket');
      
      const createdTicket = await response.json();
      setTickets(prev => [createdTicket, ...prev]);
      setShowNewTicketForm(false);
      setNewTicket({ subject: '', description: '', priority: 'medium' });
      setAttachments([]);
      toast.success('Support ticket created successfully');
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create support ticket');
    }
  };

  // Send new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/merchant/support-tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newMessage })
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const message = await response.json();
      setSelectedTicket(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message]
      } : null);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Filter tickets based on search and status
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF4D00]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Support</h1>
          <p className="mt-1 text-sm text-gray-500">Get help from our support team</p>
        </div>
        <button
          onClick={() => setShowNewTicketForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF4D00] hover:bg-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF4D00]"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Ticket
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full border border-gray-300 rounded-md shadow-sm focus:ring-[#FF4D00] focus:border-[#FF4D00]"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className="border border-gray-300 rounded-md shadow-sm focus:ring-[#FF4D00] focus:border-[#FF4D00]"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Ticket List and Chat Interface */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ticket List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Your Tickets</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {filteredTickets.map(ticket => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedTicket?.id === ticket.id ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{ticket.subject}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ticket.description}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    ticket.status === 'open' ? 'bg-green-100 text-green-800' :
                    ticket.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(ticket.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {selectedTicket ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">{selectedTicket.subject}</h2>
                <div className="mt-1 flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedTicket.priority === 'high' ? 'bg-red-100 text-red-800' :
                    selectedTicket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedTicket.priority} priority
                  </span>
                </div>
              </div>
              
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {selectedTicket.messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'merchant' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.sender_type === 'merchant'
                        ? 'bg-[#FF4D00] text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-75">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-md shadow-sm focus:ring-[#FF4D00] focus:border-[#FF4D00]"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF4D00] hover:bg-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF4D00] disabled:opacity-50"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                <p>Select a ticket to view the conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicketForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Support Ticket</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-[#FF4D00] focus:border-[#FF4D00]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-[#FF4D00] focus:border-[#FF4D00]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-[#FF4D00] focus:border-[#FF4D00]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Attach Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setAttachments(prev => [...prev, ...files]);
                  }}
                  className="mt-1 block w-full text-sm text-gray-700"
                />
                {attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-xs text-gray-500 gap-2">
                        <span>{file.name}</span>
                        {file.type.startsWith('image/') && (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="h-12 w-12 object-cover rounded border border-gray-200 mr-2 cursor-pointer"
                            onClick={() => setPreviewImage(URL.createObjectURL(file))}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewTicketForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF4D00]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF4D00] text-white rounded-md hover:bg-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF4D00]"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setPreviewImage(null)}>
          <div className="relative" onClick={e => e.stopPropagation()}>
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[80vh] rounded-lg shadow-lg border-4 border-white" />
            <button
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-200"
              onClick={() => setPreviewImage(null)}
              aria-label="Close preview"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support; 