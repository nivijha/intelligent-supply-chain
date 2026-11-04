
import pandas as pd
from pathlib import Path

files = [
    Path("data/core/warehouses.csv"),
    Path("data/logistics/warehouse_utilization.csv"),
    Path("data/logistics/route_allocation_candidates.csv"),
    Path("data/logistics/vehicle_fleet.csv"),
]

for file_path in files:
    print("\n" + "=" * 70)
    print("FILE:", file_path)
    print("=" * 70)

    df = pd.read_csv(file_path)

    print("Shape:", df.shape)
    print("\nColumns:")
    print(df.columns.tolist())

    print("\nFirst 5 rows:")
    print(df.head().to_string(index=False))

    print("\nMissing values:")
    print(df.isnull().sum().to_string())
