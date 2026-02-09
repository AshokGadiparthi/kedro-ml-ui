"""
Model Comparison Tool
Compare multiple trained models side-by-side
"""
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, Any, List
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import os


class ModelComparison:
    """
    Compare multiple models on the same dataset
    Generate comparison visualizations and reports
    """
    
    def __init__(self, problem_type: str = 'classification'):
        """
        Initialize Model Comparison
        
        Args:
            problem_type: 'classification' or 'regression'
        """
        self.problem_type = problem_type
        self.models = {}
        self.results = []
        
    def add_model(self, name: str, model: Any, X_test: np.ndarray = None, 
                  y_test: np.ndarray = None, y_pred: np.ndarray = None):
        """
        Add a model for comparison
        
        Args:
            name: Model name/identifier
            model: Trained model object
            X_test: Test features (optional if y_pred provided)
            y_test: True labels
            y_pred: Predictions (optional, will be generated if not provided)
        """
        if y_pred is None and X_test is not None:
            y_pred = model.predict(X_test)
        
        self.models[name] = {
            'model': model,
            'y_test': y_test,
            'y_pred': y_pred,
            'X_test': X_test
        }
        
        # Calculate metrics
        if y_test is not None and y_pred is not None:
            metrics = self._calculate_metrics(y_test, y_pred, model, X_test)
            metrics['name'] = name
            self.results.append(metrics)
    
    def _calculate_metrics(self, y_test: np.ndarray, y_pred: np.ndarray, 
                          model: Any, X_test: np.ndarray = None) -> Dict[str, float]:
        """Calculate metrics for a model"""
        metrics = {}
        
        if self.problem_type == 'classification':
            metrics['accuracy'] = accuracy_score(y_test, y_pred)
            
            # Handle binary vs multiclass
            try:
                metrics['precision'] = precision_score(y_test, y_pred, average='weighted', zero_division=0)
                metrics['recall'] = recall_score(y_test, y_pred, average='weighted', zero_division=0)
                metrics['f1_score'] = f1_score(y_test, y_pred, average='weighted', zero_division=0)
            except:
                metrics['precision'] = 0
                metrics['recall'] = 0
                metrics['f1_score'] = 0
            
            # ROC AUC (only for binary or if predict_proba available)
            try:
                if hasattr(model, 'predict_proba') and X_test is not None:
                    y_proba = model.predict_proba(X_test)
                    if y_proba.shape[1] == 2:  # Binary
                        metrics['roc_auc'] = roc_auc_score(y_test, y_proba[:, 1])
                    else:  # Multiclass
                        metrics['roc_auc'] = roc_auc_score(y_test, y_proba, 
                                                          multi_class='ovr', average='weighted')
                else:
                    metrics['roc_auc'] = 0
            except:
                metrics['roc_auc'] = 0
                
        else:  # regression
            metrics['rmse'] = np.sqrt(mean_squared_error(y_test, y_pred))
            metrics['mae'] = mean_absolute_error(y_test, y_pred)
            metrics['r2'] = r2_score(y_test, y_pred)
            metrics['mse'] = mean_squared_error(y_test, y_pred)
        
        return metrics
    
    def get_comparison_table(self) -> pd.DataFrame:
        """Get comparison results as DataFrame"""
        if not self.results:
            return pd.DataFrame()
        
        df = pd.DataFrame(self.results)
        
        # Sort by primary metric
        if self.problem_type == 'classification':
            df = df.sort_values('accuracy', ascending=False)
        else:
            df = df.sort_values('r2', ascending=False)
        
        df['rank'] = range(1, len(df) + 1)
        
        # Reorder columns
        cols = ['rank', 'name'] + [col for col in df.columns if col not in ['rank', 'name']]
        return df[cols]
    
    def plot_comparison(self, output_path: str = None, figsize: tuple = (12, 6)):
        """
        Create comparison visualization
        
        Args:
            output_path: Path to save plot (optional)
            figsize: Figure size
        """
        if not self.results:
            print("No models to compare")
            return
        
        df = pd.DataFrame(self.results)
        
        if self.problem_type == 'classification':
            # Classification metrics comparison
            fig, axes = plt.subplots(1, 2, figsize=figsize)
            
            # Plot 1: Bar chart of main metrics
            metrics_to_plot = ['accuracy', 'precision', 'recall', 'f1_score']
            available_metrics = [m for m in metrics_to_plot if m in df.columns]
            
            df_plot = df[['name'] + available_metrics].set_index('name')
            df_plot.plot(kind='bar', ax=axes[0])
            axes[0].set_title('Classification Metrics Comparison', fontsize=12, fontweight='bold')
            axes[0].set_ylabel('Score')
            axes[0].set_xlabel('Model')
            axes[0].legend(loc='lower right')
            axes[0].set_ylim([0, 1.1])
            axes[0].grid(axis='y', alpha=0.3)
            plt.setp(axes[0].xaxis.get_majorticklabels(), rotation=45, ha='right')
            
            # Plot 2: Accuracy ranking
            df_sorted = df.sort_values('accuracy', ascending=True)
            axes[1].barh(df_sorted['name'], df_sorted['accuracy'], color='steelblue')
            axes[1].set_xlabel('Accuracy')
            axes[1].set_title('Model Accuracy Ranking', fontsize=12, fontweight='bold')
            axes[1].set_xlim([0, 1.1])
            axes[1].grid(axis='x', alpha=0.3)
            
            # Add value labels
            for i, (idx, row) in enumerate(df_sorted.iterrows()):
                axes[1].text(row['accuracy'] + 0.02, i, f"{row['accuracy']:.4f}", 
                           va='center', fontsize=9)
            
        else:  # regression
            # Regression metrics comparison
            fig, axes = plt.subplots(1, 2, figsize=figsize)
            
            # Plot 1: Bar chart of RMSE and MAE
            metrics_to_plot = ['rmse', 'mae']
            available_metrics = [m for m in metrics_to_plot if m in df.columns]
            
            df_plot = df[['name'] + available_metrics].set_index('name')
            df_plot.plot(kind='bar', ax=axes[0])
            axes[0].set_title('Error Metrics Comparison (Lower is Better)', 
                            fontsize=12, fontweight='bold')
            axes[0].set_ylabel('Error')
            axes[0].set_xlabel('Model')
            axes[0].legend(loc='upper right')
            axes[0].grid(axis='y', alpha=0.3)
            plt.setp(axes[0].xaxis.get_majorticklabels(), rotation=45, ha='right')
            
            # Plot 2: R² ranking
            df_sorted = df.sort_values('r2', ascending=True)
            axes[1].barh(df_sorted['name'], df_sorted['r2'], color='green')
            axes[1].set_xlabel('R² Score')
            axes[1].set_title('Model R² Ranking (Higher is Better)', 
                            fontsize=12, fontweight='bold')
            axes[1].grid(axis='x', alpha=0.3)
            
            # Add value labels
            for i, (idx, row) in enumerate(df_sorted.iterrows()):
                axes[1].text(row['r2'] + 0.02, i, f"{row['r2']:.4f}", 
                           va='center', fontsize=9)
        
        plt.tight_layout()
        
        if output_path:
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            print(f"✓ Comparison plot saved to {output_path}")
        
        plt.close()
        
        return fig
    
    def plot_metric_heatmap(self, output_path: str = None, figsize: tuple = (10, 6)):
        """
        Create heatmap of all metrics across models
        
        Args:
            output_path: Path to save plot (optional)
            figsize: Figure size
        """
        if not self.results:
            print("No models to compare")
            return
        
        df = pd.DataFrame(self.results)
        
        # Select numeric columns only
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        df_metrics = df[['name'] + list(numeric_cols)]
        df_metrics = df_metrics.set_index('name')
        
        # Normalize metrics to 0-1 scale for better visualization
        df_normalized = (df_metrics - df_metrics.min()) / (df_metrics.max() - df_metrics.min())
        
        # Create heatmap
        fig, ax = plt.subplots(figsize=figsize)
        sns.heatmap(df_normalized.T, annot=True, fmt='.3f', cmap='RdYlGn', 
                   ax=ax, cbar_kws={'label': 'Normalized Score'})
        ax.set_title('Model Performance Heatmap (Normalized)', fontsize=12, fontweight='bold')
        ax.set_xlabel('Model')
        ax.set_ylabel('Metric')
        
        plt.tight_layout()
        
        if output_path:
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            print(f"✓ Heatmap saved to {output_path}")
        
        plt.close()
        
        return fig
    
    def generate_report(self, output_dir: str = 'comparison_reports'):
        """
        Generate complete comparison report with tables and plots
        
        Args:
            output_dir: Directory to save report files
        """
        os.makedirs(output_dir, exist_ok=True)
        
        # Get comparison table
        df = self.get_comparison_table()
        
        # Save table to CSV
        table_path = os.path.join(output_dir, 'comparison_table.csv')
        df.to_csv(table_path, index=False)
        print(f"✓ Comparison table saved to {table_path}")
        
        # Generate plots
        comparison_plot_path = os.path.join(output_dir, 'metrics_comparison.png')
        self.plot_comparison(output_path=comparison_plot_path)
        
        heatmap_path = os.path.join(output_dir, 'metrics_heatmap.png')
        self.plot_metric_heatmap(output_path=heatmap_path)
        
        # Generate summary text report
        report_path = os.path.join(output_dir, 'comparison_report.txt')
        with open(report_path, 'w') as f:
            f.write("=" * 70 + "\n")
            f.write("MODEL COMPARISON REPORT\n")
            f.write("=" * 70 + "\n\n")
            
            f.write(f"Problem Type: {self.problem_type.capitalize()}\n")
            f.write(f"Models Compared: {len(self.models)}\n\n")
            
            f.write("-" * 70 + "\n")
            f.write("RANKING\n")
            f.write("-" * 70 + "\n\n")
            
            f.write(df.to_string(index=False))
            f.write("\n\n")
            
            f.write("-" * 70 + "\n")
            f.write("BEST MODEL\n")
            f.write("-" * 70 + "\n\n")
            
            best_model = df.iloc[0]
            f.write(f"Best Model: {best_model['name']}\n")
            
            if self.problem_type == 'classification':
                f.write(f"Accuracy: {best_model['accuracy']:.4f}\n")
                if 'roc_auc' in best_model and best_model['roc_auc'] > 0:
                    f.write(f"ROC AUC: {best_model['roc_auc']:.4f}\n")
            else:
                f.write(f"R² Score: {best_model['r2']:.4f}\n")
                f.write(f"RMSE: {best_model['rmse']:.4f}\n")
            
            f.write("\n" + "=" * 70 + "\n")
        
        print(f"✓ Text report saved to {report_path}")
        print(f"\n📊 Complete comparison report generated in: {output_dir}")
        
        return output_dir
    
    def get_best_model(self) -> tuple:
        """
        Get the best performing model
        
        Returns:
            Tuple of (model_name, model_object, metrics_dict)
        """
        if not self.results:
            return None, None, None
        
        df = self.get_comparison_table()
        best_row = df.iloc[0]
        best_name = best_row['name']
        best_model = self.models[best_name]['model']
        best_metrics = best_row.to_dict()
        
        return best_name, best_model, best_metrics
