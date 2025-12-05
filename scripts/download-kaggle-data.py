import kagglehub
import shutil
import os

# Download latest version
print("📥 Downloading Kaggle dataset...")
path = kagglehub.dataset_download("hershyandrew/amzn-dpz-btc-ntfx-adjusted-may-2013may2019")

print("Path to dataset files:", path)

# Copy files to data/raw/
target_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'raw')
os.makedirs(target_dir, exist_ok=True)

print(f"\n📁 Copying files to {target_dir}...")

# List and copy all CSV files
for file in os.listdir(path):
    if file.endswith('.csv'):
        src = os.path.join(path, file)
        dst = os.path.join(target_dir, file)
        shutil.copy2(src, dst)
        print(f"✓ Copied {file}")

print("\n✅ Dataset downloaded and ready!")
print(f"📂 Files location: {target_dir}")
print("\nNext step: Run 'node scripts/process-kaggle-data.js' to process the data")
