
export enum AppView {
  Home = 'home',
  Generate = 'generate',
  Join = 'join',
  Chat = 'chat',
}

export enum MessageType {
  Text = 'text',
  Image = 'image',
  System = 'system',
}

export type Message = {
  id: string;
  type: MessageType;
  content: string;
  sender: 'me' | 'peer';
};

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'failed';
