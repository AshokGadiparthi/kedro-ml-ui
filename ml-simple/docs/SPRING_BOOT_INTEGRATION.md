# Spring Boot Integration Guide

This guide shows how to integrate the ML Engine with your Spring Boot backend.

## Architecture

```
Angular UI → Spring Boot REST API → ML Engine (Python)
```

## Integration Methods

### Method 1: Process Execution (Recommended for Start)

Spring Boot calls Python ML Engine as a subprocess.

#### Spring Boot Service Example

```java
package com.example.mlplatform.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import java.io.*;
import java.util.Map;

@Service
public class MLEngineService {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String pythonExecutable = "python";  // or "/path/to/venv/bin/python"
    private final String mlEnginePath = "/path/to/ml-simple/src/ml_engine/api_wrapper.py";
    
    /**
     * Train a machine learning model
     */
    public Map<String, Object> trainModel(Map<String, Object> config) throws IOException {
        return executeCommand("train", config);
    }
    
    /**
     * Make predictions with a trained model
     */
    public Map<String, Object> predict(Map<String, Object> config) throws IOException {
        return executeCommand("predict", config);
    }
    
    /**
     * Get model information
     */
    public Map<String, Object> getModelInfo(String modelPath) throws IOException {
        Map<String, Object> config = Map.of("model_path", modelPath);
        return executeCommand("info", config);
    }
    
    /**
     * List all available models
     */
    public Map<String, Object> listModels() throws IOException {
        return executeCommand("list", Map.of());
    }
    
    /**
     * Execute ML Engine command
     */
    private Map<String, Object> executeCommand(String command, Map<String, Object> config) 
            throws IOException {
        
        // Create process
        ProcessBuilder pb = new ProcessBuilder(
            pythonExecutable,
            "-m", "ml_engine.api_wrapper",
            command,
            "--config-json", objectMapper.writeValueAsString(config)
        );
        
        pb.directory(new File("/path/to/ml-simple"));
        pb.redirectErrorStream(true);
        
        // Start process
        Process process = pb.start();
        
        // Read output
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }
        
        // Wait for completion
        try {
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new RuntimeException("ML Engine failed with exit code: " + exitCode);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("ML Engine execution interrupted", e);
        }
        
        // Parse JSON response
        return objectMapper.readValue(output.toString(), Map.class);
    }
}
```

#### Spring Boot REST Controller Example

```java
package com.example.mlplatform.controller;

import com.example.mlplatform.service.MLEngineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ml")
public class MLController {
    
    @Autowired
    private MLEngineService mlEngineService;
    
    /**
     * Train a new model
     * POST /api/ml/train
     */
    @PostMapping("/train")
    public ResponseEntity<Map<String, Object>> trainModel(
            @RequestBody Map<String, Object> request) {
        try {
            Map<String, Object> result = mlEngineService.trainModel(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
    
    /**
     * Make predictions
     * POST /api/ml/predict
     */
    @PostMapping("/predict")
    public ResponseEntity<Map<String, Object>> predict(
            @RequestBody Map<String, Object> request) {
        try {
            Map<String, Object> result = mlEngineService.predict(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
    
    /**
     * Get model information
     * GET /api/ml/models/{modelId}/info
     */
    @GetMapping("/models/{modelId}/info")
    public ResponseEntity<Map<String, Object>> getModelInfo(
            @PathVariable String modelId) {
        try {
            String modelPath = "models/" + modelId + "_model.pkl";
            Map<String, Object> result = mlEngineService.getModelInfo(modelPath);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
    
    /**
     * List all models
     * GET /api/ml/models
     */
    @GetMapping("/models")
    public ResponseEntity<Map<String, Object>> listModels() {
        try {
            Map<String, Object> result = mlEngineService.listModels();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}
```

---

## Method 2: FastAPI REST Bridge (Better for Production)

Run ML Engine as a separate FastAPI service.

### 1. Install FastAPI in ML Engine

```bash
cd ml-simple
pip install fastapi uvicorn
```

### 2. Create FastAPI Server

Create `src/ml_engine/fastapi_server.py`:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from .api_wrapper import MLEngineAPI

app = FastAPI(title="ML Engine API", version="1.0.0")
api = MLEngineAPI()


class TrainRequest(BaseModel):
    data_path: str
    target: str
    problem_type: str = "classification"
    algorithm: str = "xgboost"
    test_size: float = 0.2
    random_state: int = 42
    feature_engineering: bool = False
    scaling: Optional[str] = "standard"
    polynomial_degree: Optional[int] = None
    select_features: Optional[int] = None
    tune_hyperparameters: bool = False
    tuning_method: str = "grid"
    tuning_iterations: int = 50
    evaluate: bool = False
    cv_folds: int = 5
    analyze_features: bool = False


class PredictRequest(BaseModel):
    model_path: str
    data_path: str
    output_path: str = "predictions.csv"


@app.post("/api/train")
async def train(request: TrainRequest):
    """Train a machine learning model"""
    result = api.train(request.dict())
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result["message"])
    return result


@app.post("/api/predict")
async def predict(request: PredictRequest):
    """Make predictions with a trained model"""
    result = api.predict(request.dict())
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result["message"])
    return result


@app.get("/api/models/{model_id}/info")
async def get_model_info(model_id: str):
    """Get information about a model"""
    model_path = f"models/{model_id}_model.pkl"
    result = api.get_model_info(model_path)
    if result["status"] == "error":
        raise HTTPException(status_code=404, detail=result["message"])
    return result


@app.get("/api/models")
async def list_models():
    """List all available models"""
    return api.list_models()


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ML Engine"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 3. Run FastAPI Server

```bash
cd ml-simple
python -m ml_engine.fastapi_server
```

### 4. Spring Boot REST Client

```java
package com.example.mlplatform.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.Map;

@Service
public class MLEngineClient {
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final String mlEngineUrl = "http://localhost:8000/api";
    
    public Map<String, Object> trainModel(Map<String, Object> config) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<Map<String, Object>> request = 
            new HttpEntity<>(config, headers);
        
        ResponseEntity<Map> response = restTemplate.postForEntity(
            mlEngineUrl + "/train",
            request,
            Map.class
        );
        
        return response.getBody();
    }
    
    public Map<String, Object> predict(Map<String, Object> config) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<Map<String, Object>> request = 
            new HttpEntity<>(config, headers);
        
        ResponseEntity<Map> response = restTemplate.postForEntity(
            mlEngineUrl + "/predict",
            request,
            Map.class
        );
        
        return response.getBody();
    }
    
    public Map<String, Object> listModels() {
        ResponseEntity<Map> response = restTemplate.getForEntity(
            mlEngineUrl + "/models",
            Map.class
        );
        
        return response.getBody();
    }
}
```

---

## Example Request/Response

### Train Model Request

```json
{
  "data_path": "/data/customers.csv",
  "target": "churn",
  "problem_type": "classification",
  "algorithm": "xgboost",
  "test_size": 0.2,
  "feature_engineering": true,
  "scaling": "standard",
  "polynomial_degree": 2,
  "tune_hyperparameters": true,
  "tuning_method": "grid",
  "evaluate": true,
  "cv_folds": 5,
  "analyze_features": true
}
```

### Train Model Response

```json
{
  "status": "success",
  "problem_type": "classification",
  "algorithm": "xgboost",
  "model_path": "models/xgboost_model.pkl",
  "feature_names_path": "models/feature_names.pkl",
  "metrics": {
    "train_accuracy": 0.9450,
    "test_accuracy": 0.9325,
    "roc_auc": 0.9687,
    "precision": 0.9123,
    "recall": 0.8987,
    "f1_score": 0.9054
  },
  "training_info": {
    "n_samples": 1000,
    "n_features": 15,
    "train_samples": 800,
    "test_samples": 200
  },
  "feature_importance": [
    {"feature": "credit_score", "importance": 0.3225},
    {"feature": "income", "importance": 0.1640},
    {"feature": "age", "importance": 0.1281}
  ],
  "best_parameters": {
    "n_estimators": 200,
    "max_depth": 5,
    "learning_rate": 0.1
  },
  "best_score": 0.9425,
  "evaluation_reports": [
    {"name": "confusion_matrix.png", "path": "models/evaluation/confusion_matrix.png"},
    {"name": "roc_curve.png", "path": "models/evaluation/roc_curve.png"}
  ]
}
```

### Predict Request

```json
{
  "model_path": "models/xgboost_model.pkl",
  "data_path": "/data/new_customers.csv",
  "output_path": "/data/predictions.csv"
}
```

### Predict Response

```json
{
  "status": "success",
  "predictions_path": "/data/predictions.csv",
  "n_predictions": 100,
  "predictions_sample": [
    {"prediction": 1, "probability_0": 0.12, "probability_1": 0.88},
    {"prediction": 0, "probability_0": 0.89, "probability_1": 0.11}
  ],
  "columns": ["prediction", "probability_0", "probability_1"]
}
```

---

## Deployment Options

### Option 1: Co-located (Development)
- Deploy ML Engine alongside Spring Boot
- Use subprocess execution
- Simple but not scalable

### Option 2: Separate Service (Production)
- Deploy ML Engine as FastAPI microservice
- Spring Boot calls via REST
- Scalable and maintainable
- Can scale ML Engine independently

### Option 3: Kubernetes (Enterprise)
```yaml
# ml-engine-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-engine
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ml-engine
  template:
    metadata:
      labels:
        app: ml-engine
    spec:
      containers:
      - name: ml-engine
        image: your-registry/ml-engine:latest
        ports:
        - containerPort: 8000
        env:
        - name: MODELS_DIR
          value: /models
        volumeMounts:
        - name: models-volume
          mountPath: /models
      volumes:
      - name: models-volume
        persistentVolumeClaim:
          claimName: ml-models-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: ml-engine-service
spec:
  selector:
    app: ml-engine
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP
```

---

## Next Steps

1. **Test the Integration**
   - Use the subprocess method first
   - Verify JSON request/response
   
2. **Add Error Handling**
   - Handle Python errors in Java
   - Add retry logic
   - Add timeout handling

3. **Add Async Processing**
   - Use Spring Async for long-running training
   - Add job queue (RabbitMQ, Kafka)
   - Return job ID immediately

4. **Add File Management**
   - Upload CSV files from Angular
   - Store in shared location
   - Clean up old files

5. **Add Model Registry**
   - Database to track models
   - Version management
   - Metadata storage

6. **Add Monitoring**
   - Log all API calls
   - Track performance
   - Alert on failures
