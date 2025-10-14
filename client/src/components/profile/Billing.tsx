import type { FC } from 'react';
import { Settings } from 'lucide-react';
import { paymentMethods, billingInvoices } from '../../data/userData';

const Billing: FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Billing Information</h3>
        <p className="text-sm text-gray-500">
          Manage your subscription plan and payment methods.
        </p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Current Plan</h4>
            <p className="text-sm text-gray-500 mt-1">Pro Plan - $49/month</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Change Plan
            </button>
            <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-red-600 bg-white hover:bg-gray-50">
              Cancel Plan
            </button>
          </div>
        </div>
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-500">Next billing date</span>
            <span className="text-gray-900">November 12, 2025</span>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-4">Payment Methods</h4>
        <div className="space-y-3">
          {paymentMethods.map(method => (
            <div key={method.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-md">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-md mr-3">
                  <span className="text-blue-800 font-mono text-xs">
                    {method.type.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {method.type.charAt(0).toUpperCase() + method.type.slice(1)} ending in {method.lastFour}
                  </p>
                  <p className="text-xs text-gray-500">Expires {method.expiryMonth}/{method.expiryYear}</p>
                </div>
              </div>
              <div className="flex items-center">
                {method.isDefault && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mr-3">Default</span>
                )}
                <button className="text-gray-500 hover:text-gray-700">
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          
          <button className="mt-3 flex items-center text-sm text-indigo-600 hover:text-indigo-800">
            <span className="text-xl mr-1">+</span> Add Payment Method
          </button>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Billing History</h4>
        <div className="overflow-hidden rounded-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {billingInvoices.map(invoice => (
                <tr key={invoice.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{invoice.date}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-indigo-600">#{invoice.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">${invoice.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Billing;