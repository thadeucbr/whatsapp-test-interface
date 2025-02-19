import React from 'react';

export interface Button {
  id: string;
  text: string;
}

export interface Row {
  title: string;
  description: string;
  rowId: string;
}

export interface MessageBody {
  text: string;
  buttonText: string | null;
  options: Array<Row> | Array<Button> | null;
}

export interface IncomingMessageDTO {
  from: string;
  body: MessageBody;
  timestamp: number;
  type: 'text' | 'button' | 'list';
}

export interface Folder {
  id: string;
  name: string;
  testCaseIds: string[];
}

export interface TestCase {
  id: string;
  name: string;
  folderId?: string;
  interactions: TestInteraction[];
}

export interface TestInteraction {
  userMessage: string;
  expectedResponses: IncomingMessageDTO[];
}

export interface Message {
  id: string;
  content: string;
  timestamp: number;
  isUser: boolean;
  type: 'text' | 'button' | 'list';
  options?: Array<Row> | Array<Button>;
  buttonText?: string;
  phoneNumber?: string;
}

export interface PhoneNumber {
  id: string;
  number: string;
  name?: string;
}