
import pandas as pd
from pathlib import Path

# Dataset folder
data_dir = Path("data/core")

# Load the demand dataset
file_path = data_dir / "monthly_demand_history.csv"
df = pd.read_csv(file_path)

print("\n--- DATASET SHAPE ---")
print(df.shape)

print("\n--- COLUMN NAMES ---")
print(df.columns.tolist())

print("\n--- FIRST 5 ROWS ---")
print(df.head())

print("\n--- MISSING VALUES ---")
print(df.isnull().sum())

print("\n--- DATA TYPES ---")
print(df.dtypes)

print("\n--- DUPLICATE ROWS ---")
print(df.duplicated().sum())
