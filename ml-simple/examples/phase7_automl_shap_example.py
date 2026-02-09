"""
Phase 7 Example: AutoML + SHAP Explainability

This example demonstrates:
1. Automatic algorithm selection
2. Model comparison
3. SHAP explainability
4. One-command training
"""
import numpy as np
import pandas as pd
from sklearn.datasets import make_classification, make_regression
from sklearn.model_selection import train_test_split
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from ml_engine.automl import AutoMLSelector, ModelComparison
from ml_engine.explainability import SHAPExplainer
from ml_engine.automl.auto_selector import auto_train_best_model


def example_automl_classification():
    """Example: AutoML for Classification"""
    print("\n" + "=" * 70)
    print("EXAMPLE 1: AutoML for Classification")
    print("=" * 70)
    
    # Generate synthetic classification data
    X, y = make_classification(
        n_samples=1000,
        n_features=20,
        n_informative=15,
        n_redundant=5,
        random_state=42
    )
    
    feature_names = [f"feature_{i}" for i in range(X.shape[1])]
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"\nDataset: {X_train.shape[0]} training samples, {X_test.shape[0]} test samples")
    print(f"Features: {X.shape[1]}")
    
    # AutoML: Automatically select best algorithm
    selector = AutoMLSelector(problem_type='classification', cv_folds=5)
    results = selector.select_best_algorithm(X_train, y_train)
    
    # Train best model on full training data
    best_model = selector.train_best_model(X_train, y_train)
    
    # Print comparison table
    print("\n📊 Algorithm Comparison:")
    comparison_df = selector.get_comparison_dataframe()
    print(comparison_df.to_string(index=False))
    
    # Test accuracy
    test_score = best_model.score(X_test, y_test)
    print(f"\n🎯 Best Model Test Accuracy: {test_score:.4f}")
    
    return best_model, X_train, X_test, y_train, y_test, feature_names


def example_model_comparison():
    """Example: Compare Multiple Models"""
    print("\n" + "=" * 70)
    print("EXAMPLE 2: Model Comparison with Visualizations")
    print("=" * 70)
    
    # Generate data
    X, y = make_classification(n_samples=1000, n_features=20, random_state=42)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train multiple models manually
    from sklearn.linear_model import LogisticRegression
    from sklearn.ensemble import RandomForestClassifier
    from xgboost import XGBClassifier
    
    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'XGBoost': XGBClassifier(n_estimators=100, random_state=42, eval_metric='logloss')
    }
    
    # Train all models
    for name, model in models.items():
        model.fit(X_train, y_train)
    
    # Compare models
    comparison = ModelComparison(problem_type='classification')
    
    for name, model in models.items():
        comparison.add_model(name, model, X_test=X_test, y_test=y_test)
    
    # Get comparison table
    print("\n📊 Model Comparison Table:")
    comp_df = comparison.get_comparison_table()
    print(comp_df.to_string(index=False))
    
    # Generate comparison report with visualizations
    output_dir = comparison.generate_report(output_dir='comparison_reports_phase7')
    
    # Get best model
    best_name, best_model, best_metrics = comparison.get_best_model()
    print(f"\n🏆 Best Model: {best_name}")
    print(f"   Accuracy: {best_metrics['accuracy']:.4f}")
    
    return best_model, X_train, X_test, feature_names


def example_shap_explainability():
    """Example: SHAP Explainability"""
    print("\n" + "=" * 70)
    print("EXAMPLE 3: SHAP Model Explainability")
    print("=" * 70)
    
    # Generate data with meaningful feature names
    X, y = make_classification(
        n_samples=1000,
        n_features=10,
        n_informative=7,
        n_redundant=3,
        random_state=42
    )
    
    feature_names = [
        'age', 'income', 'credit_score', 'debt_ratio', 'employment_years',
        'num_accounts', 'payment_history', 'loan_amount', 'property_value', 'education_level'
    ]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train a model
    from xgboost import XGBClassifier
    model = XGBClassifier(n_estimators=100, random_state=42, eval_metric='logloss')
    model.fit(X_train, y_train)
    
    print(f"\n✓ Model trained with accuracy: {model.score(X_test, y_test):.4f}")
    
    # Create SHAP explainer
    print("\n🔍 Initializing SHAP Explainer...")
    explainer = SHAPExplainer(
        model=model,
        X_train=X_train,
        feature_names=feature_names,
        problem_type='classification'
    )
    
    # Generate comprehensive SHAP report
    explainer.generate_report(
        X=X_test,
        output_dir='shap_reports_phase7',
        max_samples=100,
        sample_explanations=3
    )
    
    # Explain a specific prediction
    print("\n📋 Detailed Explanation for Sample 0:")
    explanation = explainer.explain_prediction(X_test, sample_index=0)
    
    print(f"\nPrediction: {explanation['prediction']}")
    print("\nTop Contributing Features:")
    for feat in explanation['top_features'][:5]:
        direction = "↑" if feat['shap_value'] > 0 else "↓"
        print(f"  {direction} {feat['feature']}: {feat['value']:.2f} (SHAP: {feat['shap_value']:.4f})")
    
    return explainer


def example_one_command_automl():
    """Example: One-Command AutoML"""
    print("\n" + "=" * 70)
    print("EXAMPLE 4: One-Command AutoML")
    print("=" * 70)
    
    # Generate data
    X, y = make_regression(n_samples=1000, n_features=15, noise=10, random_state=42)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"\nDataset: {X_train.shape[0]} training samples, {X.shape[1]} features")
    print("\n🚀 Running AutoML (one command)...")
    
    # ONE COMMAND to automatically select and train best model!
    result = auto_train_best_model(
        X=X_train,
        y=y_train,
        problem_type='regression',
        cv_folds=5,
        time_limit=60  # 60 seconds time limit
    )
    
    # Test the model
    test_score = result['model'].score(X_test, y_test)
    
    print(f"\n✅ AutoML Complete!")
    print(f"   Best Algorithm: {result['algorithm_name']}")
    print(f"   CV R² Score: {result['cv_score']:.4f}")
    print(f"   Test R² Score: {test_score:.4f}")
    
    print("\n📊 All Algorithm Results:")
    print(result['comparison_df'].to_string(index=False))
    
    return result['model']


def example_complete_pipeline():
    """Example: Complete AutoML + SHAP Pipeline"""
    print("\n" + "=" * 70)
    print("EXAMPLE 5: Complete Pipeline (AutoML + SHAP)")
    print("=" * 70)
    
    # Generate data
    X, y = make_classification(
        n_samples=2000,
        n_features=15,
        n_informative=10,
        n_redundant=5,
        random_state=42
    )
    
    feature_names = [f"feature_{i}" for i in range(X.shape[1])]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"\nDataset: {X_train.shape[0]} samples, {X.shape[1]} features")
    
    # Step 1: AutoML
    print("\n📊 Step 1: AutoML - Finding best algorithm...")
    result = auto_train_best_model(X_train, y_train, problem_type='classification')
    model = result['model']
    
    test_accuracy = model.score(X_test, y_test)
    print(f"\n✓ Best Model: {result['algorithm_name']}")
    print(f"✓ Test Accuracy: {test_accuracy:.4f}")
    
    # Step 2: SHAP Explainability
    print("\n🔍 Step 2: SHAP - Explaining predictions...")
    explainer = SHAPExplainer(model, X_train, feature_names, 'classification')
    explainer.generate_report(X_test, output_dir='complete_pipeline_reports', max_samples=100)
    
    print("\n✅ Complete Pipeline Finished!")
    print(f"   Model: {result['algorithm_name']}")
    print(f"   Accuracy: {test_accuracy:.4f}")
    print(f"   Reports: complete_pipeline_reports/")
    
    return model, explainer


if __name__ == '__main__':
    print("\n🚀 PHASE 7: AutoML + SHAP Explainability Examples")
    print("=" * 70)
    
    # Run examples
    try:
        # Example 1: AutoML Classification
        model1, X_train1, X_test1, y_train1, y_test1, features1 = example_automl_classification()
        
        # Example 2: Model Comparison
        # model2, X_train2, X_test2, features2 = example_model_comparison()
        
        # Example 3: SHAP Explainability
        explainer3 = example_shap_explainability()
        
        # Example 4: One-Command AutoML
        model4 = example_one_command_automl()
        
        # Example 5: Complete Pipeline
        model5, explainer5 = example_complete_pipeline()
        
        print("\n" + "=" * 70)
        print("✅ ALL EXAMPLES COMPLETED SUCCESSFULLY!")
        print("=" * 70)
        print("\nGenerated Reports:")
        print("  - comparison_reports_phase7/")
        print("  - shap_reports_phase7/")
        print("  - complete_pipeline_reports/")
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
