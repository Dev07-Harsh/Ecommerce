import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, MoreHorizontal, Filter } from 'lucide-react';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  date: string;
  productName: string;
  comment: string;
  helpful: number;
  unhelpful: number;
  status: 'published' | 'pending' | 'rejected';
}

const Reviews: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Mock data - replace with actual API call
  const reviews: Review[] = [
    {
      id: '1',
      customerName: 'John Doe',
      rating: 5,
      date: '2024-03-15',
      productName: 'Classic White T-Shirt',
      comment: 'Great quality and perfect fit! Highly recommend this product.',
      helpful: 12,
      unhelpful: 2,
      status: 'published'
    },
    {
      id: '2',
      customerName: 'Jane Smith',
      rating: 4,
      date: '2024-03-14',
      productName: 'Denim Jeans',
      comment: 'Good product but slightly longer than expected.',
      helpful: 8,
      unhelpful: 1,
      status: 'published'
    },
    {
      id: '3',
      customerName: 'Mike Johnson',
      rating: 3,
      date: '2024-03-13',
      productName: 'Running Shoes',
      comment: 'Average quality for the price.',
      helpful: 5,
      unhelpful: 3,
      status: 'pending'
    }
  ];

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'fill-[#FF4D00] text-[#FF4D00]' : 'text-gray-300'
        }`}
      />
    ));
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    return review.status === filter;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === 'highest') {
      return b.rating - a.rating;
    }
    if (sortBy === 'lowest') {
      return a.rating - b.rating;
    }
    return 0;
  });

  return (
    <div className="p-6 bg-[#f8f9fa]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-black">Product Reviews</h1>
        <div className="flex gap-4">
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-200 rounded-lg py-2 px-4 pr-8 leading-tight focus:outline-none focus:border-[#FF4D00] text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Reviews</option>
              <option value="published">Published</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#FF4D00] pointer-events-none" />
          </div>
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-200 rounded-lg py-2 px-4 pr-8 leading-tight focus:outline-none focus:border-[#FF4D00] text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#FF4D00] pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        {sortedReviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-gray-100 p-6 last:border-b-0 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-black">
                    {review.customerName}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  review.status === 'published'
                    ? 'bg-green-50 text-green-700'
                    : review.status === 'pending'
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                </span>
                <button className="text-gray-400 hover:text-[#FF4D00] transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-2">{review.productName}</p>
            <p className="text-gray-700 mb-4">{review.comment}</p>

            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 text-gray-500 hover:text-[#FF4D00] transition-colors">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm">{review.helpful}</span>
              </button>
              <button className="flex items-center gap-1 text-gray-500 hover:text-[#FF4D00] transition-colors">
                <ThumbsDown className="w-4 h-4" />
                <span className="text-sm">{review.unhelpful}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews; 