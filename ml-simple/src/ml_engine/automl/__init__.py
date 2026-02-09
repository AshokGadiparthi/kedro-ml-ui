"""
AutoML Module
Automatic algorithm selection and model comparison
"""

from .auto_selector import AutoMLSelector
from .model_comparison import ModelComparison

__all__ = ['AutoMLSelector', 'ModelComparison']
