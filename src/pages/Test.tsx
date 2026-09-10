import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { testApiConnection } from '@/services/pokemonTcgApi';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Test = () => {
  const [isTestingApi, setIsTestingApi] = useState(false);
  const navigate = useNavigate();
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  const handleTestApi = async () => {
    if (isTestingApi) return;
    setIsTestingApi(true);
    const request = new AbortController();
    controller.current = request;
    toast.info('Checking the card service...');
    try {
      const success = await testApiConnection(request.signal);
      if (request.signal.aborted) return;
      if (success) {
        toast.success('Card service is available.');
      } else {
        toast.error('Card service is unavailable or rate limited. Please try again later.');
      }
    } catch {
      if (!request.signal.aborted) toast.error('Could not check the card service. Please try again later.');
    } finally {
      if (!request.signal.aborted) setIsTestingApi(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="sm"
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              API Testing
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Check the Pokémon TCG card service
            </p>
          </div>

          {/* Test API Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              API Connection Test
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Make one public connection check, with a maximum wait of 20 seconds.
              Your saved cards and bundled catalogs stay intact.
            </p>
            
            <Button
              onClick={handleTestApi}
              disabled={isTestingApi}
              className="w-full"
              size="lg"
            >
              {isTestingApi ? 'Checking connection...' : 'Check connection'}
            </Button>
            
            {isTestingApi && (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Please wait while we test the API connection...
                </p>
              </div>
            )}
          </div>

          {/* Information Section */}
          <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              What this does:
            </h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Requests one set from the public card service</li>
              <li>• Reports availability or an error without changing your collection</li>
              <li>• Cancels the check if you leave this page</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;
