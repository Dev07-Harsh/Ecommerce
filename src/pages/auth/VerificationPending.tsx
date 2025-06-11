import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ClockIcon, CheckBadgeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const VerificationPending: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 flex flex-col justify-center sm:px-6 lg:px-8 py-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <ClockIcon className="h-24 w-24 text-orange-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verification Pending
        </h2>
        <p className="mt-2 text-center text-md text-gray-600 max-w-md mx-auto">
          Thanks for registering! Please check your email to complete the verification process.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckBadgeIcon className="h-5 w-5 text-primary-500" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-800">Verification Status</h3>
                  <div className="mt-2 text-sm text-gray-700">
                    <p>
                      Your account verification is pending. Please check your email to complete the verification process.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between space-x-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Return Home
              </button>
              
              <Link
                to="/signin"
                className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending; 