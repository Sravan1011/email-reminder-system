import type { EmailWithMetrics, Priority } from '@/types/email';

export class PriorityAdjuster {
  private readonly responseThresholds = {
    quick: 24, // hours
    delayed: 72 // hours
  };

  adjustPriority(email: EmailWithMetrics): Priority {
    const { averageResponseTime, responsePattern } = email.metrics;
    
    if (averageResponseTime > this.responseThresholds.delayed && 
        responsePattern === 'delayed') {
      return this.increasePriority(email.priority);
    }
    
    if (averageResponseTime < this.responseThresholds.quick && 
        responsePattern === 'quick') {
      return this.decreasePriority(email.priority);
    }
    
    return email.priority;
  }

  private increasePriority(current: Priority): Priority {
    switch (current) {
      case 'low': return 'medium';
      case 'medium': return 'high';
      default: return 'high';
    }
  }

  private decreasePriority(current: Priority): Priority {
    switch (current) {
      case 'high': return 'medium';
      case 'medium': return 'low';
      default: return 'low';
    }
  }
}