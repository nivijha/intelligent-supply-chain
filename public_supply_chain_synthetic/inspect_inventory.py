
import pandas as pd

file_path = "data/core/inventory_snapshot.csv"

df = pd.read_csv(file_path)

print("\n========== INVENTORY DATASET ==========")
print("Shape:", df.shape)

print("\n========== COLUMN NAMES ==========")
print(df.columns.tolist())

print("\n========== FIRST 10 ROWS ==========")
print(df.head(10).to_string(index=False))

print("\n========== DATA TYPES ==========")
print(df.dtypes)

print("\n========== MISSING VALUES ==========")
print(df.isnull().sum())

print("\n========== NUMERIC SUMMARY ==========")
print(df.describe().to_string())
