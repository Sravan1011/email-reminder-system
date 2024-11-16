"use client"
import React, { useState } from 'react';
import { EmailForm } from './email-form';
import { FollowUpTimeline } from './follow-up-timeline';
import EmailList from './email-list';
import { AdaptiveFollowUpStrategy } from './backtracking-algorithm';
import { PriorityAdjuster } from './priority-adjuster';
import type { Email, Priority, FollowUpConfig, EmailWithMetrics } from '@/types/email';

export default function EmailReminderSystem() {
  const [emails, setEmails] = useState<EmailWithMetrics[]>([]);
  const [newEmail, setNewEmail] = useState<Partial<Email>>({
    subject: '',
    recipient: '',
    sentDate: '',
    priority: 'medium'
  });
  const [selectedEmail, setSelectedEmail] = useState<EmailWithMetrics | null>(null);
  const strategyGenerator = new AdaptiveFollowUpStrategy();
  const priorityAdjuster = new PriorityAdjuster();

  const handleAddEmail = () => {
    if (!newEmail.subject || !newEmail.recipient || !newEmail.sentDate || !newEmail.priority) {
      return;
    }

    const emailConfig: FollowUpConfig = {
      priority: newEmail.priority,
      responseRate: 0.5,
      totalFollowUps: 0,
      successfulFollowUps: 0
    };

    const strategies = strategyGenerator.generateStrategies(newEmail.sentDate, emailConfig);

    const newEmailWithMetrics: EmailWithMetrics = {
      ...newEmail as Email,
      id: Date.now(),
      strategies,
      selectedStrategy: strategies[0],
      status: 'pending',
      responseRate: 0.5,
      totalFollowUps: 0,
      successfulFollowUps: 0,
      currentFollowUpIndex: 0,
      completedFollowUps: [],
      metrics: {
        lastResponseTime: 0,
        averageResponseTime: 0,
        responseCount: 0,
        totalResponses: 0,
        responsePattern: 'inconsistent'
      }
    };

    setEmails([...emails, newEmailWithMetrics]);
    setNewEmail({ subject: '', recipient: '', sentDate: '', priority: 'medium' });
  };

  const handleDeleteEmail = (emailId: number) => {
    setEmails(emails.filter(email => email.id !== emailId));
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null);
    }
  };

  const handlePriorityChange = (emailId: number, newPriority: Priority) => {
    setEmails(emails.map(email => {
      if (email.id === emailId) {
        const emailConfig: FollowUpConfig = {
          priority: newPriority,
          responseRate: email.responseRate,
          lastResponseTime: email.lastResponseTime,
          totalFollowUps: email.totalFollowUps,
          successfulFollowUps: email.successfulFollowUps
        };

        const newStrategies = strategyGenerator.generateStrategies(email.sentDate, emailConfig);
        
        return {
          ...email,
          priority: newPriority,
          strategies: newStrategies,
          selectedStrategy: newStrategies[0],
          suggestedPriority: priorityAdjuster.adjustPriority(email)
        };
      }
      return email;
    }));
  };

  const handleFollowUp = (emailId: number) => {
    setEmails(emails.map(email => {
      if (email.id === emailId) {
        // Make sure completedFollowUps is initialized if undefined
        const completedFollowUps = email.completedFollowUps || [];
        const currentIndex = email.currentFollowUpIndex || 0;
        const currentDate = email.selectedStrategy.dates[currentIndex];

        // Check if we still have follow-ups available
        if (currentIndex < email.selectedStrategy.dates.length) {
          return {
            ...email,
            currentFollowUpIndex: currentIndex + 1,
            completedFollowUps: [...completedFollowUps, currentDate],
            totalFollowUps: (email.totalFollowUps || 0) + 1,
            status: currentIndex + 1 === email.selectedStrategy.dates.length ? 'completed' : 'pending'
          };
        }
      }
      return email;
    }));
  };

  const updateEmailMetrics = (emailId: number, responseTime: number) => {
    setEmails(emails.map(email => {
      if (email.id === emailId) {
        const newMetrics = {
          lastResponseTime: responseTime,
          averageResponseTime: (email.metrics.averageResponseTime * email.metrics.responseCount + responseTime) / 
                             (email.metrics.responseCount + 1),
          responseCount: email.metrics.responseCount + 1,
          totalResponses: email.metrics.totalResponses + 1,
          responsePattern: determineResponsePattern(responseTime, email.metrics)
        };

        const updatedEmail = {
          ...email,
          metrics: newMetrics,
        };

        const suggestedPriority = priorityAdjuster.adjustPriority(updatedEmail);
        return {
          ...updatedEmail,
          suggestedPriority
        };
      }
      return email;
    }));
  };

  const determineResponsePattern = (
    currentResponseTime: number, 
    metrics: EmailWithMetrics['metrics']
  ): 'quick' | 'delayed' | 'inconsistent' => {
    if (metrics.responseCount < 3) return 'inconsistent';
    const isQuick = currentResponseTime < 24;
    const wasQuick = metrics.averageResponseTime < 24;
    return isQuick === wasQuick ? (isQuick ? 'quick' : 'delayed') : 'inconsistent';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-black">
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EmailForm
            onAddEmail={handleAddEmail}
            newEmail={newEmail}
            setNewEmail={setNewEmail}
          />
          <FollowUpTimeline selectedEmail={selectedEmail} />
        </div>
        
        <div className="md:col-span-2">
          <EmailList
            emails={emails}
            selectedEmail={selectedEmail}
            onSelectEmail={setSelectedEmail}
            onDeleteEmail={handleDeleteEmail}
            onPriorityChange={handlePriorityChange}
            onUpdateMetrics={updateEmailMetrics}
            onFollowUp={handleFollowUp}
          />
        </div>
      </div>
    </div>
  );
}