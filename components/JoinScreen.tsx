
import React, { useState } from 'react';
import { AppView } from '../types';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { SignalingScreenLayout } from './SignalingScreenLayout';
import { CopyableTextarea } from './CopyableTextarea';

interface JoinScreenProps {
  setView: (view: AppView) => void;
  handleOfferAndCreateAnswer: (offer: string) => Promise<string>;
}

export const JoinScreen: React.FC<JoinScreenProps> = ({ setView, handleOfferAndCreateAnswer }) => {
  const [offer, setOffer] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onCreateAnswer = async () => {
    if (!offer.trim()) return;
    setIsLoading(true);
    setError('');
    try {
        const generatedAnswer = await handleOfferAndCreateAnswer(offer);
        setAnswer(generatedAnswer);
    } catch (err) {
        console.error(err);
        setError('Failed to create answer. The offer link might be invalid.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
     <SignalingScreenLayout
        title="Join Chat"
        description="Paste the offer link from your peer to get started."
        onBack={() => setView(AppView.Home)}
    >
        <Card>
            <div className="space-y-6">
                {!answer ? (
                    <>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Step 1: Paste Offer Link</h3>
                            <p className="text-sm text-gray-400 mt-1">Get the offer link from the person who initiated the chat and paste it here.</p>
                            <div className="mt-4">
                                <textarea
                                    value={offer}
                                    onChange={(e) => setOffer(e.target.value)}
                                    className="w-full h-32 p-3 bg-gray-900 border border-gray-700 rounded-md resize-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Paste the offer link here..."
                                />
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-400">{error}</p>}
                        <Button onClick={onCreateAnswer} disabled={!offer.trim() || isLoading} className="w-full py-3">
                            {isLoading ? 'Generating...' : 'Generate Answer'}
                        </Button>
                    </>
                ) : (
                    <>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Step 2: Share Your Answer</h3>
                            <p className="text-sm text-gray-400 mt-1">Copy this answer link and send it back to the other person.</p>
                            <div className="mt-4">
                                <CopyableTextarea label="Your Answer Link" text={answer} />
                            </div>
                        </div>
                        <div className="text-center p-4 bg-gray-900 rounded-md">
                            <p className="font-medium text-white">Waiting for peer to connect...</p>
                            <p className="text-sm text-gray-400 mt-1">Once they use your link, the chat will begin automatically.</p>
                        </div>
                    </>
                )}
            </div>
        </Card>
    </SignalingScreenLayout>
  );
};
