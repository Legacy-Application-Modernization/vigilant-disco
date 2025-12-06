import type { FC } from 'react';
import { AlertCircle, XCircle, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
  error: Error | string | null;
  title?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'error' | 'warning' | 'info';
  showDetails?: boolean;
}

const ErrorDisplay: FC<ErrorDisplayProps> = ({
  error,
  title = 'Error',
  onRetry,
  onDismiss,
  variant = 'error',
  showDetails = false,
}) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;
  const originalError = typeof error === 'object' && 'originalError' in error 
    ? (error as any).originalError 
    : null;

  const variants = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-400',
      IconComponent: XCircle,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-400',
      IconComponent: AlertCircle,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-400',
      IconComponent: AlertCircle,
    },
  };

  const style = variants[variant];
  const Icon = style.IconComponent;

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-4 mb-4`}>
      <div className="flex items-start">
        <Icon className={`h-5 w-5 ${style.icon} mt-0.5 flex-shrink-0`} />
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${style.text}`}>{title}</h3>
          <p className={`mt-1 text-sm ${style.text}`}>{errorMessage}</p>

          {/* Show technical details if available */}
          {showDetails && originalError && (
            <details className="mt-3">
              <summary className={`cursor-pointer text-xs font-medium ${style.text} hover:underline`}>
                Technical Details
              </summary>
              <div className="mt-2 bg-white bg-opacity-50 rounded p-2 max-h-40 overflow-y-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {JSON.stringify(
                    {
                      status: originalError.response?.status,
                      statusText: originalError.response?.statusText,
                      data: originalError.response?.data,
                      url: originalError.config?.url,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </details>
          )}

          {/* Action Buttons */}
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-medium ${style.text} bg-white border ${style.border} rounded hover:bg-opacity-80 transition-colors`}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-medium ${style.text} bg-white border ${style.border} rounded hover:bg-opacity-80 transition-colors`}
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
