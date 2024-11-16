import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { Star, Trash2, Clock, AlertCircle, ChevronDown, ChevronUp, Paperclip, Check } from 'lucide-react';
import type { EmailWithMetrics, Priority } from '@/types/email';

interface EmailListProps {
  emails: EmailWithMetrics[];
  selectedEmail: EmailWithMetrics | null;
  onSelectEmail: (email: EmailWithMetrics) => void;
  onDeleteEmail: (id: number) => void;
  onPriorityChange: (id: number, priority: Priority) => void;
  onUpdateMetrics: (id: number, responseTime: number) => void;
  onFollowUp: (emailId: number, followUpIndex: number) => void;
}

const isDateInCompletedFollowUps = (date: Date, completedFollowUps?: Date[]) => {
  if (!completedFollowUps) return false;
  return completedFollowUps.some(
    completedDate => new Date(completedDate).getTime() === new Date(date).getTime()
  );
};

export default function EmailList({
  emails,
  selectedEmail,
  onSelectEmail,
  onDeleteEmail,
  onPriorityChange,
  onUpdateMetrics,
  onFollowUp
}: EmailListProps) {
  const [expandedEmailId, setExpandedEmailId] = useState<number | null>(null);

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
    }
  };

  const toggleEmailExpansion = (emailId: number) => {
    setExpandedEmailId(expandedEmailId === emailId ? null : emailId);
  };

  const isFollowUpAvailable = (email: EmailWithMetrics, index: number) => {
    return index === email.currentFollowUpIndex && 
           !isDateInCompletedFollowUps(email.selectedStrategy.dates[index], email.completedFollowUps) &&
           email.status !== 'completed';
  };

  const getNextFollowUpDate = (email: EmailWithMetrics) => {
    const currentIndex = email.currentFollowUpIndex || 0;
    if (currentIndex < email.selectedStrategy.dates.length) {
      return new Date(email.selectedStrategy.dates[currentIndex]).toLocaleDateString();
    }
    return 'All follow-ups completed';
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="border-b bg-gray-50 px-4 py-3 flex items-center gap-4">
          <button className="text-gray-500 hover:bg-gray-200 p-2 rounded-full">
            <Clock className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search emails..."
              className="w-full px-3 py-1.5 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="divide-y">
          {emails.map((email) => (
            <div key={email.id}>
              <div
                className={`flex items-start p-4 hover:bg-gray-50 cursor-pointer ${
                  selectedEmail?.id === email.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => {
                  onSelectEmail(email);
                  toggleEmailExpansion(email.id);
                }}
              >
                <div className="flex items-center gap-4 min-w-[200px]">
                  <Star 
                    className={`w-5 h-5 ${
                      email.priority === 'high' ? 'text-yellow-400 fill-current' : 'text-gray-400'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPriorityChange(email.id, 'high');
                    }}
                  />
                  <Badge className={getPriorityColor(email.priority)}>
                    {email.priority}
                  </Badge>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium truncate">{email.subject}</h3>
                    <div className="flex items-center gap-2">
                      {email.suggestedPriority && email.suggestedPriority !== email.priority && (
                        <div title="Priority change suggested">
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        </div>
                      )}
                      <span className="text-sm text-gray-500">
                        {new Date(email.sentDate).toLocaleDateString()}
                      </span>
                      {expandedEmailId === email.id ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                      }
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {email.recipient}
                  </p>
                  <div className="flex gap-2 mt-2 text-sm">
                    <span className="text-gray-500">
                      Next follow-up: {getNextFollowUpDate(email)}
                    </span>
                    {email.metrics.responsePattern !== 'inconsistent' && (
                      <Badge className={`
                        ${email.metrics.responsePattern === 'quick' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      `}>
                        {email.metrics.responsePattern} responses
                      </Badge>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEmail(email.id);
                  }}
                  className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {expandedEmailId === email.id && (
                <div className="bg-gray-50 p-4 border-t">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700">Email Content</h4>
                      <p className="mt-2 text-gray-600 whitespace-pre-wrap">{email.body}</p>
                    </div>

                    {email.cc && email.cc.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700">CC Recipients</h4>
                        <p className="mt-1 text-gray-600">{email.cc.join(', ')}</p>
                      </div>
                    )}

                    {email.attachments && email.attachments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700">Attachments</h4>
                        <div className="mt-2 space-y-2">
                          {email.attachments.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm bg-gray-100 p-2 rounded">
                              <Paperclip className="w-4 h-4" />
                              <span>{file.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700">Priority Settings</h4>
                      <div className="mt-2 flex items-center gap-4">
                        <select
                          value={email.priority}
                          onChange={(e) => {
                            e.stopPropagation();
                            onPriorityChange(email.id, e.target.value as Priority);
                          }}
                          className="p-2 border rounded text-sm"
                        >
                          <option value="high">High Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="low">Low Priority</option>
                        </select>
                        {email.suggestedPriority && email.suggestedPriority !== email.priority && (
                          <div className="flex items-center gap-2 text-sm text-yellow-600">
                            <AlertCircle className="w-4 h-4" />
                            <span>Suggested: {email.suggestedPriority}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onPriorityChange(email.id, email.suggestedPriority!);
                              }}
                              className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200"
                            >
                              Apply Suggestion
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700">Follow-up Schedule</h4>
                      <div className="mt-2 space-y-2">
                        <div className="text-sm text-gray-500 mb-2">
                          {email.priority === 'high' ? 'Frequent follow-ups (1-7 days)' :
                           email.priority === 'medium' ? 'Standard follow-ups (3-14 days)' :
                           'Relaxed follow-ups (7-30 days)'}
                        </div>
                        {email.selectedStrategy.dates.map((date, index) => (
                          <div key={index} className="flex items-center justify-between text-sm text-gray-600 bg-white p-2 rounded border">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <div>
                                <span>Follow-up #{index + 1}: {new Date(date).toLocaleDateString()}</span>
                                <div className="text-xs text-gray-400">
                                  {index > 0 && `${Math.round((date.getTime() - email.selectedStrategy.dates[index-1].getTime()) / (1000 * 60 * 60 * 24))} days after previous`}
                                </div>
                              </div>
                            </div>
                            {index === (email.currentFollowUpIndex || 0) && 
                             !isDateInCompletedFollowUps(date, email.completedFollowUps) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onFollowUp(email.id, index);
                                }}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                              >
                                <Clock className="w-4 h-4" />
                                Send Follow-up
                              </button>
                            )}
                            {isDateInCompletedFollowUps(date, email.completedFollowUps) && (
                              <span className="flex items-center gap-1 text-green-500">
                                <Check className="w-4 h-4" />
                                Completed
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700">Response Metrics</h4>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div className="text-sm text-gray-600">
                          Responses: {email.metrics.responseCount}/{email.metrics.totalResponses}
                        </div>
                        <div className="text-sm text-gray-600">
                          Avg Response Time: {Math.round(email.metrics.averageResponseTime)}h
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}