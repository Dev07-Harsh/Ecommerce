import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, MapPin, Phone, User, ChevronRight } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  deliveryDate: string;
  orderDate: string;
  productName: string;
  imageUrl: string;
  price: number;
}

interface ExchangeReason {
  id: string;
  label: string;
  description: string;
}

const Exchange: React.FC = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order as Order;

  const [selectedReason, setSelectedReason] = useState('');
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('home');
  const [step, setStep] = useState(1);

  const exchangeReasons: ExchangeReason[] = [
    {
      id: 'size',
      label: 'Wrong Size',
      description: 'The item does not fit as expected'
    },
    {
      id: 'color',
      label: 'Wrong Color',
      description: 'The color is different from what was shown online'
    },
    {
      id: 'damaged',
      label: 'Damaged Product',
      description: 'The item arrived damaged or defective'
    },
    {
      id: 'not_as_described',
      label: 'Not as Described',
      description: 'The product differs from its online description'
    }
  ];

  const savedAddresses = {
    home: {
      type: 'Home',
      address: '123 Home Street, Apt 4B, City, State 12345',
      name: 'John Doe',
      phone: '+1 (555) 123-4567'
    },
    work: {
      type: 'Work',
      address: '456 Office Building, Suite 789, City, State 12345',
      name: 'John Doe',
      phone: '+1 (555) 987-6543'
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate(-1);
    }
  };

  const handleContinue = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Submit exchange request
      navigate('/orders', { 
        state: { 
          message: 'Exchange request submitted successfully!' 
        }
      });
    }
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
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Exchange Item</h1>
          <p className="text-gray-600">Order #{order.id}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((number) => (
          <div key={number} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center
              ${step >= number ? 'bg-[#FF4D00] text-white' : 'bg-gray-100 text-gray-400'}
            `}>
              {number}
            </div>
            {number < 3 && (
              <div className={`
                w-full h-1 mx-2
                ${step > number ? 'bg-[#FF4D00]' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Product Details - Always visible */}
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
            <p className="font-medium mt-2">${order.price?.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg p-6 border">
        {step === 1 && (
          <div>
            <h2 className="text-lg font-medium mb-4">Select Exchange Reason</h2>
            <div className="space-y-3">
              {exchangeReasons.map((reason) => (
                <label 
                  key={reason.id}
                  className={`
                    block p-4 border rounded-lg cursor-pointer transition-colors
                    ${selectedReason === reason.id ? 'border-[#FF4D00] bg-[#FF4D00]/5' : 'hover:border-gray-300'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="reason"
                      value={reason.id}
                      checked={selectedReason === reason.id}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="text-[#FF4D00] focus:ring-[#FF4D00]"
                    />
                    <div>
                      <p className="font-medium">{reason.label}</p>
                      <p className="text-sm text-gray-600">{reason.description}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-medium mb-4">Pickup Address</h2>
            <div className="space-y-4 mb-6">
              {Object.entries(savedAddresses).map(([key, address]) => (
                <label 
                  key={key}
                  className={`
                    block p-4 border rounded-lg cursor-pointer transition-colors
                    ${selectedAddress === key ? 'border-[#FF4D00] bg-[#FF4D00]/5' : 'hover:border-gray-300'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="address"
                      value={key}
                      checked={selectedAddress === key}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      className="text-[#FF4D00] focus:ring-[#FF4D00]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{address.type}</p>
                        <span className="text-sm text-[#FF4D00]">Edit</span>
                      </div>
                      <p className="text-sm text-gray-600">{address.address}</p>
                      <p className="text-sm text-gray-600">{address.name} • {address.phone}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            
            <button className="w-full py-3 border border-[#FF4D00] text-[#FF4D00] rounded-lg hover:bg-[#FF4D00]/5 transition-colors">
              Add New Address
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-medium mb-4">Exchange Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Package size={20} className="text-gray-400" />
                  <div>
                    <p className="font-medium">Exchange Reason</p>
                    <p className="text-sm text-gray-600">
                      {exchangeReasons.find(r => r.id === selectedReason)?.label}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setStep(1)}
                  className="text-[#FF4D00]"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-gray-400" />
                  <div>
                    <p className="font-medium">Pickup Address</p>
                    <p className="text-sm text-gray-600">
                      {savedAddresses[selectedAddress as keyof typeof savedAddresses].address}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setStep(2)}
                  className="text-[#FF4D00]"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={handleBack}
            className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={
              (step === 1 && !selectedReason) ||
              (step === 2 && !selectedAddress)
            }
            className="flex-1 py-3 bg-[#FF4D00] text-white rounded-lg hover:bg-[#FF4D00]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 3 ? 'Submit Exchange' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Exchange; 