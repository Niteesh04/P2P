
import React from 'react';
import { AppView } from '../types';
import { Button } from './common/Button';
import { Card } from './common/Card';

interface HomeScreenProps {
  setView: (view: AppView) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ setView }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">P2P Wave</h1>
            <p className="mt-4 text-lg text-gray-400">Serverless. Encrypted. Peer-to-Peer.</p>
        </div>
        <div className="mt-10 flex flex-col gap-4">
          <Button onClick={() => setView(AppView.Generate)} className="w-full py-3 text-base">
            Generate Chat Link
          </Button>
          <Button onClick={() => setView(AppView.Join)} variant="secondary" className="w-full py-3 text-base">
            Join with Link
          </Button>
        </div>
      </Card>
    </div>
  );
};
