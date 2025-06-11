import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Upload, X } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  deliveryDate: string;
  orderDate: string;
  productName: string;
  imageUrl: string;
  price: number;
}

const Review: React.FC = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order as Order;

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Here you would typically send the review data to your backend
    // For now, we'll just navigate back to the orders page with a success message
    navigate('/orders', {
      state: { message: 'Review submitted successfully!' }
    });
  };

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
          <button 
            onClick={() => navigate('/orders')}
            className="px-6 py-2 bg-[#FF4D00] text-white rounded-lg hover:bg-[#FF4D00]/90 transition-colors"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Write a Review</h1>
          <p className="text-gray-600">Order #{order.id}</p>
        </div>
      </div>

      {/* Product Details */}
      <div className="bg-white rounded-lg p-6 mb-6 border">
        <div className="flex gap-4">
          <img
            src={order.imageUrl}
            alt={order.productName}
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div>
            <h3 className="font-medium">{order.productName}</h3>
            <p className="text-gray-600 text-sm">Ordered on {order.orderDate}</p>
            <p className="text-gray-600 text-sm">Delivered on {order.deliveryDate}</p>
          </div>
        </div>
      </div>

      {/* Review Form */}
      <div className="bg-white rounded-lg p-6 border">
        {/* Rating */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Overall Rating</h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="text-2xl focus:outline-none"
              >
                <Star
                  size={32}
                  className={`${
                    star <= (hoveredRating || rating)
                      ? 'fill-[#FF4D00] text-[#FF4D00]'
                      : 'text-gray-300'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Review Title */}
        <div className="mb-6">
          <label className="block font-medium mb-2">Review Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum up your experience in a few words"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/20 focus:border-[#FF4D00]"
          />
        </div>

        {/* Review Text */}
        <div className="mb-6">
          <label className="block font-medium mb-2">Your Review</label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/20 focus:border-[#FF4D00]"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block font-medium mb-2">Add Photos</label>
          <div className="flex flex-wrap gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Review ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#FF4D00] transition-colors">
              <Upload size={24} className="text-gray-400" />
              <span className="text-xs text-gray-500 mt-1">Add Photo</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-2">Upload up to 5 images (optional)</p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!rating || !reviewText.trim() || !title.trim()}
          className="w-full py-3 bg-[#FF4D00] text-white rounded-lg hover:bg-[#FF4D00]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Review
        </button>
      </div>
    </div>
  );
};

export default Review; 