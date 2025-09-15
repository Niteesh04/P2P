
import { useState, useRef, useCallback } from 'react';
import type { Message, ConnectionState } from '../types';
import { MessageType } from '../types';

const PEER_CONNECTION_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const useWebRTC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);

  const addMessage = useCallback((msg: Omit<Message, 'id'>) => {
    setMessages((prev) => [...prev, { ...msg, id: crypto.randomUUID() }]);
  }, []);

  const setupDataChannelEvents = useCallback((channel: RTCDataChannel) => {
    channel.onopen = () => {
      setConnectionState('connected');
      addMessage({ type: MessageType.System, content: 'Peer connected!', sender: 'me' });
    };

    channel.onclose = () => {
      setConnectionState('disconnected');
      addMessage({ type: MessageType.System, content: 'Peer disconnected.', sender: 'me' });
    };

    channel.onmessage = (event) => {
      try {
        const messageData = JSON.parse(event.data);
        addMessage({ ...messageData, sender: 'peer' });
      } catch (error) {
        console.error("Failed to parse incoming message:", error);
      }
    };
    dataChannel.current = channel;
  }, [addMessage]);

  const closeConnection = useCallback(() => {
    dataChannel.current?.close();
    peerConnection.current?.close();
    dataChannel.current = null;
    peerConnection.current = null;
    setConnectionState('disconnected');
    setMessages([]);
  }, []);

  const createOffer = useCallback(async (): Promise<string> => {
    const pc = new RTCPeerConnection(PEER_CONNECTION_CONFIG);
    peerConnection.current = pc;
    setConnectionState('connecting');

    const channel = pc.createDataChannel('chat');
    setupDataChannelEvents(channel);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Trickle ICE is more complex for manual signaling.
        // We will wait for all candidates to be gathered.
      }
    };
    
    return new Promise((resolve, reject) => {
       pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === 'complete') {
            if (pc.localDescription) {
                 const offer = pc.localDescription;
                 resolve(btoa(JSON.stringify(offer)));
            } else {
                reject(new Error("Local description is null after ICE gathering."));
            }
        }
       };

      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .catch(reject);
    });
  }, [setupDataChannelEvents]);
  
  const handleOfferAndCreateAnswer = useCallback(async (offerString: string): Promise<string> => {
    const pc = new RTCPeerConnection(PEER_CONNECTION_CONFIG);
    peerConnection.current = pc;
    setConnectionState('connecting');

    pc.ondatachannel = (event) => {
      setupDataChannelEvents(event.channel);
    };
    
    const offer = JSON.parse(atob(offerString));
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    
    return new Promise((resolve, reject) => {
        pc.onicegatheringstatechange = () => {
            if(pc.iceGatheringState === 'complete') {
                if (pc.localDescription) {
                    const answer = pc.localDescription;
                    resolve(btoa(JSON.stringify(answer)));
                } else {
                     reject(new Error("Local description is null after ICE gathering."));
                }
            }
        };

        pc.createAnswer()
          .then(answer => pc.setLocalDescription(answer))
          .catch(reject);
    });
  }, [setupDataChannelEvents]);

  const handleAnswer = useCallback(async (answerString: string) => {
    if (!peerConnection.current) {
      console.error("Peer connection not initialized.");
      setConnectionState('failed');
      return;
    }
    const answer = JSON.parse(atob(answerString));
    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (dataChannel.current?.readyState === 'open' && content.trim()) {
      const message = { type: MessageType.Text, content };
      dataChannel.current.send(JSON.stringify(message));
      addMessage({ ...message, sender: 'me' });
    }
  }, [addMessage]);

  const sendImage = useCallback(async (file: File) => {
    if (dataChannel.current?.readyState === 'open') {
        // Simple size check for MVP
        if(file.size > 1024 * 1024 * 2) { // 2MB limit
             addMessage({ type: MessageType.System, content: 'Image is too large (max 2MB).', sender: 'me'});
             return;
        }
      try {
        const content = await fileToDataUrl(file);
        const message = { type: MessageType.Image, content };
        dataChannel.current.send(JSON.stringify(message));
        addMessage({ ...message, sender: 'me' });
      } catch (error) {
        console.error("Error sending image:", error);
        addMessage({ type: MessageType.System, content: 'Failed to send image.', sender: 'me'});
      }
    }
  }, [addMessage]);

  return {
    messages,
    connectionState,
    createOffer,
    handleOfferAndCreateAnswer,
    handleAnswer,
    sendMessage,
    sendImage,
    closeConnection,
  };
};
