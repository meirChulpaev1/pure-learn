import os

# הגדרות - אילו סיומות של קבצים אנחנו רוצים לקרוא
ALLOWED_EXTENSIONS = {'.py', '.ts', '.html', '.scss', '.json'}

# תיקיות שצריך להתעלם מהן (הזבל שאנחנו לא צריכים)
IGNORE_DIRS = {
    'node_modules', 'venv', '.git', '__pycache__',
    '.angular', 'dist', 'migrations', '.vscode', '.idea'
}

OUTPUT_FILE = "project_code.txt"


def generate_context():
    print("Gathering project code...")

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as outfile:
        # עובר על כל התיקיות והקבצים בפרויקט
        for root, dirs, files in os.walk('.'):

            # מסנן החוצה את התיקיות שאנחנו לא צריכים
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

            for file in files:
                ext = os.path.splitext(file)[1]

                # בודק אם הקובץ רלוונטי
                if ext in ALLOWED_EXTENSIONS:
                    filepath = os.path.join(root, file)

                    # מתעלם מהסקריפט עצמו ומקובץ הפלט
                    if file == os.path.basename(__file__) or file == OUTPUT_FILE or file == 'package-lock.json':
                        continue

                    try:
                        with open(filepath, 'r', encoding='utf-8') as infile:
                            content = infile.read()

                            # כותב את הנתיב של הקובץ והתוכן שלו בצורה ברורה
                            outfile.write(f"\n{'='*60}\n")
                            outfile.write(f"FILE: {filepath}\n")
                            outfile.write(f"{'='*60}\n\n")
                            outfile.write(content)
                            outfile.write("\n")

                    except Exception as e:
                        print(f"Could not read {filepath}: {e}")

    print(f"Done! Code saved to {OUTPUT_FILE}")


if __name__ == '__main__':
    generate_context()
