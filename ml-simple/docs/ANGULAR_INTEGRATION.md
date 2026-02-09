# Angular Integration Guide

This guide shows how to integrate your Angular UI with the Spring Boot + ML Engine backend.

## Architecture

```
┌─────────────────────────────────────────┐
│         Angular Frontend                │
│  - Dashboard                            │
│  - Data Management                      │
│  - Model Training                       │
│  - Model Evaluation                     │
│  - Deployment                           │
│  - Predictions                          │
│  - Monitoring                           │
└───────────┬─────────────────────────────┘
            │ HTTP REST
            ↓
┌─────────────────────────────────────────┐
│      Spring Boot Backend API            │
│  - /api/ml/train                        │
│  - /api/ml/predict                      │
│  - /api/ml/models                       │
│  - /api/ml/evaluate                     │
└───────────┬─────────────────────────────┘
            │ Python subprocess / REST
            ↓
┌─────────────────────────────────────────┐
│         ML Engine (Python)              │
└─────────────────────────────────────────┘
```

---

## Angular Service Example

### ml-engine.service.ts

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TrainRequest {
  dataPath: string;
  target: string;
  problemType: 'classification' | 'regression';
  algorithm: string;
  testSize?: number;
  randomState?: number;
  featureEngineering?: boolean;
  scaling?: 'standard' | 'minmax' | 'robust' | 'none';
  polynomialDegree?: number;
  selectFeatures?: number;
  tuneHyperparameters?: boolean;
  tuningMethod?: 'grid' | 'random';
  tuningIterations?: number;
  evaluate?: boolean;
  cvFolds?: number;
  analyzeFeatures?: boolean;
}

export interface TrainResponse {
  status: 'success' | 'error';
  problemType?: string;
  algorithm?: string;
  modelPath?: string;
  metrics?: {
    train_accuracy?: number;
    test_accuracy?: number;
    train_rmse?: number;
    test_rmse?: number;
    train_r2?: number;
    test_r2?: number;
    roc_auc?: number;
  };
  trainingInfo?: {
    n_samples: number;
    n_features: number;
    train_samples: number;
    test_samples: number;
  };
  featureImportance?: Array<{
    feature: string;
    importance: number;
  }>;
  bestParameters?: any;
  evaluationReports?: Array<{
    name: string;
    path: string;
  }>;
  message?: string;
}

export interface PredictRequest {
  modelPath: string;
  dataPath: string;
  outputPath?: string;
}

export interface PredictResponse {
  status: 'success' | 'error';
  predictionsPath?: string;
  nPredictions?: number;
  predictionsSample?: any[];
  message?: string;
}

export interface Model {
  name: string;
  path: string;
  size_mb: number;
  created: number;
}

export interface ModelsResponse {
  status: 'success' | 'error';
  models?: Model[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MLEngineService {
  
  private apiUrl = 'http://localhost:8080/api/ml';  // Spring Boot URL
  
  constructor(private http: HttpClient) {}
  
  /**
   * Train a new machine learning model
   */
  trainModel(request: TrainRequest): Observable<TrainResponse> {
    return this.http.post<TrainResponse>(`${this.apiUrl}/train`, request);
  }
  
  /**
   * Make predictions with a trained model
   */
  predict(request: PredictRequest): Observable<PredictResponse> {
    return this.http.post<PredictResponse>(`${this.apiUrl}/predict`, request);
  }
  
  /**
   * Get list of all trained models
   */
  listModels(): Observable<ModelsResponse> {
    return this.http.get<ModelsResponse>(`${this.apiUrl}/models`);
  }
  
  /**
   * Get information about a specific model
   */
  getModelInfo(modelId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/models/${modelId}/info`);
  }
  
  /**
   * Delete a model
   */
  deleteModel(modelId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/models/${modelId}`);
  }
}
```

---

## Component Examples

### 1. Model Training Component

```typescript
// model-training.component.ts
import { Component, OnInit } from '@angular/core';
import { MLEngineService, TrainRequest } from '../services/ml-engine.service';

@Component({
  selector: 'app-model-training',
  templateUrl: './model-training.component.html'
})
export class ModelTrainingComponent implements OnInit {
  
  trainingConfig: TrainRequest = {
    dataPath: '',
    target: '',
    problemType: 'classification',
    algorithm: 'xgboost',
    testSize: 0.2,
    randomState: 42,
    featureEngineering: true,
    scaling: 'standard',
    polynomialDegree: 2,
    tuneHyperparameters: false,
    evaluate: true,
    cvFolds: 5,
    analyzeFeatures: true
  };
  
  algorithms = {
    classification: [
      { value: 'logistic', label: 'Logistic Regression' },
      { value: 'svm', label: 'Support Vector Machine' },
      { value: 'random_forest', label: 'Random Forest' },
      { value: 'gradient_boosting', label: 'Gradient Boosting' },
      { value: 'xgboost', label: 'XGBoost (Recommended)' }
    ],
    regression: [
      { value: 'linear', label: 'Linear Regression' },
      { value: 'ridge', label: 'Ridge Regression' },
      { value: 'lasso', label: 'Lasso Regression' },
      { value: 'random_forest_reg', label: 'Random Forest Regressor' },
      { value: 'xgboost_reg', label: 'XGBoost Regressor (Recommended)' }
    ]
  };
  
  isTraining = false;
  trainingResult: any = null;
  error: string | null = null;
  
  constructor(private mlService: MLEngineService) {}
  
  ngOnInit() {}
  
  onProblemTypeChange() {
    // Reset algorithm when problem type changes
    if (this.trainingConfig.problemType === 'classification') {
      this.trainingConfig.algorithm = 'xgboost';
    } else {
      this.trainingConfig.algorithm = 'xgboost_reg';
    }
  }
  
  trainModel() {
    this.isTraining = true;
    this.error = null;
    this.trainingResult = null;
    
    this.mlService.trainModel(this.trainingConfig).subscribe({
      next: (response) => {
        this.isTraining = false;
        if (response.status === 'success') {
          this.trainingResult = response;
        } else {
          this.error = response.message || 'Training failed';
        }
      },
      error: (err) => {
        this.isTraining = false;
        this.error = err.error?.message || 'An error occurred during training';
      }
    });
  }
}
```

```html
<!-- model-training.component.html -->
<div class="training-container">
  <h2>Train Machine Learning Model</h2>
  
  <div class="training-form">
    <!-- Data Configuration -->
    <div class="form-group">
      <label>Data File Path</label>
      <input type="text" [(ngModel)]="trainingConfig.dataPath" 
             placeholder="/data/customers.csv">
    </div>
    
    <div class="form-group">
      <label>Target Column</label>
      <input type="text" [(ngModel)]="trainingConfig.target" 
             placeholder="e.g., churn">
    </div>
    
    <!-- Problem Type -->
    <div class="form-group">
      <label>Problem Type</label>
      <select [(ngModel)]="trainingConfig.problemType" 
              (change)="onProblemTypeChange()">
        <option value="classification">Classification</option>
        <option value="regression">Regression</option>
      </select>
    </div>
    
    <!-- Algorithm Selection -->
    <div class="form-group">
      <label>Algorithm</label>
      <select [(ngModel)]="trainingConfig.algorithm">
        <option *ngFor="let algo of algorithms[trainingConfig.problemType]" 
                [value]="algo.value">
          {{ algo.label }}
        </option>
      </select>
    </div>
    
    <!-- Advanced Options -->
    <div class="advanced-options">
      <h3>Advanced Options</h3>
      
      <div class="form-group">
        <label>
          <input type="checkbox" [(ngModel)]="trainingConfig.featureEngineering">
          Enable Feature Engineering
        </label>
      </div>
      
      <div class="form-group" *ngIf="trainingConfig.featureEngineering">
        <label>Feature Scaling</label>
        <select [(ngModel)]="trainingConfig.scaling">
          <option value="standard">Standard Scaler</option>
          <option value="minmax">MinMax Scaler</option>
          <option value="robust">Robust Scaler</option>
          <option value="none">None</option>
        </select>
      </div>
      
      <div class="form-group" *ngIf="trainingConfig.featureEngineering">
        <label>Polynomial Degree</label>
        <input type="number" [(ngModel)]="trainingConfig.polynomialDegree" 
               min="1" max="3">
      </div>
      
      <div class="form-group">
        <label>
          <input type="checkbox" [(ngModel)]="trainingConfig.tuneHyperparameters">
          Tune Hyperparameters
        </label>
      </div>
      
      <div class="form-group" *ngIf="trainingConfig.tuneHyperparameters">
        <label>Tuning Method</label>
        <select [(ngModel)]="trainingConfig.tuningMethod">
          <option value="grid">Grid Search</option>
          <option value="random">Random Search</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>
          <input type="checkbox" [(ngModel)]="trainingConfig.evaluate">
          Run Comprehensive Evaluation
        </label>
      </div>
      
      <div class="form-group">
        <label>
          <input type="checkbox" [(ngModel)]="trainingConfig.analyzeFeatures">
          Analyze Feature Importance
        </label>
      </div>
    </div>
    
    <!-- Train Button -->
    <button (click)="trainModel()" 
            [disabled]="isTraining || !trainingConfig.dataPath || !trainingConfig.target"
            class="btn-primary">
      <span *ngIf="!isTraining">Train Model</span>
      <span *ngIf="isTraining">Training... <i class="spinner"></i></span>
    </button>
  </div>
  
  <!-- Error Display -->
  <div class="error-message" *ngIf="error">
    <h3>Error</h3>
    <p>{{ error }}</p>
  </div>
  
  <!-- Results Display -->
  <div class="training-results" *ngIf="trainingResult">
    <h3>Training Completed Successfully!</h3>
    
    <div class="metrics-grid">
      <!-- Metrics -->
      <div class="metric-card">
        <h4>Model Information</h4>
        <p><strong>Algorithm:</strong> {{ trainingResult.algorithm }}</p>
        <p><strong>Model Path:</strong> {{ trainingResult.modelPath }}</p>
      </div>
      
      <div class="metric-card" *ngIf="trainingConfig.problemType === 'classification'">
        <h4>Classification Metrics</h4>
        <p><strong>Train Accuracy:</strong> {{ (trainingResult.metrics.train_accuracy * 100).toFixed(2) }}%</p>
        <p><strong>Test Accuracy:</strong> {{ (trainingResult.metrics.test_accuracy * 100).toFixed(2) }}%</p>
        <p *ngIf="trainingResult.metrics.roc_auc">
          <strong>ROC AUC:</strong> {{ (trainingResult.metrics.roc_auc * 100).toFixed(2) }}%
        </p>
      </div>
      
      <div class="metric-card" *ngIf="trainingConfig.problemType === 'regression'">
        <h4>Regression Metrics</h4>
        <p><strong>Test RMSE:</strong> {{ trainingResult.metrics.test_rmse?.toFixed(2) }}</p>
        <p><strong>Test R²:</strong> {{ trainingResult.metrics.test_r2?.toFixed(4) }}</p>
        <p><strong>Test MAE:</strong> {{ trainingResult.metrics.test_mae?.toFixed(2) }}</p>
      </div>
      
      <div class="metric-card">
        <h4>Training Information</h4>
        <p><strong>Total Samples:</strong> {{ trainingResult.trainingInfo.n_samples }}</p>
        <p><strong>Features:</strong> {{ trainingResult.trainingInfo.n_features }}</p>
        <p><strong>Train/Test Split:</strong> 
           {{ trainingResult.trainingInfo.train_samples }}/{{ trainingResult.trainingInfo.test_samples }}
        </p>
      </div>
    </div>
    
    <!-- Feature Importance -->
    <div class="feature-importance" *ngIf="trainingResult.featureImportance">
      <h4>Top Features</h4>
      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th>Importance</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let feat of trainingResult.featureImportance">
            <td>{{ feat.feature }}</td>
            <td>{{ (feat.importance * 100).toFixed(2) }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Evaluation Reports -->
    <div class="evaluation-reports" *ngIf="trainingResult.evaluationReports">
      <h4>Evaluation Reports</h4>
      <div class="report-list">
        <a *ngFor="let report of trainingResult.evaluationReports" 
           [href]="report.path" target="_blank">
          {{ report.name }}
        </a>
      </div>
    </div>
  </div>
</div>
```

---

### 2. Predictions Component

```typescript
// predictions.component.ts
import { Component } from '@angular/core';
import { MLEngineService, PredictRequest } from '../services/ml-engine.service';

@Component({
  selector: 'app-predictions',
  templateUrl: './predictions.component.html'
})
export class PredictionsComponent {
  
  predictConfig: PredictRequest = {
    modelPath: '',
    dataPath: '',
    outputPath: 'predictions.csv'
  };
  
  models: any[] = [];
  isPredicting = false;
  predictionResult: any = null;
  error: string | null = null;
  
  constructor(private mlService: MLEngineService) {
    this.loadModels();
  }
  
  loadModels() {
    this.mlService.listModels().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.models) {
          this.models = response.models;
        }
      },
      error: (err) => {
        console.error('Failed to load models', err);
      }
    });
  }
  
  predict() {
    this.isPredicting = true;
    this.error = null;
    this.predictionResult = null;
    
    this.mlService.predict(this.predictConfig).subscribe({
      next: (response) => {
        this.isPredicting = false;
        if (response.status === 'success') {
          this.predictionResult = response;
        } else {
          this.error = response.message || 'Prediction failed';
        }
      },
      error: (err) => {
        this.isPredicting = false;
        this.error = err.error?.message || 'An error occurred during prediction';
      }
    });
  }
}
```

---

## Complete Integration Checklist

### Backend (Spring Boot)
- [ ] Create `MLEngineService` for subprocess execution
- [ ] Create `MLController` REST endpoints
- [ ] Add error handling and logging
- [ ] Add async processing for long training jobs
- [ ] Add file upload/management
- [ ] Add model registry database
- [ ] Add authentication & authorization

### Frontend (Angular)
- [ ] Create `MLEngineService` for API calls
- [ ] Create training component
- [ ] Create predictions component
- [ ] Create model management component
- [ ] Create dashboard with metrics
- [ ] Add file upload component
- [ ] Add visualization components
- [ ] Add error handling & loading states

### ML Engine (Python)
- [x] Create API wrapper (`api_wrapper.py`)
- [ ] Add FastAPI server (optional)
- [ ] Add model registry support
- [ ] Add logging & monitoring
- [ ] Add data validation
- [ ] Package as Docker container

---

## Next Steps

1. **Complete UI Components**
   - Dashboard with real-time metrics
   - Data management (upload, preview)
   - Model comparison
   - Deployment management

2. **Add Missing Features**
   - File upload handling
   - Job queue for async training
   - Model versioning
   - A/B testing support

3. **Production Readiness**
   - Docker containerization
   - Kubernetes deployment
   - Monitoring & logging
   - Security & authentication
