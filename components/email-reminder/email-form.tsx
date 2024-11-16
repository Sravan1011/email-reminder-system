"use client"
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Mail, Plus, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Email, Priority } from '@/types/email';

interface EmailFormProps {
  onAddEmail: () => void;
  newEmail: Partial<Email>;
  setNewEmail: (email: Partial<Email>) => void;
}

export function EmailForm({ onAddEmail, newEmail, setNewEmail }: EmailFormProps) {
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold mb-4">New Email Follow-up</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              placeholder="Email Title"
              className="w-full p-2 border rounded"
              value={newEmail.subject || ''}
              onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
            <input
              type="email"
              placeholder="Primary Recipient"
              className="w-full p-2 border rounded mb-2"
              value={newEmail.recipient || ''}
              onChange={(e) => setNewEmail({ ...newEmail, recipient: e.target.value })}
            />
            <input
              type="email"
              placeholder="CC Recipients (comma separated)"
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority & Schedule</label>
            <div className="grid grid-cols-2 gap-4">
              <select
                className="p-2 border rounded"
                value={newEmail.priority || 'medium'}
                onChange={(e) => setNewEmail({ ...newEmail, priority: e.target.value as Priority })}
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <input
                type="date"
                className="p-2 border rounded"
                value={newEmail.sentDate || ''}
                onChange={(e) => setNewEmail({ ...newEmail, sentDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Body</label>
            <textarea
              placeholder="Write your email content..."
              className="w-full p-2 border rounded min-h-[200px]"
              value={newEmail.body || ''}
              onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
            <div className="border-2 border-dashed rounded-lg p-4">
              <input
                type="file"
                multiple
                onChange={handleAttachmentChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center cursor-pointer"
              >
                <Paperclip className="w-5 h-5 mr-2" />
                <span>Click to attach files</span>
              </label>
            </div>
            {attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm truncate">{file.name}</span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={onAddEmail}
              className="flex-1 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Follow-up
            </button>
            <button
              type="button"
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Save as Draft
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}