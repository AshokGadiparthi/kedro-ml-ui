"""
AutoML Algorithm Selector
Automatically selects and trains the best algorithm for your data
"""
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple, Optional
from sklearn.model_selection import cross_val_score
import time
import warnings
warnings.filterwarnings('ignore')


class AutoMLSelector:
    """
    Automatically selects the best machine learning algorithm for your dataset
    Trains multiple algorithms and picks the best one based on cross-validation
    """
    
    # Classification algorithms to try
    CLASSIFICATION_ALGORITHMS = {
        'logistic': {
            'name': 'Logistic Regression',
            'class': 'LogisticRegression',
            'params': {'max_iter': 1000, 'random_state': 42},
            'priority': 1  # Lower = try first
        },
        'random_forest': {
            'name': 'Random Forest',
            'class': 'RandomForestClassifier',
            'params': {'n_estimators': 100, 'random_state': 42, 'n_jobs': -1},
            'priority': 2
        },
        'xgboost': {
            'name': 'XGBoost',
            'class': 'XGBClassifier',
            'params': {'n_estimators': 100, 'random_state': 42, 'n_jobs': -1},
            'priority': 3
        },
        'gradient_boosting': {
            'name': 'Gradient Boosting',
            'class': 'GradientBoostingClassifier',
            'params': {'n_estimators': 100, 'random_state': 42},
            'priority': 4
        },
        'svm': {
            'name': 'Support Vector Machine',
            'class': 'SVC',
            'params': {'random_state': 42, 'probability': True},
            'priority': 5
        }
    }
    
    # Regression algorithms to try
    REGRESSION_ALGORITHMS = {
        'linear': {
            'name': 'Linear Regression',
            'class': 'LinearRegression',
            'params': {},
            'priority': 1
        },
        'ridge': {
            'name': 'Ridge Regression',
            'class': 'Ridge',
            'params': {'random_state': 42},
            'priority': 2
        },
        'random_forest_reg': {
            'name': 'Random Forest Regressor',
            'class': 'RandomForestRegressor',
            'params': {'n_estimators': 100, 'random_state': 42, 'n_jobs': -1},
            'priority': 3
        },
        'xgboost_reg': {
            'name': 'XGBoost Regressor',
            'class': 'XGBRegressor',
            'params': {'n_estimators': 100, 'random_state': 42, 'n_jobs': -1},
            'priority': 4
        },
        'gradient_boosting_reg': {
            'name': 'Gradient Boosting Regressor',
            'class': 'GradientBoostingRegressor',
            'params': {'n_estimators': 100, 'random_state': 42},
            'priority': 5
        }
    }
    
    def __init__(self, problem_type: str = 'classification', cv_folds: int = 5, 
                 time_limit: Optional[int] = None, n_algorithms: Optional[int] = None):
        """
        Initialize AutoML Selector
        
        Args:
            problem_type: 'classification' or 'regression'
            cv_folds: Number of cross-validation folds
            time_limit: Maximum time in seconds (None = no limit)
            n_algorithms: Number of algorithms to try (None = try all)
        """
        self.problem_type = problem_type
        self.cv_folds = cv_folds
        self.time_limit = time_limit
        self.n_algorithms = n_algorithms
        self.results = []
        self.best_algorithm = None
        self.best_score = None
        self.best_model = None
        
    def _get_algorithm_list(self) -> Dict[str, Dict]:
        """Get list of algorithms to try based on problem type"""
        if self.problem_type == 'classification':
            algos = self.CLASSIFICATION_ALGORITHMS
        else:
            algos = self.REGRESSION_ALGORITHMS
        
        # Sort by priority
        sorted_algos = dict(sorted(algos.items(), key=lambda x: x[1]['priority']))
        
        # Limit number if specified
        if self.n_algorithms:
            sorted_algos = dict(list(sorted_algos.items())[:self.n_algorithms])
        
        return sorted_algos
    
    def _create_model(self, algo_key: str):
        """Create model instance from algorithm key"""
        algos = self._get_algorithm_list()
        algo_info = algos[algo_key]
        
        if self.problem_type == 'classification':
            if algo_key == 'logistic':
                from sklearn.linear_model import LogisticRegression
                return LogisticRegression(**algo_info['params'])
            elif algo_key == 'random_forest':
                from sklearn.ensemble import RandomForestClassifier
                return RandomForestClassifier(**algo_info['params'])
            elif algo_key == 'xgboost':
                from xgboost import XGBClassifier
                return XGBClassifier(**algo_info['params'], eval_metric='logloss')
            elif algo_key == 'gradient_boosting':
                from sklearn.ensemble import GradientBoostingClassifier
                return GradientBoostingClassifier(**algo_info['params'])
            elif algo_key == 'svm':
                from sklearn.svm import SVC
                return SVC(**algo_info['params'])
        else:  # regression
            if algo_key == 'linear':
                from sklearn.linear_model import LinearRegression
                return LinearRegression(**algo_info['params'])
            elif algo_key == 'ridge':
                from sklearn.linear_model import Ridge
                return Ridge(**algo_info['params'])
            elif algo_key == 'random_forest_reg':
                from sklearn.ensemble import RandomForestRegressor
                return RandomForestRegressor(**algo_info['params'])
            elif algo_key == 'xgboost_reg':
                from xgboost import XGBRegressor
                return XGBRegressor(**algo_info['params'])
            elif algo_key == 'gradient_boosting_reg':
                from sklearn.ensemble import GradientBoostingRegressor
                return GradientBoostingRegressor(**algo_info['params'])
    
    def select_best_algorithm(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Any]:
        """
        Try multiple algorithms and select the best one
        
        Args:
            X: Feature matrix
            y: Target vector
            
        Returns:
            Dict with best algorithm info and all results
        """
        algos = self._get_algorithm_list()
        start_time = time.time()
        
        print(f"\n🤖 AutoML: Testing {len(algos)} algorithms...")
        print("=" * 70)
        
        for algo_key, algo_info in algos.items():
            # Check time limit
            if self.time_limit and (time.time() - start_time) > self.time_limit:
                print(f"\n⏰ Time limit reached ({self.time_limit}s)")
                break
            
            try:
                algo_start = time.time()
                
                # Create model
                model = self._create_model(algo_key)
                
                # Cross-validation
                if self.problem_type == 'classification':
                    scores = cross_val_score(model, X, y, cv=self.cv_folds, 
                                           scoring='accuracy', n_jobs=-1)
                else:
                    scores = cross_val_score(model, X, y, cv=self.cv_folds,
                                           scoring='r2', n_jobs=-1)
                
                mean_score = scores.mean()
                std_score = scores.std()
                training_time = time.time() - algo_start
                
                # Store results
                result = {
                    'algorithm': algo_key,
                    'name': algo_info['name'],
                    'mean_score': mean_score,
                    'std_score': std_score,
                    'cv_scores': scores.tolist(),
                    'training_time': training_time
                }
                self.results.append(result)
                
                # Update best
                if self.best_score is None or mean_score > self.best_score:
                    self.best_score = mean_score
                    self.best_algorithm = algo_key
                    self.best_model = model
                
                # Print progress
                metric = "Accuracy" if self.problem_type == 'classification' else "R²"
                print(f"✓ {algo_info['name']:.<40} {metric}: {mean_score:.4f} (±{std_score:.4f}) [{training_time:.2f}s]")
                
            except Exception as e:
                print(f"✗ {algo_info['name']:.<40} Failed: {str(e)[:30]}")
                continue
        
        print("=" * 70)
        
        # Sort results by score
        self.results.sort(key=lambda x: x['mean_score'], reverse=True)
        
        # Print best algorithm
        if self.best_algorithm:
            best_info = algos[self.best_algorithm]
            metric = "Accuracy" if self.problem_type == 'classification' else "R²"
            print(f"\n🏆 Best Algorithm: {best_info['name']}")
            print(f"   {metric}: {self.best_score:.4f}")
            print(f"   Total time: {time.time() - start_time:.2f}s")
        
        return {
            'best_algorithm': self.best_algorithm,
            'best_algorithm_name': algos[self.best_algorithm]['name'] if self.best_algorithm else None,
            'best_score': self.best_score,
            'all_results': self.results,
            'total_time': time.time() - start_time
        }
    
    def train_best_model(self, X: np.ndarray, y: np.ndarray) -> Any:
        """
        Train the best model on full dataset
        
        Args:
            X: Feature matrix
            y: Target vector
            
        Returns:
            Trained model
        """
        if not self.best_algorithm:
            raise ValueError("Must run select_best_algorithm first")
        
        model = self._create_model(self.best_algorithm)
        model.fit(X, y)
        self.best_model = model
        
        return model
    
    def get_comparison_dataframe(self) -> pd.DataFrame:
        """Get comparison results as DataFrame"""
        if not self.results:
            return pd.DataFrame()
        
        df = pd.DataFrame(self.results)
        df = df.sort_values('mean_score', ascending=False)
        df['rank'] = range(1, len(df) + 1)
        
        return df[['rank', 'name', 'mean_score', 'std_score', 'training_time']]


def auto_train_best_model(X: np.ndarray, y: np.ndarray, problem_type: str = 'classification',
                         cv_folds: int = 5, time_limit: Optional[int] = None) -> Dict[str, Any]:
    """
    One-function AutoML: automatically selects and trains the best model
    
    Args:
        X: Feature matrix
        y: Target vector
        problem_type: 'classification' or 'regression'
        cv_folds: Number of cross-validation folds
        time_limit: Maximum time in seconds
        
    Returns:
        Dict with trained model and results
    """
    # Select best algorithm
    selector = AutoMLSelector(problem_type=problem_type, cv_folds=cv_folds, 
                            time_limit=time_limit)
    selection_results = selector.select_best_algorithm(X, y)
    
    # Train best model on full data
    best_model = selector.train_best_model(X, y)
    
    return {
        'model': best_model,
        'algorithm': selection_results['best_algorithm'],
        'algorithm_name': selection_results['best_algorithm_name'],
        'cv_score': selection_results['best_score'],
        'all_results': selection_results['all_results'],
        'comparison_df': selector.get_comparison_dataframe()
    }
