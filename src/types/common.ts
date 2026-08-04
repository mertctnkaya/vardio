import React from 'react';

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  topic?: string;
  contact_info?: string;
  created_at: string;
}

export interface FAQ {
  q: string;
  a: React.ReactNode;
  isImportant?: boolean;
}

export interface FAQCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  faqs: FAQ[];
}