import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Send } from 'lucide-react';

interface NewTicket {
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

const RaiseTicket: React.FC = () => {
  const [newTicket, setNewTicket] = useState<NewTicket>({
    subject: '',
    description: '',
    priority: 'medium',
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Simulate API
      setTimeout(() => {
        toast.success('Support ticket raised successfully!');
        setNewTicket({ subject: '', description: '', priority: 'medium' });
        setAttachments([]);
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      toast.error('Failed to raise ticket');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-4xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 text-left py-5">
          Raise a Support Ticket
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={newTicket.subject}
              onChange={(e) =>
                setNewTicket((prev) => ({ ...prev, subject: e.target.value }))
              }
              className="w-full rounded-md px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newTicket.description}
              onChange={(e) =>
                setNewTicket((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={4}
              className="w-full rounded-md px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={newTicket.priority}
              onChange={(e) =>
                setNewTicket((prev) => ({
                  ...prev,
                  priority: e.target.value as 'low' | 'medium' | 'high',
                }))
              }
              className="w-full rounded-md px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attach Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setAttachments((prev) => [...prev, ...files]);
              }}
              className="w-full text-sm text-gray-700"
            />
            {attachments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-4">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-1 relative group"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-20 w-20 object-cover rounded cursor-pointer"
                      onClick={() =>
                        setPreviewImage(URL.createObjectURL(file))
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 text-xs text-red-500 hover:bg-red-100"
                    >
                      &times;
                    </button>
                    <span className="text-xs text-gray-500 truncate max-w-[80px]">
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Button aligned right, small, and styled */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Raise Ticket'}
            </button>
          </div>
        </form>

        {/* Image Preview Modal */}
        {previewImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[80vh] rounded-lg shadow-lg"
              />
              <button
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-200"
                onClick={() => setPreviewImage(null)}
                aria-label="Close preview"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RaiseTicket;
