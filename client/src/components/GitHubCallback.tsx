import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const GitHubCallback = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to GitHub...');

  useEffect(() => {
    const handleCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      console.log('GitHub Callback - Code:', code ? 'Received' : 'Not received');
      console.log('GitHub Callback - Error:', error || 'None');

      if (error) {
        setStatus('error');
        setMessage(`Authorization failed: ${errorDescription || error}`);
        
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
        
      } else if (code) {
        setStatus('success');
        setMessage('Authorization successful!');
        
        // Send code to parent window if opened as popup
        if (window.opener && !window.opener.closed) {
          console.log('Sending code to parent window...');
          window.opener.postMessage({
            type: 'github-oauth-success',
            code: code
          }, window.location.origin);
          
          setTimeout(() => {
            window.close();
          }, 1500);
        } else {
          // Store code and redirect to main app
          console.log('No opener window, storing code and redirecting...');
          localStorage.setItem('github_oauth_code', code);
          
          setTimeout(() => {
            window.location.href = '/?github_auth=success';
          }, 1500);
        }
        
      } else {
        setStatus('error');
        setMessage('No authorization code received from GitHub');
        
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Icon */}
          {status === 'loading' && (
            <Loader2 className="w-16 h-16 text-indigo-500 mx-auto mb-4 animate-spin" />
          )}
          {status === 'success' && (
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          )}
          {status === 'error' && (
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          )}

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {status === 'loading' && 'Connecting to GitHub...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Authorization Failed'}
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-4">
            {message}
          </p>

          {/* Additional info */}
          <div className="text-sm text-gray-500">
            {status === 'loading' && 'Please wait while we complete the authentication.'}
            {status === 'success' && 'Redirecting you back to the converter...'}
            {status === 'error' && 'Redirecting you back in a moment...'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubCallback;