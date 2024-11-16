import type { FollowUpConfig, FollowUpStrategy, Priority } from '@/types/email';

export class AdaptiveFollowUpStrategy {
  private readonly baseIntervals = {
    high: [1, 3, 5, 7],
    medium: [3, 7, 14, 21],
    low: [7, 14, 30, 45]
  };

  private readonly maxDuration = 90;
  private readonly successThreshold = 0.7;
  private readonly learningRate = 0.1;

  private successRates: Map<Priority, number> = new Map([
    ['high', 0.8],
    ['medium', 0.6],
    ['low', 0.4]
  ]);

  generateStrategies(initialDate: string, config: FollowUpConfig): FollowUpStrategy[] {
    const strategies: FollowUpStrategy[] = [];
    const baseIntervals = this.getAdaptedIntervals(config);
    
    const backtrack = (
      current: Date,
      strategy: Date[],
      intervals: number[],
      depth: number,
      maxDepth: number
    ): void => {
      if (depth === maxDepth) {
        const expectedSuccess = this.calculateExpectedSuccess(
          intervals,
          config.priority,
          config.responseRate
        );
        
        strategies.push({
          dates: [...strategy],
          expectedSuccessRate: expectedSuccess,
          priority: config.priority,
          intervals: [...intervals]
        });
        return;
      }

      for (const interval of baseIntervals) {
        const nextDate = new Date(current);
        nextDate.setDate(nextDate.getDate() + interval);

        if (this.isValidFollowUp(nextDate, initialDate, strategy, config)) {
          strategy.push(nextDate);
          intervals.push(interval);
          backtrack(nextDate, strategy, intervals, depth + 1, maxDepth);
          strategy.pop();
          intervals.pop();
        }
      }
    };

    const maxFollowUps = this.determineMaxFollowUps(config);
    backtrack(new Date(initialDate), [], [], 0, maxFollowUps);

    return this.rankStrategies(strategies, config);
  }

  private getAdaptedIntervals(config: FollowUpConfig): number[] {
    const baseSet = [...this.baseIntervals[config.priority]];
    
    if (config.responseRate && config.lastResponseTime) {
      const adaptedIntervals = baseSet.map(interval => {
        const adaptation = this.learningRate * (config.responseRate! - 0.5);
        return Math.round(interval * (1 - adaptation));
      });
      
      return Array.from(new Set([...baseSet, ...adaptedIntervals])).sort((a, b) => a - b);
    }
    
    return baseSet;
  }

  private isValidFollowUp(
    nextDate: Date,
    initialDate: string,
    currentStrategy: Date[],
    config: FollowUpConfig
  ): boolean {
    const startDate = new Date(initialDate);
    const daysSinceStart = (nextDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceStart > this.maxDuration) return false;
    
    if (currentStrategy.length > 0) {
      const lastFollowUp = currentStrategy[currentStrategy.length - 1];
      const minSpacing = config.priority === 'high' ? 1 : 
                        config.priority === 'medium' ? 2 : 3;
      
      const daysSinceLastFollowUp = 
        (nextDate.getTime() - lastFollowUp.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastFollowUp < minSpacing) return false;
    }
    return true;
  }

  private calculateExpectedSuccess(
    intervals: number[],
    priority: Priority,
    responseRate?: number
  ): number {
    const baseSuccess = this.successRates.get(priority) || 0.5;
    
    if (!responseRate) return baseSuccess;

    const weightedSuccess = (baseSuccess + responseRate) / 2;
    
    const intervalPenalty = intervals.some(interval => {
      return (priority === 'high' && interval > 7) ||
             (priority === 'low' && interval < 7);
    }) ? 0.1 : 0;

    return Math.max(0, Math.min(1, weightedSuccess - intervalPenalty));
  }

  private determineMaxFollowUps(config: FollowUpConfig): number {
    const base = config.priority === 'high' ? 5 :
                config.priority === 'medium' ? 4 : 3;

    if (config.responseRate && config.responseRate < 0.3) {
      return Math.max(2, base - 1);
    }
    return base;
  }

  private rankStrategies(
    strategies: FollowUpStrategy[],
    config: FollowUpConfig
  ): FollowUpStrategy[] {
    return strategies.sort((a, b) => {
      const successDiff = b.expectedSuccessRate - a.expectedSuccessRate;
      if (Math.abs(successDiff) > 0.1) return successDiff;
      
      const aScore = this.calculatePriorityAlignment(a, config);
      const bScore = this.calculatePriorityAlignment(b, config);
      return bScore - aScore;
    });
  }

  private calculatePriorityAlignment(
    strategy: FollowUpStrategy,
    config: FollowUpConfig
  ): number {
    const avgInterval = strategy.intervals.reduce((a, b) => a + b, 0) / strategy.intervals.length;
    
    switch (config.priority) {
      case 'high':
        return avgInterval <= 5 ? 1 : avgInterval <= 7 ? 0.7 : 0.3;
      case 'medium':
        return avgInterval >= 7 && avgInterval <= 14 ? 1 : 0.5;
      case 'low':
        return avgInterval >= 14 ? 1 : avgInterval >= 7 ? 0.7 : 0.3;
      default:
        return 0.5;
    }
  }
}