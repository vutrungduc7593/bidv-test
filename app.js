const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

// Guides
/*
Replace:
1\.[\d\.]* .+\n
*/

const COLLECTION_TEMPLATE_PATH = path.join(__dirname, "data", "template.postman_collection.json");
const COLLECTION_TEMPLATE = readJsonFile(COLLECTION_TEMPLATE_PATH);

function readJsonFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading JSON file:", filePath);
    throw error;
  }
}

function cloneObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Read and parse CSV data from data/data.csv
function readCSVData() {
  try {
    const csvFilePath = path.join(__dirname, "data", "data.csv");

    // Check if file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error("CSV file not found:", csvFilePath);
      return [];
    }

    // Read file content
    const fileContent = fs.readFileSync(csvFilePath, "utf-8");

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    return records;
  } catch (error) {
    console.error("Error reading CSV file:", error);
    return [];
  }
}

// Parse JSON data from Steps column
function parseStepsData(stepsString, name) {
  try {
    // Remove leading/trailing whitespace and quotes
    let cleanedString = stepsString.trim();

    // Remove leading comma if present
    if (cleanedString.startsWith(",")) {
      cleanedString = cleanedString.substring(1).trim();
    }

    // Parse JSON
    const parsedData = JSON.parse(cleanedString);
    return parsedData;
  } catch (error) {
    console.error("Error parsing JSON data for name:", name);

    throw error;
  }
}

// Process the data
function processData() {
  console.log("Reading CSV data from data/data.csv...\n");

  const records = readCSVData();

  if (records.length === 0) {
    console.log("No data found in CSV file.");
    return;
  }

  console.log(`Found ${records.length} records:\n`);

  // Return processed data for further use if needed
  return records.map((record) => ({
    name: record.Name,
    stepsData: record.Steps ? parseStepsData(record.Steps, record.Name) : null,
  }));
}

function exportJson(path, data) {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf8");
    console.log(`Data successfully exported to ${path}`);
  } catch (error) {
    console.error(`Error exporting data to ${path}:`, error);
  }
}

// Export functions for use in other modules
module.exports = {
  readCSVData,
  parseStepsData,
  processData,
};

// Run the process if this file is executed directly
if (require.main === module) {
  let records = processData();

  records = records.filter((record) => {
    if (!record.name) return false;

    return true
  });

  const postmanRecords = records.map((record) => {
    const item = cloneObject(COLLECTION_TEMPLATE.item[0]);
    item.name = record.name.replace("API", "API_");
    item.request.body.raw = JSON.stringify(record.stepsData, null, 4);

    return item;
  });

  const postmanContent = cloneObject(COLLECTION_TEMPLATE);

  postmanContent.info.name = `Generated Collection ${records.length}`;
  postmanContent.item = postmanRecords;

  exportJson("./data/generated.postman_collection.json", postmanContent);
}
