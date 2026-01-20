export enum AppMode {
  STUDY = 'STUDY',
  RESEARCH = 'RESEARCH',
  SUMMARY = 'SUMMARY',
  VISUAL = 'VISUAL',
  MINDMAP = 'MINDMAP'
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  MINDMAP = 'MINDMAP',
  ERROR = 'ERROR'
}

export interface MindMapNode {
  name: string;
  children?: MindMapNode[];
  value?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  type: MessageType;
  content: string; // Text content or Base64 string for images
  mindMapData?: MindMapNode; // For mind map rendering
  timestamp: number;
}

export interface SessionConfig {
  messages: Message[];
  tokensUsed: number;
}