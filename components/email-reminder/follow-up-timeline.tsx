import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Email } from '@/types/email';

interface TimelineProps {
  selectedEmail: Email | null;
}

export function FollowUpTimeline({ selectedEmail }: TimelineProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Follow-up Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedEmail ? (
          <div className="space-y-4">
            <h3 className="font-bold">{selectedEmail.subject}</h3>
            <div className="relative">
              {selectedEmail.selectedStrategy.dates.map((date: Date, index: number) => (
                <div key={index} className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      Follow-up #{index + 1}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(date)}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              Select an email to view its follow-up timeline
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}