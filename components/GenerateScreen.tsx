
import React, { useState, useEffect } from 'react';
import { AppView } from '../types';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { SignalingScreenLayout } from './SignalingScreenLayout';
import { CopyableTextarea } from './CopyableTextarea';

interface GenerateScreenProps {
  setView: (view: AppView) => void;
  createOffer: () => Promise<string>;
  handleAnswer: (answer: string) => Promise<void>;
}

export const GenerateScreen: React.FC<GenerateScreenProps> = ({ setView, createOffer, handleAnswer }) => {
  const [offer, setOffer] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    createOffer()
      .then(setOffer)
      .catch(err => {
          console.error(err);
          setError('Failed to create offer. Please try again.');
      })
      .finally(() => setIsLoading(false));
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onConnect = async () => {
    if (!answer.trim()) return;
    setIsLoading(true);
    setError('');
    try {
        await handleAnswer(answer);
        // The view will change automatically via useEffect in App.tsx watching connectionState
    } catch(err) {
        console.error(err);
        setError("Connection failed. The answer might be invalid. Please check and try again.");
        setIsLoading(false);
    }
  };

  return (
    <SignalingScreenLayout
        title="Generate Chat Link"
        description="Follow the steps below to start a secure chat."
        onBack={() => setView(AppView.Home)}
    >
        <Card>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-white">Step 1: Share Your Offer</h3>
                    <p className="text-sm text-gray-400 mt-1">Copy this offer link and send it to the person you want to chat with.</p>
                    <div className="mt-4">
                        <CopyableTextarea label="Your Offer Link" text={offer} />
                    </div>
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold text-white">Step 2: Paste Their Answer</h3>
                    <p className="text-sm text-gray-400 mt-1">Once they send you their answer link, paste it below and connect.</p>
                    <div className="mt-4">
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            className="w-full h-32 p-3 bg-gray-900 border border-gray-700 rounded-md resize-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Paste the answer link here..."
                        />
                    </div>
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}
                
                <Button onClick={onConnect} disabled={!answer.trim() || isLoading} className="w-full py-3">
                    {isLoading ? 'Connecting...' : 'Connect'}
                </Button>
            </div>
        </Card>
    </SignalingScreenLayout>
  );
};
