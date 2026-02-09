"""
API Wrapper for Spring Boot Integration
Provides JSON-based interface for calling ML Engine from Java/Spring Boot
"""
import json
import sys
from pathlib import Path
from typing import Dict, Any, Optional
import pandas as pd
from .train import train_model
from .predict import predict as predict_model


class MLEngineAPI:
    """
    JSON API wrapper for ML Engine
    Designed to be called from Spring Boot backend via subprocess or REST
    """
    
    def __init__(self):
        self.models_dir = Path("models")
        self.models_dir.mkdir(exist_ok=True)
    
    def train(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Train a model based on JSON configuration
        
        Args:
            config: Dictionary with training configuration
                {
                    "data_path": "path/to/data.csv",
                    "target": "target_column",
                    "problem_type": "classification",  # or "regression"
                    "algorithm": "xgboost",
                    "test_size": 0.2,
                    "random_state": 42,
                    "feature_engineering": true,
                    "scaling": "standard",
                    "polynomial_degree": 2,
                    "select_features": null,
                    "tune_hyperparameters": true,
                    "tuning_method": "grid",
                    "tuning_iterations": 50,
                    "evaluate": true,
                    "cv_folds": 5,
                    "analyze_features": true
                }
        
        Returns:
            Dictionary with training results
                {
                    "status": "success",
                    "model_path": "models/xgboost_model.pkl",
                    "metrics": {...},
                    "feature_importance": {...},
                    "evaluation_reports": [...]
                }
        """
        try:
            # Extract parameters
            data_path = config.get("data_path")
            target = config.get("target")
            problem_type = config.get("problem_type", "classification")
            algorithm = config.get("algorithm", "xgboost")
            test_size = config.get("test_size", 0.2)
            random_state = config.get("random_state", 42)
            
            # Feature engineering params
            feature_engineering = config.get("feature_engineering", False)
            scaling = config.get("scaling", "standard")
            polynomial_degree = config.get("polynomial_degree", None)
            select_features = config.get("select_features", None)
            
            # Tuning params
            tune_hyperparameters = config.get("tune_hyperparameters", False)
            tuning_method = config.get("tuning_method", "grid")
            tuning_iterations = config.get("tuning_iterations", 50)
            
            # Evaluation params
            evaluate = config.get("evaluate", False)
            cv_folds = config.get("cv_folds", 5)
            analyze_features = config.get("analyze_features", False)
            
            # Load data
            if not Path(data_path).exists():
                return {
                    "status": "error",
                    "message": f"Data file not found: {data_path}"
                }
            
            data = pd.read_csv(data_path)
            
            # Train model
            result = train_model(
                data=data,
                target=target,
                problem_type=problem_type,
                algorithm=algorithm,
                test_size=test_size,
                random_state=random_state,
                feature_engineering=feature_engineering,
                scaling=scaling if feature_engineering else None,
                polynomial_degree=polynomial_degree if feature_engineering else None,
                select_features=select_features if feature_engineering else None,
                tune_hyperparameters=tune_hyperparameters,
                tuning_method=tuning_method if tune_hyperparameters else None,
                tuning_iterations=tuning_iterations if tune_hyperparameters else None,
                evaluate_model=evaluate,
                cv_folds=cv_folds if evaluate else 5,
                feature_analysis=analyze_features
            )
            
            # Format response
            response = {
                "status": "success",
                "problem_type": problem_type,
                "algorithm": algorithm,
                "model_path": str(result.get("model_path", "")),
                "feature_names_path": str(result.get("feature_names_path", "")),
                "metrics": self._extract_metrics(result, problem_type),
                "training_info": {
                    "n_samples": result.get("n_samples", 0),
                    "n_features": result.get("n_features", 0),
                    "train_samples": result.get("train_samples", 0),
                    "test_samples": result.get("test_samples", 0)
                }
            }
            
            # Add feature importance if available
            if analyze_features and Path("models/reports/feature_importance.csv").exists():
                fi_df = pd.read_csv("models/reports/feature_importance.csv")
                response["feature_importance"] = fi_df.head(10).to_dict(orient="records")
            
            # Add tuning results if available
            if tune_hyperparameters:
                response["best_parameters"] = result.get("best_parameters", {})
                response["best_score"] = result.get("best_score", None)
            
            # Add evaluation reports if available
            if evaluate:
                response["evaluation_reports"] = self._get_evaluation_reports()
            
            return response
            
        except Exception as e:
            return {
                "status": "error",
                "message": str(e),
                "type": type(e).__name__
            }
    
    def predict(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Make predictions using a trained model
        
        Args:
            config: Dictionary with prediction configuration
                {
                    "model_path": "models/xgboost_model.pkl",
                    "data_path": "path/to/new_data.csv",
                    "output_path": "predictions.csv"
                }
        
        Returns:
            Dictionary with prediction results
                {
                    "status": "success",
                    "predictions_path": "predictions.csv",
                    "n_predictions": 100,
                    "predictions": [...] (first 10)
                }
        """
        try:
            model_path = config.get("model_path")
            data_path = config.get("data_path")
            output_path = config.get("output_path", "predictions.csv")
            
            # Validate inputs
            if not Path(model_path).exists():
                return {
                    "status": "error",
                    "message": f"Model file not found: {model_path}"
                }
            
            if not Path(data_path).exists():
                return {
                    "status": "error",
                    "message": f"Data file not found: {data_path}"
                }
            
            # Make predictions
            predictions_df = predict_model(
                model_path=model_path,
                data_path=data_path,
                output_path=output_path
            )
            
            return {
                "status": "success",
                "predictions_path": output_path,
                "n_predictions": len(predictions_df),
                "predictions_sample": predictions_df.head(10).to_dict(orient="records"),
                "columns": list(predictions_df.columns)
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": str(e),
                "type": type(e).__name__
            }
    
    def get_model_info(self, model_path: str) -> Dict[str, Any]:
        """
        Get information about a trained model
        
        Args:
            model_path: Path to model file
        
        Returns:
            Dictionary with model information
        """
        try:
            import joblib
            
            if not Path(model_path).exists():
                return {
                    "status": "error",
                    "message": f"Model file not found: {model_path}"
                }
            
            model = joblib.load(model_path)
            
            info = {
                "status": "success",
                "model_type": type(model).__name__,
                "model_path": model_path,
            }
            
            # Try to get model-specific info
            if hasattr(model, 'n_features_in_'):
                info["n_features"] = model.n_features_in_
            
            if hasattr(model, 'feature_importances_'):
                info["has_feature_importance"] = True
            
            return info
            
        except Exception as e:
            return {
                "status": "error",
                "message": str(e),
                "type": type(e).__name__
            }
    
    def list_models(self) -> Dict[str, Any]:
        """
        List all available trained models
        
        Returns:
            Dictionary with list of models
        """
        try:
            models_path = Path("models")
            if not models_path.exists():
                return {
                    "status": "success",
                    "models": []
                }
            
            models = []
            for model_file in models_path.glob("*.pkl"):
                if "feature_names" not in model_file.name:
                    models.append({
                        "name": model_file.stem,
                        "path": str(model_file),
                        "size_mb": model_file.stat().st_size / (1024 * 1024),
                        "created": model_file.stat().st_mtime
                    })
            
            return {
                "status": "success",
                "models": sorted(models, key=lambda x: x["created"], reverse=True)
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": str(e),
                "type": type(e).__name__
            }
    
    def _extract_metrics(self, result: Dict[str, Any], problem_type: str) -> Dict[str, Any]:
        """Extract metrics from training result"""
        metrics = {}
        
        if problem_type == "classification":
            metrics["train_accuracy"] = result.get("train_accuracy", 0.0)
            metrics["test_accuracy"] = result.get("test_accuracy", 0.0)
            
            # Add more metrics if available
            if "roc_auc" in result:
                metrics["roc_auc"] = result["roc_auc"]
            if "precision" in result:
                metrics["precision"] = result["precision"]
            if "recall" in result:
                metrics["recall"] = result["recall"]
            if "f1_score" in result:
                metrics["f1_score"] = result["f1_score"]
        else:  # regression
            metrics["train_rmse"] = result.get("train_rmse", 0.0)
            metrics["test_rmse"] = result.get("test_rmse", 0.0)
            metrics["train_r2"] = result.get("train_r2", 0.0)
            metrics["test_r2"] = result.get("test_r2", 0.0)
            metrics["train_mae"] = result.get("train_mae", 0.0)
            metrics["test_mae"] = result.get("test_mae", 0.0)
        
        return metrics
    
    def _get_evaluation_reports(self) -> list:
        """Get list of evaluation report files"""
        reports = []
        eval_dir = Path("models/evaluation")
        
        if eval_dir.exists():
            for report_file in eval_dir.glob("*"):
                reports.append({
                    "name": report_file.name,
                    "path": str(report_file),
                    "type": report_file.suffix
                })
        
        return reports


def main():
    """
    Command-line interface for Spring Boot integration
    Reads JSON from stdin or file, executes command, writes JSON to stdout
    """
    import argparse
    
    parser = argparse.ArgumentParser(description="ML Engine API for Spring Boot")
    parser.add_argument("command", choices=["train", "predict", "info", "list"],
                       help="Command to execute")
    parser.add_argument("--config", type=str, help="JSON config file path")
    parser.add_argument("--config-json", type=str, help="JSON config string")
    
    args = parser.parse_args()
    
    # Load configuration
    if args.config:
        with open(args.config, 'r') as f:
            config = json.load(f)
    elif args.config_json:
        config = json.loads(args.config_json)
    else:
        # Read from stdin
        config = json.load(sys.stdin)
    
    # Execute command
    api = MLEngineAPI()
    
    if args.command == "train":
        result = api.train(config)
    elif args.command == "predict":
        result = api.predict(config)
    elif args.command == "info":
        result = api.get_model_info(config.get("model_path", ""))
    elif args.command == "list":
        result = api.list_models()
    else:
        result = {"status": "error", "message": f"Unknown command: {args.command}"}
    
    # Write result to stdout as JSON
    print(json.dumps(result, indent=2))
    
    # Exit with error code if failed
    if result.get("status") == "error":
        sys.exit(1)


if __name__ == "__main__":
    main()
