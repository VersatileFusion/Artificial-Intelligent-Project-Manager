import { Document, Model } from 'mongoose';

// User Types
export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'manager' | 'admin';
  department?: string;
  position?: string;
  isActive: boolean;
  lastLogin?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Document methods
  isModified(path?: string): boolean;
  save(): Promise<IUser>;
  toObject(): Record<string, any>;
  
  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generatePasswordResetToken(): Promise<string>;
  hasRole(role: string): boolean;
  hasAnyRole(roles: string[]): boolean;
  updateLastLogin(): Promise<void>;
  getPublicProfile(): Record<string, any>;
}

export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

// Task Types
export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  estimatedTime: number;
  actualTime?: number;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  dependencies?: string[];
  aiSuggestions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Model Version Types
export interface IModelVersion extends Document {
  name: string;
  version: string;
  modelType: 'task-time-prediction' | 'suggestion-generation' | 'dependency-analysis';
  filePath: string;
  architecture?: Record<string, any>;
  hyperparameters?: Record<string, any>;
  trainingMetrics?: {
    accuracy?: number;
    loss?: number;
    validationAccuracy?: number;
    validationLoss?: number;
  };
  trainingDataset?: {
    name?: string;
    size?: number;
    description?: string;
  };
  isActive: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  activate(): Promise<IModelVersion>;
}

export interface IModelVersionModel extends Model<IModelVersion> {
  getActiveModel(modelType: string): Promise<IModelVersion | null>;
  compareVersions(modelType: string, metricName?: string): Promise<Array<Record<string, any>>>;
}

// Training Data Types
export interface ITrainingData extends Document {
  dataType: 'task-time-prediction' | 'suggestion-generation' | 'dependency-analysis';
  features: any;
  labels: any;
  taskId?: string;
  metadata?: Record<string, any>;
  isValidated: boolean;
  validatedBy?: string;
  datasetPartition: 'training' | 'validation' | 'test';
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  validate(userId: string): Promise<ITrainingData>;
}

export interface ITrainingDataModel extends Model<ITrainingData> {
  getDataset(dataType: string, partition?: string, limit?: number): Promise<{
    features: any[];
    labels: any[];
    count: number;
  }>;
  getDataCounts(): Promise<Array<{
    dataType: string;
    partition: string;
    isValidated: boolean;
    count: number;
  }>>;
}

// A/B Test Types
export interface IABTest extends Document {
  name: string;
  description?: string;
  modelType: 'task-time-prediction' | 'suggestion-generation' | 'dependency-analysis';
  modelA: string;
  modelB: string;
  trafficSplitRatio: number;
  metrics: string[];
  results?: {
    modelA?: Record<string, any>;
    modelB?: Record<string, any>;
  };
  status: 'created' | 'running' | 'completed' | 'stopped';
  startDate?: Date;
  endDate?: Date;
  winner?: 'A' | 'B' | 'none';
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  start(): Promise<IABTest>;
  stop(): Promise<IABTest>;
  complete(winnerModel: 'A' | 'B' | 'none'): Promise<IABTest>;
  updateResults(modelKey: 'modelA' | 'modelB', results: Record<string, any>): Promise<IABTest>;
}

export interface IABTestModel extends Model<IABTest> {
  getActiveTest(modelType: string): Promise<IABTest | null>;
  getModelForRequest(modelType: string, requestId: number): Promise<IModelVersion | null>;
} 