import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import { useWebRTC } from './hooks/useWebRTC';
import { HomeScreen } from './components/HomeScreen';
import { GenerateScreen } from './components/GenerateScreen';
import { JoinScreen } from './components/JoinScreen';
import { ChatScreen } from './components/ChatScreen';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.Home);
  const {
    messages,
    connectionState,
    createOffer,
    handleOfferAndCreateAnswer,
    handleAnswer,
    sendMessage,
    sendImage,
    closeConnection,
  } = useWebRTC();

  useEffect(() => {
    if (connectionState === 'connected') {
      setView(AppView.Chat);
    } else if (connectionState === 'disconnected') {
      // Don't force back to home if user is in generate/join flow
      if (view === AppView.Chat) {
          setView(AppView.Home);
      }
    } else if (connectionState === 'failed') {
        // Handle failure case if needed, e.g., show an error and return home
        alert("Connection failed. Please try again.");
        setView(AppView.Home);
    }
  }, [connectionState, view]);
  
  const handleLeave = () => {
      closeConnection();
      setView(AppView.Home);
  }

  const renderView = () => {
    switch (view) {
      case AppView.Generate:
        return <GenerateScreen setView={setView} createOffer={createOffer} handleAnswer={handleAnswer} />;
      case AppView.Join:
        return <JoinScreen setView={setView} handleOfferAndCreateAnswer={handleOfferAndCreateAnswer} />;
      case AppView.Chat:
        return <ChatScreen messages={messages} sendMessage={sendMessage} sendImage={sendImage} closeConnection={handleLeave} connectionState={connectionState} />;
      case AppView.Home:
      default:
        return <HomeScreen setView={setView} />;
    }
  };

  return (
    <div className="antialiased font-sans">
      {renderView()}
    </div>
  );
};

export default App;
