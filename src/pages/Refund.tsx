import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, MapPin, ChevronRight, HelpCircle } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  deliveryDate: string;
  orderDate: string;
  productName: string;
  imageUrl: string;
  price: number;
}

interface RefundReason {
  id: string;
  label: string;
  description: string;
}

const Refund: React.FC = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order as Order;
  
  const [step, setStep] = useState(1);
  const [selectedReason, setSelectedReason] = useState('');
  const [selectedRefundMethod, setSelectedRefundMethod] = useState('');
  const [isRefundExpanded, setIsRefundExpanded] = useState(false);

  const refundReasons: RefundReason[] = [
    {
      id: 'not_satisfied',
      label: 'Not Satisfied with Product',
      description: 'The product quality or features did not meet your expectations'
    },
    {
      id: 'wrong_item',
      label: 'Received Wrong Item',
      description: 'The item received is different from what was ordered'
    },
    {
      id: 'damaged',
      label: 'Product Arrived Damaged',
      description: 'The item was damaged during shipping or has defects'
    },
    {
      id: 'better_price',
      label: 'Found Better Price',
      description: 'Found the same product at a lower price elsewhere'
    }
  ];

  const refundMethods = [
    {
      id: 'original',
      label: 'Original Payment Method',
      description: 'Refund to the card/method used for purchase',
      icon: CreditCard
    },
    {
      id: 'bank',
      label: 'Bank Account',
      description: 'Direct deposit to your bank account',
      icon: CreditCard
    },
    {
      id: 'store_credit',
      label: 'Store Credit',
      description: 'Get store credit for future purchases',
      icon: CreditCard
    }
  ];

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
      // Submit refund request
      navigate('/orders', { 
        state: { 
          message: 'Refund request submitted successfully!' 
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
          <h1 className="text-2xl font-bold">Request Refund</h1>
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
            <h2 className="text-lg font-medium mb-4">Select Refund Reason</h2>
            <div className="space-y-3">
              {refundReasons.map((reason) => (
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
            <h2 className="text-lg font-medium mb-4">Select Refund Method</h2>
            <div className="space-y-3">
              {refundMethods.map((method) => (
                <label 
                  key={method.id}
                  className={`
                    block p-4 border rounded-lg cursor-pointer transition-colors
                    ${selectedRefundMethod === method.id ? 'border-[#FF4D00] bg-[#FF4D00]/5' : 'hover:border-gray-300'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="refundMethod"
                      value={method.id}
                      checked={selectedRefundMethod === method.id}
                      onChange={(e) => setSelectedRefundMethod(e.target.value)}
                      className="text-[#FF4D00] focus:ring-[#FF4D00]"
                    />
                    <method.icon size={20} className="text-gray-400" />
                    <div>
                      <p className="font-medium">{method.label}</p>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-medium mb-4">Refund Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <HelpCircle size={20} className="text-gray-400" />
                  <div>
                    <p className="font-medium">Refund Reason</p>
                    <p className="text-sm text-gray-600">
                      {refundReasons.find(r => r.id === selectedReason)?.label}
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
                  <CreditCard size={20} className="text-gray-400" />
                  <div>
                    <p className="font-medium">Refund Method</p>
                    <p className="text-sm text-gray-600">
                      {refundMethods.find(m => m.id === selectedRefundMethod)?.label}
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

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-3">Refund Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Original Amount</span>
                    <span>${order.price?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Refund Amount</span>
                    <span>${order.price?.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t">
                    <div className="flex justify-between font-medium">
                      <span>Total Refund</span>
                      <span>${order.price?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
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
              (step === 2 && !selectedRefundMethod)
            }
            className="flex-1 py-3 bg-[#FF4D00] text-white rounded-lg hover:bg-[#FF4D00]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 3 ? 'Submit Refund Request' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Refund; 