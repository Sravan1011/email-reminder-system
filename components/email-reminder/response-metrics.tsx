import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { EmailWithMetrics } from '@/types/email';

interface ResponseDashboardProps {
  emails: EmailWithMetrics[];
}

export function ResponseDashboard({ emails }: ResponseDashboardProps) {
  const calculateMetrics = () => {
    return emails.map(email => ({
      subject: email.subject,
      responseTime: email.metrics.averageResponseTime,
      responseRate: (email.metrics.responseCount / email.metrics.totalResponses) * 100,
      priority: email.priority
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Response Times by Priority</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={calculateMetrics()}>
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="responseTime" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Priority Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emails.map(email => (
              <div key={email.id} className="p-4 border rounded">
                <h3 className="font-medium">{email.subject}</h3>
                <div className="mt-2 text-sm text-gray-500">
                  Current Priority: {email.priority}
                  {email.suggestedPriority && email.suggestedPriority !== email.priority && (
                    <div className="text-blue-500">
                      Suggested Priority: {email.suggestedPriority}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
