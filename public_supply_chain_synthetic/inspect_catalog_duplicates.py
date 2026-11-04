
import pandas as pd

file_path = "DS1_Food_Grocery_Catalog.xlsx"
df = pd.read_excel(file_path)

print("Total rows:", len(df))
print("Unique Item IDs:", df["Item ID"].nunique())
print("Rows with repeated Item IDs:",
      df["Item ID"].duplicated(keep=False).sum())

# Examine one repeated ID
duplicate_ids = df.loc[
    df["Item ID"].duplicated(keep=False), "Item ID"
]

if not duplicate_ids.empty:
    example_id = duplicate_ids.iloc[0]
    example = df[df["Item ID"] == example_id]

    print("\nExample repeated Item ID:", example_id)
    print(example[[
        "Item ID", "Item Name", "Category",
        "Price (INR)", "Provider Name", "Timestamp",
        "Transaction ID"
    ]].to_string(index=False))

    print("\nNumber of rows for this ID:", len(example))
