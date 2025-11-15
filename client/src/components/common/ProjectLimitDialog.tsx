import React from 'react';
import { AlertCircle, X, Mail } from 'lucide-react';

interface ProjectLimitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentCount: number;
  maxAllowed: number;
}

const ProjectLimitDialog: React.FC<ProjectLimitDialogProps> = ({
  isOpen,
  onClose,
  currentCount,
  maxAllowed,
}) => {
  if (!isOpen) return null;

  const handleContactSupport = () => {
    // Open email client with pre-filled subject
    window.location.href = 'mailto:support@example.com?subject=Request%20for%20Additional%20Project%20Access&body=Hello,%0D%0A%0D%0AI%20would%20like%20to%20request%20additional%20project%20access.%20I%20currently%20have%20' + currentCount + '%20projects%20and%20would%20like%20to%20increase%20my%20limit.%0D%0A%0D%0AThank%20you.';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-amber-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Project Limit Reached</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            You have reached the maximum limit of <span className="font-semibold">{maxAllowed} projects</span> for your current account.
          </p>
          <p className="text-gray-600 mb-6">
            You currently have <span className="font-semibold">{currentCount} active projects</span>.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <p className="text-sm text-blue-800">
              To create more projects, please contact our support team to upgrade your account or discuss your needs.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleContactSupport}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center transition-colors"
          >
            <Mail className="mr-2 h-4 w-4" />
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectLimitDialog;
