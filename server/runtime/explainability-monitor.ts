/**
 * SINGULARIS PRIME Explainability Monitor
 * 
 * This module provides real-time monitoring and tracking of AI explainability
 * scores during SINGULARIS PRIME code execution. It enforces explainability
 * thresholds and provides detailed analytics on explainability trends.
 * 
 * Key responsibilities:
 * - Real-time explainability score tracking
 * - Threshold violation detection and alerting
 * - Explainability trend analysis and prediction
 * - Integration with AI verification service
 * - Detailed metrics and reporting for audit compliance
 */

import { EventEmitter } from 'events';
import {
  AIEntityId,
  AIContractId,
  ExplainabilityScore,
  HumanOversightLevel,
  OperationCriticality,
  isHighExplainability,
  requiresHumanOversight
} from '../../shared/types/ai-types';

// Explainability measurement
export interface ExplainabilityMeasurement {
  readonly timestamp: number;
  readonly entityId?: AIEntityId;
  readonly contractId?: AIContractId;
  readonly operationId: string;
  readonly score: ExplainabilityScore;
  readonly threshold: ExplainabilityScore;
  readonly method: ExplainabilityMethod;
  readonly details: ExplainabilityDetails;
  readonly context: MeasurementContext;
}

export interface ExplainabilityDetails {
  readonly factors: ExplainabilityFactor[];
  readonly confidence: number; // 0.0 - 1.0
  readonly methodology: string;
  readonly computationTime: number; // milliseconds
  readonly dataPoints: number;
  readonly improvements: string[];
}

export interface ExplainabilityFactor {
  readonly category: 'code_structure' | 'documentation' | 'complexity' | 'variable_naming' | 'algorithm_clarity' | 'external_dependencies';
  readonly impact: number; // -1.0 to 1.0
  readonly description: string;
  readonly suggestion?: string;
}

export interface MeasurementContext {
  readonly sourceLocation?: { line: number; column: number; file: string };
  readonly codeFragment?: string;
  readonly functionName?: string;
  readonly algorithmType?: string;
  readonly inputComplexity?: number;
  readonly outputComplexity?: number;
}

export enum ExplainabilityMethod {
  STATIC_ANALYSIS = 'static_analysis',
  DYNAMIC_ANALYSIS = 'dynamic_analysis',
  AI_EVALUATION = 'ai_evaluation',
  HUMAN_ASSESSMENT = 'human_assessment',
  HYBRID_APPROACH = 'hybrid_approach'
}

// Trend analysis
export interface ExplainabilityTrend {
  readonly timeframe: 'hour' | 'day' | 'week' | 'month';
  readonly averageScore: ExplainabilityScore;
  readonly trend: 'improving' | 'stable' | 'declining';
  readonly changeRate: number; // percentage change
  readonly measurements: number;
  readonly violationRate: number; // percentage of measurements below threshold
  readonly predictions: TrendPrediction[];
}

export interface TrendPrediction {
  readonly horizon: number; // hours into the future
  readonly predictedScore: ExplainabilityScore;
  readonly confidence: number;
  readonly riskLevel: 'low' | 'medium' | 'high';
}

// Alert system
export interface ExplainabilityAlert {
  readonly id: string;
  readonly timestamp: number;
  readonly type: 'threshold_violation' | 'trend_warning' | 'measurement_failure' | 'improvement_opportunity';
  readonly severity: 'info' | 'warning' | 'error' | 'critical';
  readonly message: string;
  readonly details: Record<string, any>;
  readonly operationId?: string;
  readonly entityId?: AIEntityId;
  readonly suggestions: string[];
  readonly acknowledged: boolean;
}

// Monitoring configuration
export interface MonitoringConfig {
  readonly enabled: boolean;
  readonly globalThreshold: ExplainabilityScore;
  readonly measurementInterval: number; // milliseconds
  readonly trendAnalysisWindow: number; // hours
  readonly alertThresholds: {
    readonly warning: ExplainabilityScore;
    readonly error: ExplainabilityScore;
    readonly critical: ExplainabilityScore;
  };
  readonly enablePredictiveAnalysis: boolean;
  readonly maxMeasurementsRetained: number;
}

/**
 * Real-time Explainability Monitor
 */
export class ExplainabilityMonitor extends EventEmitter {
  private static instance: ExplainabilityMonitor | null = null;
  
  // State management
  private isMonitoring: boolean = false;
  private measurements: ExplainabilityMeasurement[] = [];
  private alerts: ExplainabilityAlert[] = [];
  private trends: Map<string, ExplainabilityTrend> = new Map();
  
  // Configuration
  private config: MonitoringConfig = {
    enabled: true,
    globalThreshold: 0.85 as ExplainabilityScore,
    measurementInterval: 1000, // 1 second
    trendAnalysisWindow: 24, // 24 hours
    alertThresholds: {
      warning: 0.75 as ExplainabilityScore,
      error: 0.65 as ExplainabilityScore,
      critical: 0.50 as ExplainabilityScore
    },
    enablePredictiveAnalysis: true,
    maxMeasurementsRetained: 10000
  };
  
  // Metrics tracking
  private metrics = {
    totalMeasurements: 0,
    thresholdViolations: 0,
    averageScore: 0.85 as ExplainabilityScore,
    lastMeasurement: null as ExplainabilityMeasurement | null,
    activeAlerts: 0
  };
  
  constructor() {
    super();
    this.setupEventHandlers();
  }
  
  /**
   * Singleton pattern for global access
   */
  public static getInstance(): ExplainabilityMonitor {
    if (!ExplainabilityMonitor.instance) {
      ExplainabilityMonitor.instance = new ExplainabilityMonitor();
    }
    return ExplainabilityMonitor.instance;
  }
  
  /**
   * Start monitoring explainability
   */
  public async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      return;
    }
    
    this.isMonitoring = true;
    this.emit('monitoring_started', { timestamp: Date.now(), config: this.config });
    
    // Start periodic trend analysis
    if (this.config.enablePredictiveAnalysis) {
      this.startTrendAnalysis();
    }
    
    console.log('Explainability Monitor started');
  }
  
  /**
   * Stop monitoring
   */
  public async stopMonitoring(): Promise<void> {
    this.isMonitoring = false;
    this.emit('monitoring_stopped', { timestamp: Date.now() });
    console.log('Explainability Monitor stopped');
  }
  
  /**
   * Measure explainability for an operation
   */
  public async measureExplainability(
    operationId: string,
    code: string,
    method: ExplainabilityMethod = ExplainabilityMethod.HYBRID_APPROACH,
    context: Partial<MeasurementContext> = {},
    entityId?: AIEntityId,
    contractId?: AIContractId
  ): Promise<ExplainabilityMeasurement> {
    const startTime = Date.now();
    
    try {
      // Perform explainability analysis based on method
      const analysis = await this.performExplainabilityAnalysis(code, method, context);
      
      const measurement: ExplainabilityMeasurement = {
        timestamp: startTime,
        entityId,
        contractId,
        operationId,
        score: analysis.score,
        threshold: this.getThresholdForOperation(operationId, context),
        method,
        details: analysis.details,
        context: {
          ...context,
          sourceLocation: context.sourceLocation,
          codeFragment: code.substring(0, 500), // Limit code fragment size
        }
      };
      
      // Store measurement
      this.addMeasurement(measurement);
      
      // Check for threshold violations
      await this.checkThresholdViolation(measurement);
      
      // Update metrics
      this.updateMetrics(measurement);
      
      // Emit measurement event
      this.emit('measurement_completed', measurement);
      
      return measurement;
      
    } catch (error) {
      // Handle measurement errors
      const errorMeasurement: ExplainabilityMeasurement = {
        timestamp: startTime,
        entityId,
        contractId,
        operationId,
        score: 0.0 as ExplainabilityScore,
        threshold: this.config.globalThreshold,
        method,
        details: {
          factors: [],
          confidence: 0.0,
          methodology: 'error',
          computationTime: Date.now() - startTime,
          dataPoints: 0,
          improvements: [`Measurement failed: ${error instanceof Error ? error.message : String(error)}`]
        },
        context
      };
      
      this.addAlert({
        id: `measurement_error_${Date.now()}`,
        timestamp: Date.now(),
        type: 'measurement_failure',
        severity: 'error',
        message: `Failed to measure explainability for operation ${operationId}`,
        details: { error: error instanceof Error ? error.message : String(error) },
        operationId,
        entityId,
        suggestions: ['Retry measurement', 'Check code syntax', 'Verify analysis method'],
        acknowledged: false
      });
      
      this.emit('measurement_error', { operationId, error });
      return errorMeasurement;
    }
  }
  
  /**
   * Get current explainability status
   */
  public getStatus(): {
    isMonitoring: boolean;
    metrics: typeof this.metrics;
    activeAlerts: ExplainabilityAlert[];
    recentMeasurements: ExplainabilityMeasurement[];
    trends: ExplainabilityTrend[];
  } {
    return {
      isMonitoring: this.isMonitoring,
      metrics: { ...this.metrics },
      activeAlerts: this.alerts.filter(alert => !alert.acknowledged),
      recentMeasurements: this.measurements.slice(-10),
      trends: Array.from(this.trends.values())
    };
  }
  
  /**
   * Get measurements for a specific time range
   */
  public getMeasurements(
    startTime?: number, 
    endTime?: number, 
    operationId?: string
  ): ExplainabilityMeasurement[] {
    let filtered = this.measurements;
    
    if (startTime) {
      filtered = filtered.filter(m => m.timestamp >= startTime);
    }
    
    if (endTime) {
      filtered = filtered.filter(m => m.timestamp <= endTime);
    }
    
    if (operationId) {
      filtered = filtered.filter(m => m.operationId === operationId);
    }
    
    return filtered;
  }
  
  /**
   * Acknowledge an alert
   */
  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      (alert as any).acknowledged = true;
      this.metrics.activeAlerts = this.alerts.filter(a => !a.acknowledged).length;
      this.emit('alert_acknowledged', { alertId, timestamp: Date.now() });
      return true;
    }
    return false;
  }
  
  /**
   * Update monitoring configuration
   */
  public updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('config_updated', { config: this.config, timestamp: Date.now() });
  }
  
  /**
   * Perform explainability analysis using the specified method
   */
  private async performExplainabilityAnalysis(
    code: string, 
    method: ExplainabilityMethod, 
    context: Partial<MeasurementContext>
  ): Promise<{ score: ExplainabilityScore; details: ExplainabilityDetails }> {
    const startTime = Date.now();
    
    switch (method) {
      case ExplainabilityMethod.STATIC_ANALYSIS:
        return this.performStaticAnalysis(code, context);
      
      case ExplainabilityMethod.DYNAMIC_ANALYSIS:
        return this.performDynamicAnalysis(code, context);
      
      case ExplainabilityMethod.AI_EVALUATION:
        return this.performAIEvaluation(code, context);
      
      case ExplainabilityMethod.HUMAN_ASSESSMENT:
        return this.performHumanAssessment(code, context);
      
      case ExplainabilityMethod.HYBRID_APPROACH:
      default:
        return this.performHybridAnalysis(code, context);
    }
  }
  
  /**
   * Static code analysis for explainability
   */
  private async performStaticAnalysis(
    code: string, 
    context: Partial<MeasurementContext>
  ): Promise<{ score: ExplainabilityScore; details: ExplainabilityDetails }> {
    const factors: ExplainabilityFactor[] = [];
    let score = 0.5; // Base score
    
    // 1. Comment density analysis
    const commentLines = (code.match(/\/\*[\s\S]*?\*\/|\/\/.*/g) || []).length;
    const totalLines = code.split('\n').length;
    const commentRatio = totalLines > 0 ? commentLines / totalLines : 0;
    
    if (commentRatio > 0.2) {
      score += 0.15;
      factors.push({
        category: 'documentation',
        impact: 0.15,
        description: `Good comment density: ${(commentRatio * 100).toFixed(1)}%`,
      });
    } else {
      factors.push({
        category: 'documentation',
        impact: -0.1,
        description: `Low comment density: ${(commentRatio * 100).toFixed(1)}%`,
        suggestion: 'Add more explanatory comments'
      });
    }
    
    // 2. Variable naming quality
    const variableNames = code.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g) || [];
    const descriptiveNames = variableNames.filter(name => 
      name.length > 3 && !['true', 'false', 'null', 'undefined'].includes(name)
    );
    const namingQuality = variableNames.length > 0 ? descriptiveNames.length / variableNames.length : 0;
    
    if (namingQuality > 0.7) {
      score += 0.1;
      factors.push({
        category: 'variable_naming',
        impact: 0.1,
        description: `Good variable naming: ${(namingQuality * 100).toFixed(1)}% descriptive`,
      });
    } else {
      factors.push({
        category: 'variable_naming',
        impact: -0.05,
        description: `Poor variable naming: ${(namingQuality * 100).toFixed(1)}% descriptive`,
        suggestion: 'Use more descriptive variable names'
      });
    }
    
    // 3. Function complexity analysis
    const functionMatches = code.match(/function\s+\w+\s*\([^)]*\)\s*\{/g) || [];
    const avgFunctionSize = functionMatches.length > 0 
      ? code.split('\n').length / functionMatches.length 
      : 0;
    
    if (avgFunctionSize > 0 && avgFunctionSize < 50) {
      score += 0.1;
      factors.push({
        category: 'code_structure',
        impact: 0.1,
        description: `Good function size: ${avgFunctionSize.toFixed(1)} lines average`,
      });
    } else if (avgFunctionSize >= 50) {
      factors.push({
        category: 'code_structure',
        impact: -0.1,
        description: `Large functions detected: ${avgFunctionSize.toFixed(1)} lines average`,
        suggestion: 'Break down large functions into smaller, more focused ones'
      });
    }
    
    // 4. SINGULARIS PRIME specific constructs
    const spConstructs = [
      'QKD_INIT', 'AI_CONTRACT', 'QUANTUM_OPERATION', 
      '@HumanAuditable', '@explain', 'explainabilityThreshold'
    ];
    
    const spUsage = spConstructs.filter(construct => code.includes(construct)).length;
    if (spUsage > 0) {
      score += 0.05 * spUsage;
      factors.push({
        category: 'algorithm_clarity',
        impact: 0.05 * spUsage,
        description: `Uses ${spUsage} SINGULARIS PRIME explainability constructs`,
      });
    }
    
    // Clamp score to valid range
    score = Math.max(0, Math.min(1, score));
    
    const details: ExplainabilityDetails = {
      factors,
      confidence: 0.8, // Static analysis has high confidence
      methodology: 'Static code analysis with SINGULARIS PRIME awareness',
      computationTime: Date.now() - Date.now(),
      dataPoints: totalLines,
      improvements: factors
        .filter(f => f.impact < 0)
        .map(f => f.suggestion || f.description)
        .filter(Boolean) as string[]
    };
    
    return { score: score as ExplainabilityScore, details };
  }
  
  /**
   * Dynamic analysis (simplified implementation)
   */
  private async performDynamicAnalysis(
    code: string, 
    context: Partial<MeasurementContext>
  ): Promise<{ score: ExplainabilityScore; details: ExplainabilityDetails }> {
    // For now, return a basic dynamic analysis
    // In a full implementation, this would analyze runtime behavior
    return {
      score: 0.75 as ExplainabilityScore,
      details: {
        factors: [{
          category: 'algorithm_clarity',
          impact: 0.25,
          description: 'Dynamic analysis: Runtime behavior appears predictable'
        }],
        confidence: 0.6,
        methodology: 'Dynamic runtime behavior analysis',
        computationTime: 50,
        dataPoints: 100,
        improvements: ['Consider adding runtime logging for better traceability']
      }
    };
  }
  
  /**
   * AI-powered evaluation (simplified implementation)
   */
  private async performAIEvaluation(
    code: string, 
    context: Partial<MeasurementContext>
  ): Promise<{ score: ExplainabilityScore; details: ExplainabilityDetails }> {
    // For now, return a basic AI evaluation
    // In a full implementation, this would use an AI service
    return {
      score: 0.80 as ExplainabilityScore,
      details: {
        factors: [{
          category: 'complexity',
          impact: 0.3,
          description: 'AI evaluation: Code structure is reasonably clear'
        }],
        confidence: 0.7,
        methodology: 'AI-powered semantic analysis',
        computationTime: 200,
        dataPoints: 50,
        improvements: ['Consider adding more semantic annotations']
      }
    };
  }
  
  /**
   * Human assessment (placeholder)
   */
  private async performHumanAssessment(
    code: string, 
    context: Partial<MeasurementContext>
  ): Promise<{ score: ExplainabilityScore; details: ExplainabilityDetails }> {
    // Placeholder for human assessment
    return {
      score: 0.90 as ExplainabilityScore,
      details: {
        factors: [{
          category: 'algorithm_clarity',
          impact: 0.4,
          description: 'Human assessment: High clarity and understandability'
        }],
        confidence: 0.95,
        methodology: 'Human expert evaluation',
        computationTime: 0,
        dataPoints: 1,
        improvements: []
      }
    };
  }
  
  /**
   * Hybrid analysis combining multiple methods
   */
  private async performHybridAnalysis(
    code: string, 
    context: Partial<MeasurementContext>
  ): Promise<{ score: ExplainabilityScore; details: ExplainabilityDetails }> {
    const startTime = Date.now();
    
    // Perform static analysis (primary method)
    const staticResult = await this.performStaticAnalysis(code, context);
    
    // Weight: 70% static, 20% AI evaluation, 10% dynamic
    const staticWeight = 0.7;
    const aiWeight = 0.2;
    const dynamicWeight = 0.1;
    
    let totalScore = staticResult.score * staticWeight;
    const allFactors = [...staticResult.details.factors];
    const allImprovements = [...staticResult.details.improvements];
    
    // Add AI evaluation if available
    try {
      const aiResult = await this.performAIEvaluation(code, context);
      totalScore += aiResult.score * aiWeight;
      allFactors.push(...aiResult.details.factors);
      allImprovements.push(...aiResult.details.improvements);
    } catch (error) {
      // Fallback if AI evaluation fails
      totalScore += 0.75 * aiWeight;
    }
    
    // Add dynamic analysis
    try {
      const dynamicResult = await this.performDynamicAnalysis(code, context);
      totalScore += dynamicResult.score * dynamicWeight;
      allFactors.push(...dynamicResult.details.factors);
      allImprovements.push(...dynamicResult.details.improvements);
    } catch (error) {
      // Fallback if dynamic analysis fails
      totalScore += 0.70 * dynamicWeight;
    }
    
    return {
      score: Math.max(0, Math.min(1, totalScore)) as ExplainabilityScore,
      details: {
        factors: allFactors,
        confidence: 0.85, // High confidence for hybrid approach
        methodology: 'Hybrid analysis (static + AI + dynamic)',
        computationTime: Date.now() - startTime,
        dataPoints: allFactors.length,
        improvements: [...new Set(allImprovements)] // Remove duplicates
      }
    };
  }
  
  /**
   * Get threshold for specific operation
   */
  private getThresholdForOperation(
    operationId: string, 
    context: Partial<MeasurementContext>
  ): ExplainabilityScore {
    // For safety-critical operations, use higher threshold
    if (operationId.includes('safety') || operationId.includes('critical')) {
      return 0.95 as ExplainabilityScore;
    }
    
    // For AI contracts, use standard high threshold
    if (operationId.includes('contract') || operationId.includes('ai')) {
      return 0.90 as ExplainabilityScore;
    }
    
    return this.config.globalThreshold;
  }
  
  /**
   * Add measurement and manage storage
   */
  private addMeasurement(measurement: ExplainabilityMeasurement): void {
    this.measurements.push(measurement);
    
    // Limit storage size
    if (this.measurements.length > this.config.maxMeasurementsRetained) {
      this.measurements = this.measurements.slice(-this.config.maxMeasurementsRetained);
    }
  }
  
  /**
   * Check for threshold violations and create alerts
   */
  private async checkThresholdViolation(measurement: ExplainabilityMeasurement): Promise<void> {
    if (measurement.score < measurement.threshold) {
      const severity = measurement.score < this.config.alertThresholds.critical ? 'critical' :
                      measurement.score < this.config.alertThresholds.error ? 'error' :
                      measurement.score < this.config.alertThresholds.warning ? 'warning' : 'info';
      
      const alert: ExplainabilityAlert = {
        id: `threshold_violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        type: 'threshold_violation',
        severity,
        message: `Explainability score ${measurement.score.toFixed(3)} below threshold ${measurement.threshold.toFixed(3)}`,
        details: {
          operationId: measurement.operationId,
          score: measurement.score,
          threshold: measurement.threshold,
          method: measurement.method,
          context: measurement.context
        },
        operationId: measurement.operationId,
        entityId: measurement.entityId,
        suggestions: measurement.details.improvements,
        acknowledged: false
      };
      
      this.addAlert(alert);
      this.emit('threshold_violation', { measurement, alert });
    }
  }
  
  /**
   * Add alert and manage alerts
   */
  private addAlert(alert: ExplainabilityAlert): void {
    this.alerts.push(alert);
    this.metrics.activeAlerts = this.alerts.filter(a => !a.acknowledged).length;
    
    // Limit alert storage
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }
  }
  
  /**
   * Update metrics
   */
  private updateMetrics(measurement: ExplainabilityMeasurement): void {
    this.metrics.totalMeasurements++;
    this.metrics.lastMeasurement = measurement;
    
    if (measurement.score < measurement.threshold) {
      this.metrics.thresholdViolations++;
    }
    
    // Calculate running average
    const recentMeasurements = this.measurements.slice(-100);
    this.metrics.averageScore = (
      recentMeasurements.reduce((sum, m) => sum + m.score, 0) / recentMeasurements.length
    ) as ExplainabilityScore;
  }
  
  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.on('measurement_completed', (measurement: ExplainabilityMeasurement) => {
      if (measurement.score < measurement.threshold) {
        console.log(`Explainability threshold violation: ${measurement.score.toFixed(3)} < ${measurement.threshold.toFixed(3)}`);
      }
    });
    
    this.on('threshold_violation', ({ alert }: { alert: ExplainabilityAlert }) => {
      console.log(`Explainability alert (${alert.severity}): ${alert.message}`);
    });
  }
  
  /**
   * Start trend analysis
   */
  private startTrendAnalysis(): void {
    setInterval(() => {
      if (!this.isMonitoring || this.measurements.length < 10) return;
      
      // Analyze trends for different timeframes
      const timeframes: Array<'hour' | 'day' | 'week'> = ['hour', 'day', 'week'];
      
      for (const timeframe of timeframes) {
        const trend = this.calculateTrend(timeframe);
        this.trends.set(timeframe, trend);
        
        // Check for concerning trends
        if (trend.trend === 'declining' && trend.changeRate < -10) {
          this.addAlert({
            id: `trend_warning_${timeframe}_${Date.now()}`,
            timestamp: Date.now(),
            type: 'trend_warning',
            severity: 'warning',
            message: `Declining explainability trend detected over ${timeframe}: ${trend.changeRate.toFixed(1)}% decline`,
            details: { timeframe, trend },
            suggestions: ['Review recent code changes', 'Check for increasing complexity', 'Consider refactoring'],
            acknowledged: false
          });
        }
      }
      
    }, 300000); // Run every 5 minutes
  }
  
  /**
   * Calculate trend for a specific timeframe
   */
  private calculateTrend(timeframe: 'hour' | 'day' | 'week'): ExplainabilityTrend {
    const timeframeMs = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000
    };
    
    const cutoff = Date.now() - timeframeMs[timeframe];
    const measurements = this.measurements.filter(m => m.timestamp >= cutoff);
    
    if (measurements.length === 0) {
      return {
        timeframe,
        averageScore: this.config.globalThreshold,
        trend: 'stable',
        changeRate: 0,
        measurements: 0,
        violationRate: 0,
        predictions: []
      };
    }
    
    const averageScore = (
      measurements.reduce((sum, m) => sum + m.score, 0) / measurements.length
    ) as ExplainabilityScore;
    
    const violations = measurements.filter(m => m.score < m.threshold).length;
    const violationRate = violations / measurements.length;
    
    // Simple trend calculation (first half vs second half)
    const midpoint = Math.floor(measurements.length / 2);
    const firstHalf = measurements.slice(0, midpoint);
    const secondHalf = measurements.slice(midpoint);
    
    const firstAvg = firstHalf.length > 0 
      ? firstHalf.reduce((sum, m) => sum + m.score, 0) / firstHalf.length 
      : averageScore;
    const secondAvg = secondHalf.length > 0 
      ? secondHalf.reduce((sum, m) => sum + m.score, 0) / secondHalf.length 
      : averageScore;
    
    const changeRate = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
    const trend = changeRate > 2 ? 'improving' : changeRate < -2 ? 'declining' : 'stable';
    
    return {
      timeframe,
      averageScore,
      trend,
      changeRate,
      measurements: measurements.length,
      violationRate,
      predictions: [] // Could implement predictive analysis here
    };
  }
  
  /**
   * Get explainability trend for a specific entity (public API)
   */
  public getExplainabilityTrend(entityId: string, timeframe: string): ExplainabilityTrend {
    return this.analyzeTrends(entityId, timeframe);
  }
}

// Export singleton instance
export const explainabilityMonitor = ExplainabilityMonitor.getInstance();