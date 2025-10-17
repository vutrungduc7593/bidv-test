#!/usr/bin/env python3
"""
JSON Extractor from CSV
Extracts JSON data from the Step column in data.csv file
"""

import csv
import json
import re
import sys
from pathlib import Path


class JSONExtractor:
    """Extract JSON data from CSV file containing mixed text and JSON content."""

    def __init__(self, csv_file_path: str):
        self.csv_file_path = csv_file_path
        self.output_dir = Path("data")
        self.output_dir.mkdir(exist_ok=True)

    def process_csv(self):
        """Process the CSV file and extract JSON data."""
        extracted_data = []

        try:
            with open(self.csv_file_path, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                total_rows = sum(1 for row in reader)

                # Reset file pointer
                file.seek(0)
                next(reader)  # Skip header

                for row_num, row in enumerate(reader, 2):  # Start from 2 (after header)
                    external_id = row.get('External ID', '').strip()
                    step_content = row.get('Step', '').strip()

                    print(f"Processing row {row_num}/{total_rows} (ID: {external_id})")

                    extracted_json = self.extract_json_from_text(step_content)

                    if extracted_json:
                        result = {
                            'external_id': external_id,
                            'extracted_json': extracted_json,
                            'row_number': row_num
                        }
                        extracted_data.append(result)

                        # Save individual JSON file
                        self.save_individual_json(external_id, extracted_json, row_num)
                    else:
                        print(f"  Warning: No JSON found in row {row_num}")

        except FileNotFoundError:
            print(f"Error: File '{self.csv_file_path}' not found.")
            return []
        except Exception as e:
            print(f"Error processing CSV: {e}")
            return []

        return extracted_data

    def run(self):
        """Main execution method."""
        print("Starting JSON extraction from CSV...")
        print(f"Input file: {self.csv_file_path}")
        print(f"Output directory: {self.output_dir}")
        print("-" * 50)

        extracted_data = self.process_csv()

        if extracted_data:
            print(f"\nExtraction completed successfully!")
            print(f"Total JSON objects extracted: {len(extracted_data)}")

            self.save_summary_json(extracted_data)

            # Print sample of extracted data
            if extracted_data:
                print("\nSample extracted JSON:")
                sample = extracted_data[0]['extracted_json']
                print(json.dumps(sample, ensure_ascii=False, indent=2))
        else:
            print("No JSON data could be extracted from the CSV file.")

        return extracted_data


def main():
    """Main function."""
    csv_file = "data/data.csv"

    if len(sys.argv) > 1:
        csv_file = sys.argv[1]

    extractor = JSONExtractor(csv_file)
    extractor.run()


if __name__ == "__main__":
    main()
