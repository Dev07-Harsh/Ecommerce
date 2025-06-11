import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

import {
  Eye, XCircle, CheckCircle, MessageSquare, Paperclip, Send,
  Search, Filter, ChevronDown, Clock, AlertTriangle, User, Tag, RefreshCw,
  ChevronLeft, ChevronRight, Edit3, ShieldAlert, UserCog, ChevronDownIcon
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface BackendMessage {
  id: number;
  sender_name: string;
  sender_role: string;
  is_admin_reply: boolean;
  message_text: string;
  attachment_url?: string | null;
  created_at: string;
}

interface BackendTicket {
  id: number;
  ticket_uid: string;
  creator_name: string; // User's name
  merchant_name?: string; // Business name
  title: string;
  description: string;
  image_url?: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'awaiting_customer_reply' | 'awaiting_merchant_reply' | 'resolved' | 'closed';
  assigned_admin_name?: string | null;
  assigned_to_admin_id?: number | null;
  created_at: string;
  updated_at: string;
  messages?: BackendMessage[];
}

interface AdminUser { // For assigning tickets
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

const MerchantSupportAdminPage: React.FC = () => {
  const { accessToken } = useAuth();
  const [tickets, setTickets] = useState<BackendTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<BackendTicket | null>(null);
  const [adminReply, setAdminReply] = useState('');
  const [adminReplyAttachment, setAdminReplyAttachment] = useState<File | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [selectedAdminToAssign, setSelectedAdminToAssign] = useState<string>('');


  const fetchAdminUsers = useCallback(async () => {
    // Placeholder: In a real app, fetch users with admin/support roles
    // For now, using a mock or assuming you have a way to get them
    // Example: const response = await fetch(`${API_BASE_URL}/api/superadmin/users?role=admin`, { ... });
    // setAdminUsers(await response.json());
    setAdminUsers([ {id: 1, first_name: "Super", last_name: "Admin", email:"admin@example.com"}, {id: 2, first_name: "Support", last_name: "User", email:"support@example.com"}]);
  }, [accessToken]);


  const fetchTickets = useCallback(async (page = 1) => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: itemsPerPage.toString(),
        creator_role: 'merchant', // Fetch only merchant tickets
        sort_by: '-updated_at'
      });
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterPriority !== 'all') params.append('priority', filterPriority);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`${API_BASE_URL}/api/superadmin/support/tickets?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch merchant support tickets');
      const data = await response.json();
      setTickets(data.tickets || []);
      setTotalItems(data.pagination?.total_items || 0);
      setTotalPages(data.pagination?.total_pages || 1);
      setCurrentPage(data.pagination?.current_page || 1);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load merchant support tickets.');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, filterStatus, filterPriority, searchTerm, itemsPerPage]);

  useEffect(() => {
    fetchTickets(currentPage);
    fetchAdminUsers();
  }, [fetchTickets, fetchAdminUsers, currentPage]); // Removed currentPage from fetchTickets dependencies to avoid loop

  const handleViewTicket = async (ticket: BackendTicket) => {
    if (!accessToken) return;
    setSelectedTicket(ticket); // Show basic info immediately
    // Fetch full details including messages
    try {
        const response = await fetch(`${API_BASE_URL}/api/superadmin/support/tickets/${ticket.ticket_uid}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (!response.ok) throw new Error('Failed to load ticket details.');
        const detailedTicketData = await response.json();
        setSelectedTicket(detailedTicketData); // Update with full details
    } catch (error) {
        toast.error("Could not load full ticket details.");
        console.error("Error fetching ticket details:", error);
    }
  };

  const handleAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || (!adminReply.trim() && !adminReplyAttachment)) {
        toast.error("Reply message or attachment is required.");
        return;
    }
    setIsReplying(true);
    try {
        const formData = new FormData();
        if(adminReply.trim()) formData.append('message_text', adminReply.trim());
        if(adminReplyAttachment) formData.append('attachment_file', adminReplyAttachment);

        const response = await fetch(`${API_BASE_URL}/api/superadmin/support/tickets/${selectedTicket.ticket_uid}/messages`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}` },
            body: formData,
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || "Failed to send reply.");
        }
        const newMsg = await response.json();
        setSelectedTicket(prev => prev ? { ...prev, messages: [...(prev.messages || []), newMsg], status: 'awaiting_merchant_reply', updated_at: new Date().toISOString() } : null);
        setTickets(prev => prev.map(t => t.ticket_uid === selectedTicket.ticket_uid ? {...t, status: 'awaiting_merchant_reply', updated_at: new Date().toISOString() } : t));
        setAdminReply('');
        setAdminReplyAttachment(null);
        toast.success("Reply sent successfully!");
    } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to send reply.");
    } finally {
        setIsReplying(false);
    }
  };

  const handleUpdateStatus = async (ticketUid: string, newStatus: BackendTicket['status']) => {
    if(!window.confirm(`Are you sure you want to change status to ${newStatus.replace('_', ' ')}?`)) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/superadmin/support/tickets/${ticketUid}/status`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if(!response.ok) throw new Error("Failed to update status.");
        toast.success(`Ticket status updated to ${newStatus.replace('_', ' ')}.`);
        fetchTickets(currentPage); // Refresh list
        if(selectedTicket?.ticket_uid === ticketUid) {
            setSelectedTicket(prev => prev ? {...prev, status: newStatus} : null);
        }
    } catch (error) {
        toast.error("Failed to update status.");
    }
  };
  
  const handleAssignTicket = async (ticketUid: string) => {
    if (!selectedAdminToAssign) {
        toast.error("Please select an admin to assign.");
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/api/superadmin/support/tickets/${ticketUid}/assign`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ admin_id: parseInt(selectedAdminToAssign) })
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || "Failed to assign ticket.");
        }
        toast.success("Ticket assigned successfully.");
        fetchTickets(currentPage);
         if(selectedTicket?.ticket_uid === ticketUid) {
            const adminUser = adminUsers.find(admin => admin.id.toString() === selectedAdminToAssign);
            setSelectedTicket(prev => prev ? {...prev, assigned_to_admin_id: parseInt(selectedAdminToAssign), assigned_admin_name: adminUser ? `${adminUser.first_name} ${adminUser.last_name}` : "Unknown Admin"} : null);
        }
    } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to assign ticket.");
    }
  };


  const getStatusColor = (status: BackendTicket['status']) => { /* Same as before */ 
    switch (status) {
        case 'open': return 'bg-green-100 text-green-800';
        case 'in_progress': return 'bg-blue-100 text-blue-800';
        case 'awaiting_customer_reply': case 'awaiting_merchant_reply': return 'bg-yellow-100 text-yellow-800';
        case 'resolved': return 'bg-indigo-100 text-indigo-800';
        case 'closed': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
      }
  };
  const getPriorityColor = (priority: BackendTicket['priority']) => { /* Same as before */ 
    switch (priority) {
        case 'high': return 'bg-red-100 text-red-800';
        case 'medium': return 'bg-yellow-100 text-yellow-800';
        case 'low': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
  };


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Merchant Support Tickets</h1>
        <button onClick={() => fetchTickets(1)} className="p-2 rounded-md hover:bg-gray-100 text-gray-600" title="Refresh Tickets">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search UID, title, merchant..."
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
            className="pl-10 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <div className="relative">
            <select
            value={filterStatus}
            onChange={(e) => {setFilterStatus(e.target.value); setCurrentPage(1);}}
            className="w-full p-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 appearance-none"
            >
            <option value="all">All Statuses</option>
            {['open', 'in_progress', 'awaiting_merchant_reply', 'awaiting_customer_reply', 'resolved', 'closed'].map(s => (
                <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
            ))}
            </select>
            <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
        </div>
        <div className="relative">
            <select
            value={filterPriority}
            onChange={(e) => {setFilterPriority(e.target.value); setCurrentPage(1);}}
            className="w-full p-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 appearance-none"
            >
            <option value="all">All Priorities</option>
            {['low', 'medium', 'high'].map(p => (
                <option key={p} value={p}>{p.toUpperCase()}</option>
            ))}
            </select>
            <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {isLoading && tickets.length === 0 ? (
        <div className="text-center py-10 text-gray-500">Loading tickets...</div>
      ) : !isLoading && tickets.length === 0 ? (
         <div className="text-center py-10 bg-white rounded-lg shadow">
            <MessageSquare className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No merchant support tickets found.</p>
            <p className="text-sm text-gray-400">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-orange-50">
              <tr>
                {['Ticket ID', 'Title', 'Merchant', 'Priority', 'Status', 'Last Updated', 'Assigned To', 'Actions'].map(header => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.ticket_uid} className="hover:bg-orange-50/30">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticket.ticket_uid}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 max-w-xs truncate" title={ticket.title}>{ticket.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{ticket.merchant_name || ticket.creator_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ticket.updated_at).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.assigned_admin_name || 'Unassigned'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleViewTicket(ticket)} className="text-orange-600 hover:text-orange-800 p-1 rounded-full hover:bg-orange-100" title="View Details">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center space-x-2">
              <button 
                  onClick={() => fetchTickets(currentPage - 1)} 
                  disabled={currentPage === 1 || isLoading}
                  className="p-2 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                  <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
              <button 
                  onClick={() => fetchTickets(currentPage + 1)} 
                  disabled={currentPage === totalPages || isLoading}
                  className="p-2 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                  <ChevronRight size={20} />
              </button>
          </div>
      )}


      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-800 truncate" title={selectedTicket.title}>{selectedTicket.title} (#{selectedTicket.ticket_uid})</h2>
              <button onClick={() => setSelectedTicket(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <XCircle size={24}/>
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-grow">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong className="text-gray-600">Merchant:</strong> {selectedTicket.merchant_name || selectedTicket.creator_name}</div>
                    <div><strong className="text-gray-600">Priority:</strong> <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(selectedTicket.priority)}`}>{selectedTicket.priority}</span></div>
                    <div><strong className="text-gray-600">Status:</strong> <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(selectedTicket.status)}`}>{selectedTicket.status.replace('_',' ')}</span></div>
                    <div><strong className="text-gray-600">Created:</strong> {new Date(selectedTicket.created_at).toLocaleString()}</div>
                    <div><strong className="text-gray-600">Last Updated:</strong> {new Date(selectedTicket.updated_at).toLocaleString()}</div>
                    <div><strong className="text-gray-600">Assigned To:</strong> {selectedTicket.assigned_admin_name || "Unassigned"}</div>
                    {selectedTicket.related_order_id && <div><strong className="text-gray-600">Order ID:</strong> {selectedTicket.related_order_id}</div>}
                    {selectedTicket.related_product_id && <div><strong className="text-gray-600">Product ID:</strong> {selectedTicket.related_product_id}</div>}
                </div>

              <div className="mt-2">
                <strong className="text-gray-600 block mb-1 text-sm">Description:</strong>
                <div className="p-3 bg-orange-50 rounded-md border border-orange-100 text-sm text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</div>
              </div>

              {selectedTicket.image_url && (
                <div className="mt-2">
                  <strong className="text-gray-600 block mb-1 text-sm">Attached Image:</strong>
                  <img src={selectedTicket.image_url} alt="Ticket attachment" className="max-w-sm max-h-64 border rounded-md object-contain"/>
                </div>
              )}
              
              <div className="mt-4 border-t pt-4">
                <h3 className="text-md font-semibold text-gray-700 mb-2">Conversation History</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {(selectedTicket.messages || []).map((msg) => (
                    <div key={msg.id} className={`p-3 rounded-lg shadow-sm ${msg.is_admin_reply ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.message_text}</p>
                      {msg.attachment_url && <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-600 hover:underline flex items-center mt-1"><Paperclip size={12}/>View Attachment</a>}
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {msg.sender_name} ({msg.sender_role}) - {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {(selectedTicket.messages || []).length === 0 && <p className="text-sm text-gray-500">No messages yet.</p>}
                </div>
              </div>
            </div>
            
            {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                <div className="p-4 border-t bg-gray-50">
                <h3 className="text-md font-semibold text-gray-700 mb-2">Reply or Update</h3>
                <form onSubmit={handleAdminReply} className="space-y-3">
                    <textarea
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                    placeholder="Type your reply..."
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    disabled={isReplying}
                    />
                    <div className="flex justify-between items-center">
                        <label htmlFor={`admin-reply-attachment-${selectedTicket.ticket_uid}`} className="cursor-pointer text-orange-600 hover:text-orange-700 p-2 rounded-full hover:bg-orange-100">
                            <Paperclip className="h-5 w-5"/>
                            <input id={`admin-reply-attachment-${selectedTicket.ticket_uid}`} type="file" className="hidden" onChange={(e) => setAdminReplyAttachment(e.target.files ? e.target.files[0] : null)} disabled={isReplying}/>
                        </label>
                        {adminReplyAttachment && <span className="text-xs text-gray-500 truncate max-w-[150px]">{adminReplyAttachment.name}</span>}
                        <button
                            type="submit"
                            disabled={(!adminReply.trim() && !adminReplyAttachment) || isReplying}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                        >
                            {isReplying ? 'Sending...' : <><Send className="h-4 w-4 mr-2"/>Send Reply</>}
                        </button>
                    </div>
                </form>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:space-x-2">
                     <select 
                        value={selectedTicket.assigned_to_admin_id?.toString() || ''}
                        onChange={(e) => setSelectedAdminToAssign(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md text-sm flex-grow sm:flex-grow-0">
                        <option value="">Assign to...</option>
                        {adminUsers.map(admin => (
                            <option key={admin.id} value={admin.id.toString()}>{admin.first_name} {admin.last_name}</option>
                        ))}
                    </select>
                    <button onClick={() => handleAssignTicket(selectedTicket.ticket_uid)} className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm">Assign</button>
                    {selectedTicket.status !== 'resolved' && <button onClick={() => handleUpdateStatus(selectedTicket.ticket_uid, 'resolved')} className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm">Mark Resolved</button>}
                    <button onClick={() => handleUpdateStatus(selectedTicket.ticket_uid, 'closed')} className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm">Close Ticket</button>
                </div>
                </div>
            )}
             {selectedTicket.status === 'resolved' && (
                <div className="p-4 border-t bg-gray-50 text-center">
                    <p className="text-sm text-gray-700 mb-2">This ticket is marked as resolved. The merchant can close it or reply to re-open.</p>
                    <button onClick={() => handleUpdateStatus(selectedTicket.ticket_uid, 'closed')} className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm">Force Close Ticket</button>
                </div>
            )}
            {selectedTicket.status === 'closed' && (
                <div className="p-4 border-t bg-gray-100 text-center">
                    <p className="text-sm text-gray-600 font-medium">This ticket is closed.</p>
                </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantSupportAdminPage;