import React from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LiveCardProps {
  id: string;
  title: string;
  host: string;
  thumbnail: string;
  viewers?: number;
  isLive?: boolean;
  type?: string;
}

const LiveCard: React.FC<LiveCardProps> = ({
  id,
  title,
  host,
  thumbnail,
  viewers,
  isLive,
  type
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/live-shop/product/${id}`);
  };

  return (
    <div 
      className="relative flex-shrink-0 w-[240px] group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 text-gray-900" fill="currentColor" />
          </div>
        </div>

        {/* Live Badge */}
        {isLive && (
          <div className="absolute top-3 left-3 px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
            LIVE
          </div>
        )}

        {/* Viewer Count */}
        {viewers && (
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/30 backdrop-blur-sm text-white text-xs rounded-full flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
            {viewers.toLocaleString()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-3 px-1">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">{host}</p>
      </div>
    </div>
  );
};

export default LiveCard; 