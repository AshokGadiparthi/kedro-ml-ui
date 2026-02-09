"""
SHAP Explainer
Explains model predictions using SHAP values
"""
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import shap
from typing import Dict, Any, List, Optional, Union
import warnings
warnings.filterwarnings('ignore')
import os


class SHAPExplainer:
    """
    Model explainability using SHAP (SHapley Additive exPlanations)
    Answers: "Why did the model make this prediction?"
    """
    
    def __init__(self, model: Any, X_train: np.ndarray, 
                 feature_names: List[str] = None, problem_type: str = 'classification'):
        """
        Initialize SHAP Explainer
        
        Args:
            model: Trained model
            X_train: Training data (used as background for SHAP)
            feature_names: List of feature names
            problem_type: 'classification' or 'regression'
        """
        self.model = model
        self.X_train = X_train
        self.feature_names = feature_names or [f"Feature_{i}" for i in range(X_train.shape[1])]
        self.problem_type = problem_type
        self.explainer = None
        self.shap_values = None
        
        # Initialize appropriate explainer
        self._initialize_explainer()
    
    def _initialize_explainer(self):
        """Initialize the appropriate SHAP explainer based on model type"""
        model_name = type(self.model).__name__
        
        try:
            # Tree-based models (most common in ML)
            if any(x in model_name for x in ['XGB', 'RandomForest', 'GradientBoosting', 'DecisionTree']):
                self.explainer = shap.TreeExplainer(self.model)
                print(f"✓ Using TreeExplainer for {model_name}")
            
            # Linear models
            elif any(x in model_name for x in ['Linear', 'Logistic', 'Ridge', 'Lasso', 'ElasticNet']):
                # Use a small background dataset for speed
                background = shap.sample(self.X_train, min(100, len(self.X_train)))
                self.explainer = shap.LinearExplainer(self.model, background)
                print(f"✓ Using LinearExplainer for {model_name}")
            
            # Deep learning models
            elif any(x in model_name for x in ['Keras', 'Tensor', 'Torch', 'Neural']):
                background = shap.sample(self.X_train, min(100, len(self.X_train)))
                self.explainer = shap.DeepExplainer(self.model, background)
                print(f"✓ Using DeepExplainer for {model_name}")
            
            # Default: KernelExplainer (model-agnostic but slower)
            else:
                background = shap.sample(self.X_train, min(50, len(self.X_train)))
                self.explainer = shap.KernelExplainer(self.model.predict, background)
                print(f"✓ Using KernelExplainer for {model_name} (model-agnostic)")
        
        except Exception as e:
            print(f"⚠ Error initializing preferred explainer: {e}")
            print(f"⚠ Falling back to KernelExplainer")
            background = shap.sample(self.X_train, min(50, len(self.X_train)))
            self.explainer = shap.KernelExplainer(self.model.predict, background)
    
    def explain(self, X: np.ndarray, max_samples: int = 100) -> Any:
        """
        Calculate SHAP values for dataset
        
        Args:
            X: Data to explain
            max_samples: Maximum samples to explain (for performance)
            
        Returns:
            SHAP values
        """
        # Limit samples for performance
        if len(X) > max_samples:
            print(f"⚠ Limiting explanation to {max_samples} samples (out of {len(X)})")
            X = X[:max_samples]
        
        print(f"🔍 Calculating SHAP values for {len(X)} samples...")
        
        try:
            self.shap_values = self.explainer.shap_values(X)
            print("✓ SHAP values calculated successfully")
            return self.shap_values
        except Exception as e:
            print(f"✗ Error calculating SHAP values: {e}")
            return None
    
    def plot_summary(self, X: np.ndarray = None, output_path: str = None, 
                    max_display: int = 20, plot_type: str = 'dot'):
        """
        Create SHAP summary plot
        
        Args:
            X: Data to explain (if shap_values not already calculated)
            output_path: Path to save plot
            max_display: Maximum features to display
            plot_type: 'dot', 'bar', or 'violin'
        """
        if self.shap_values is None:
            if X is None:
                raise ValueError("Must provide X if SHAP values not already calculated")
            self.explain(X)
        
        plt.figure(figsize=(10, 8))
        
        # Handle multi-class classification
        shap_vals = self.shap_values
        if isinstance(shap_vals, list):
            # For multi-class, use class 1 or average
            if len(shap_vals) == 2:
                shap_vals = shap_vals[1]  # Binary classification
            else:
                shap_vals = np.mean(np.abs(shap_vals), axis=0)  # Multi-class average
        
        # Get the data used for explanation
        X_explain = self.X_train if X is None else X
        if len(X_explain) > len(shap_vals):
            X_explain = X_explain[:len(shap_vals)]
        
        shap.summary_plot(shap_vals, X_explain, 
                         feature_names=self.feature_names,
                         max_display=max_display,
                         plot_type=plot_type,
                         show=False)
        
        plt.title('SHAP Feature Importance Summary', fontsize=14, fontweight='bold', pad=20)
        plt.tight_layout()
        
        if output_path:
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            print(f"✓ SHAP summary plot saved to {output_path}")
        
        plt.close()
    
    def plot_bar(self, X: np.ndarray = None, output_path: str = None, 
                max_display: int = 20):
        """
        Create SHAP bar plot (mean absolute SHAP values)
        
        Args:
            X: Data to explain
            output_path: Path to save plot
            max_display: Maximum features to display
        """
        if self.shap_values is None:
            if X is None:
                raise ValueError("Must provide X if SHAP values not already calculated")
            self.explain(X)
        
        plt.figure(figsize=(10, 8))
        
        # Handle multi-class
        shap_vals = self.shap_values
        if isinstance(shap_vals, list):
            if len(shap_vals) == 2:
                shap_vals = shap_vals[1]
            else:
                shap_vals = np.mean(np.abs(shap_vals), axis=0)
        
        # Calculate mean absolute SHAP values
        mean_abs_shap = np.abs(shap_vals).mean(axis=0)
        
        # Create DataFrame and sort
        df = pd.DataFrame({
            'feature': self.feature_names[:len(mean_abs_shap)],
            'importance': mean_abs_shap
        })
        df = df.sort_values('importance', ascending=True).tail(max_display)
        
        # Plot
        plt.barh(df['feature'], df['importance'], color='steelblue')
        plt.xlabel('Mean |SHAP value|')
        plt.title('Feature Importance (SHAP)', fontsize=14, fontweight='bold')
        plt.grid(axis='x', alpha=0.3)
        plt.tight_layout()
        
        if output_path:
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            print(f"✓ SHAP bar plot saved to {output_path}")
        
        plt.close()
    
    def plot_waterfall(self, X: np.ndarray, sample_index: int = 0, 
                      output_path: str = None):
        """
        Create SHAP waterfall plot for a single prediction
        Shows how each feature contributes to pushing the prediction from base value
        
        Args:
            X: Data to explain
            sample_index: Index of sample to explain
            output_path: Path to save plot
        """
        if self.shap_values is None:
            self.explain(X)
        
        # Handle multi-class
        shap_vals = self.shap_values
        if isinstance(shap_vals, list):
            if len(shap_vals) == 2:
                shap_vals = shap_vals[1]
            else:
                shap_vals = shap_vals[0]  # Use first class for multiclass
        
        plt.figure(figsize=(10, 8))
        
        # Create explanation object for waterfall
        base_value = self.explainer.expected_value
        if isinstance(base_value, np.ndarray):
            base_value = base_value[0]
        
        shap.waterfall_plot(
            shap.Explanation(
                values=shap_vals[sample_index],
                base_values=base_value,
                data=X[sample_index],
                feature_names=self.feature_names
            ),
            show=False
        )
        
        plt.tight_layout()
        
        if output_path:
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            print(f"✓ SHAP waterfall plot saved to {output_path}")
        
        plt.close()
    
    def plot_force(self, X: np.ndarray, sample_index: int = 0, 
                  output_path: str = None):
        """
        Create SHAP force plot for a single prediction
        
        Args:
            X: Data to explain
            sample_index: Index of sample to explain
            output_path: Path to save plot
        """
        if self.shap_values is None:
            self.explain(X)
        
        # Handle multi-class
        shap_vals = self.shap_values
        base_value = self.explainer.expected_value
        
        if isinstance(shap_vals, list):
            if len(shap_vals) == 2:
                shap_vals = shap_vals[1]
                base_value = base_value[1] if isinstance(base_value, np.ndarray) else base_value
            else:
                shap_vals = shap_vals[0]
                base_value = base_value[0] if isinstance(base_value, np.ndarray) else base_value
        
        # Create force plot
        force_plot = shap.force_plot(
            base_value,
            shap_vals[sample_index],
            X[sample_index],
            feature_names=self.feature_names,
            show=False,
            matplotlib=True
        )
        
        if output_path:
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            print(f"✓ SHAP force plot saved to {output_path}")
        
        plt.close()
    
    def plot_dependence(self, feature_name: str, X: np.ndarray = None, 
                       output_path: str = None):
        """
        Create SHAP dependence plot for a specific feature
        Shows how feature values affect predictions
        
        Args:
            feature_name: Name of feature to plot
            X: Data to explain
            output_path: Path to save plot
        """
        if self.shap_values is None:
            if X is None:
                raise ValueError("Must provide X if SHAP values not already calculated")
            self.explain(X)
        
        # Find feature index
        try:
            feature_idx = self.feature_names.index(feature_name)
        except ValueError:
            print(f"✗ Feature '{feature_name}' not found")
            return
        
        plt.figure(figsize=(10, 6))
        
        # Handle multi-class
        shap_vals = self.shap_values
        if isinstance(shap_vals, list):
            if len(shap_vals) == 2:
                shap_vals = shap_vals[1]
            else:
                shap_vals = np.mean(shap_vals, axis=0)
        
        X_explain = self.X_train if X is None else X
        if len(X_explain) > len(shap_vals):
            X_explain = X_explain[:len(shap_vals)]
        
        shap.dependence_plot(
            feature_idx,
            shap_vals,
            X_explain,
            feature_names=self.feature_names,
            show=False
        )
        
        plt.title(f'SHAP Dependence Plot: {feature_name}', fontsize=14, fontweight='bold')
        plt.tight_layout()
        
        if output_path:
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            print(f"✓ SHAP dependence plot saved to {output_path}")
        
        plt.close()
    
    def explain_prediction(self, X: np.ndarray, sample_index: int = 0) -> Dict[str, Any]:
        """
        Get detailed explanation for a single prediction
        
        Args:
            X: Data to explain
            sample_index: Index of sample to explain
            
        Returns:
            Dict with explanation details
        """
        if self.shap_values is None:
            self.explain(X)
        
        # Handle multi-class
        shap_vals = self.shap_values
        if isinstance(shap_vals, list):
            if len(shap_vals) == 2:
                shap_vals = shap_vals[1]
            else:
                shap_vals = shap_vals[0]
        
        # Get SHAP values for this sample
        sample_shap = shap_vals[sample_index]
        sample_features = X[sample_index]
        
        # Create explanation DataFrame
        explanation_df = pd.DataFrame({
            'feature': self.feature_names[:len(sample_shap)],
            'value': sample_features,
            'shap_value': sample_shap,
            'abs_shap': np.abs(sample_shap)
        })
        
        # Sort by absolute SHAP value
        explanation_df = explanation_df.sort_values('abs_shap', ascending=False)
        
        return {
            'sample_index': sample_index,
            'prediction': self.model.predict([sample_features])[0],
            'top_features': explanation_df.head(10).to_dict('records'),
            'explanation_df': explanation_df
        }
    
    def generate_report(self, X: np.ndarray, output_dir: str = 'shap_reports',
                       max_samples: int = 100, sample_explanations: int = 3):
        """
        Generate comprehensive SHAP explanation report
        
        Args:
            X: Data to explain
            output_dir: Directory to save reports
            max_samples: Maximum samples to explain
            sample_explanations: Number of individual samples to explain in detail
        """
        os.makedirs(output_dir, exist_ok=True)
        
        print(f"\n📊 Generating SHAP Explanation Report...")
        print("=" * 70)
        
        # Calculate SHAP values
        self.explain(X, max_samples=max_samples)
        
        # Generate plots
        print("\n1. Creating summary plot...")
        self.plot_summary(X, output_path=os.path.join(output_dir, 'shap_summary.png'))
        
        print("2. Creating bar plot...")
        self.plot_bar(X, output_path=os.path.join(output_dir, 'shap_bar.png'))
        
        # Individual sample explanations
        print(f"3. Creating {sample_explanations} individual explanations...")
        for i in range(min(sample_explanations, len(X))):
            self.plot_waterfall(X, sample_index=i, 
                              output_path=os.path.join(output_dir, f'shap_waterfall_sample_{i}.png'))
        
        # Generate text report
        report_path = os.path.join(output_dir, 'shap_report.txt')
        with open(report_path, 'w') as f:
            f.write("=" * 70 + "\n")
            f.write("SHAP EXPLANATION REPORT\n")
            f.write("=" * 70 + "\n\n")
            
            f.write(f"Model Type: {type(self.model).__name__}\n")
            f.write(f"Problem Type: {self.problem_type}\n")
            f.write(f"Samples Explained: {len(X)}\n")
            f.write(f"Features: {len(self.feature_names)}\n\n")
            
            # Top features by mean absolute SHAP
            shap_vals = self.shap_values
            if isinstance(shap_vals, list):
                shap_vals = shap_vals[1] if len(shap_vals) == 2 else np.mean(np.abs(shap_vals), axis=0)
            
            mean_abs_shap = np.abs(shap_vals).mean(axis=0)
            top_indices = np.argsort(mean_abs_shap)[::-1][:10]
            
            f.write("-" * 70 + "\n")
            f.write("TOP 10 MOST IMPORTANT FEATURES\n")
            f.write("-" * 70 + "\n\n")
            
            for rank, idx in enumerate(top_indices, 1):
                f.write(f"{rank}. {self.feature_names[idx]}: {mean_abs_shap[idx]:.4f}\n")
            
            f.write("\n" + "=" * 70 + "\n")
        
        print(f"✓ Text report saved to {report_path}")
        print(f"\n✅ SHAP report generated successfully in: {output_dir}")
        print("=" * 70)
        
        return output_dir
