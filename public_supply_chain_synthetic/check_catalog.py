
import pandas as pd

file_path = "DS1_Food_Grocery_Catalog.xlsx"

# Load the Excel catalog
df = pd.read_excel(file_path, sheet_name=0)

print("Dataset shape:", df.shape)

print("\nColumn names:")
print(df.columns.tolist())

print("\nFirst 5 products:")
print(df.head())

print("\nMissing values in each column:")
print(df.isnull().sum())

print("\nDuplicate item IDs:")
print(df["Item ID"].duplicated().sum())

print("\nProduct categories:")
print(df["Category"].value_counts().head(10))
