const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

const COLLECTION_TEMPLATE_PATH = path.join(__dirname, "data", "script_template.postman_collection.json");
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

// Replace const obj = {...} in prerequest script exec array
function replaceObjInScript(execArray, jsonData) {
    if (!Array.isArray(execArray) || !jsonData) {
        return execArray;
    }

    // Find the line that contains "const obj = {"
    let objStartIndex = -1;
    for (let i = 0; i < execArray.length; i++) {
        const line = execArray[i].trim();
        if (line.startsWith("const obj = {") || line.includes("const obj = {")) {
            objStartIndex = i;
            break;
        }
    }

    // If not found, return original
    if (objStartIndex === -1) {
        return execArray;
    }

    // Find where the object ends by looking for "};" on a line
    let objEndIndex = objStartIndex;
    let braceDepth = 0;
    let foundOpeningBrace = false;

    for (let i = objStartIndex; i < execArray.length; i++) {
        const line = execArray[i];
        const trimmedLine = line.trim();

        // Count braces in this line
        for (let j = 0; j < line.length; j++) {
            if (line[j] === "{") {
                braceDepth++;
                foundOpeningBrace = true;
            } else if (line[j] === "}") {
                braceDepth--;
            }
        }

        // Check if this line contains "};" and we've closed all braces
        if (foundOpeningBrace && braceDepth === 0 && trimmedLine.includes("};")) {
            objEndIndex = i;
            break;
        }
    }

    // If we didn't find the end, try to find it by looking for lines that end with "};"
    if (objEndIndex === objStartIndex) {
        for (let i = objStartIndex + 1; i < execArray.length; i++) {
            const trimmedLine = execArray[i].trim();
            if (trimmedLine === "};" || trimmedLine.endsWith("};")) {
                objEndIndex = i;
                break;
            }
        }
    }

    // Convert JSON to JavaScript object literal string with proper formatting
    const jsonString = JSON.stringify(jsonData, null, 2);

    // Split into lines and format as const obj = {...};
    const jsonLines = jsonString.split("\n");
    const newObjLines = [
        "const obj = " + jsonLines[0], // First line: const obj = {
        ...jsonLines.slice(1, -1).map(line => line), // Middle lines
        jsonLines[jsonLines.length - 1] + ";" // Last line: };
    ];

    // Replace the old obj definition with the new one
    const newExecArray = [
        ...execArray.slice(0, objStartIndex),
        ...newObjLines,
        ...execArray.slice(objEndIndex + 1)
    ];

    return newExecArray;
}

// Find template items that have const obj = {...} in their prerequest script
function findTemplateItemsWithObj(items) {
    const result = [];

    for (const item of items) {
        // If item has nested items (it's a folder), search recursively
        if (item.item && Array.isArray(item.item)) {
            const nestedResults = findTemplateItemsWithObj(item.item);
            result.push(...nestedResults);
        } else {
            // This is an API item - check if it has events with prerequest script
            if (item.event && Array.isArray(item.event)) {
                for (const event of item.event) {
                    if (event.listen === "prerequest" && event.script && event.script.exec) {
                        // Check if this script has const obj = {...}
                        const hasObj = event.script.exec.some(line =>
                            line.trim().startsWith("const obj = {")
                        );

                        if (hasObj) {
                            result.push(item);
                            break; // Found it, no need to check other events
                        }
                    }
                }
            }
        }
    }

    return result;
}

// Create a new item from template item with CSV data
function createItemFromTemplate(templateItem, record) {
    const newItem = cloneObject(templateItem);

    // Update item name
    newItem.name = record.name.replace("API", "API_");

    // Replace the obj in the prerequest script
    if (newItem.event && Array.isArray(newItem.event)) {
        for (const event of newItem.event) {
            if (event.listen === "prerequest" && event.script && event.script.exec) {
                event.script.exec = replaceObjInScript(
                    event.script.exec,
                    record.stepsData
                );
            }
        }
    }

    return newItem;
}

function exportJson(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, "\t"), "utf8");
        console.log(`Data successfully exported to ${filePath}`);
    } catch (error) {
        console.error(`Error exporting data to ${filePath}:`, error);
    }
}

// Export functions for use in other modules
module.exports = {
    readCSVData,
    parseStepsData,
    processData,
    replaceObjInScript,
    findTemplateItemsWithObj,
    createItemFromTemplate,
};

// Run the process if this file is executed directly
if (require.main === module) {
    let records = processData();

    records = records.filter((record) => {
        if (!record.name) return false;
        if (!record.stepsData) return false;
        return true;
    });

    console.log(`Processing ${records.length} valid records...\n`);

    // Clone the template
    const postmanContent = cloneObject(COLLECTION_TEMPLATE);

    // Find template items that have const obj = {...}
    const templateItemsWithObj = findTemplateItemsWithObj(postmanContent.item);

    if (templateItemsWithObj.length === 0) {
        console.error("No template items found with 'const obj = {...}' in prerequest script!");
        return;
    }

    console.log(`Found ${templateItemsWithObj.length} template item(s) with obj pattern.\n`);

    // Use the first template item found (or we could use all of them)
    const templateItem = templateItemsWithObj[0];

    // Create new items from CSV records
    const newItems = records.map((record) => {
        return createItemFromTemplate(templateItem, record);
    });

    // Preserve folder structure: if template has folders, put new items in the same folder structure
    // Otherwise, create flat items
    let foundFolder = false;

    for (const topLevelItem of postmanContent.item) {
        if (topLevelItem.item && Array.isArray(topLevelItem.item)) {
            // Check if this folder contains the template item
            const templateItemIndex = topLevelItem.item.findIndex(item => {
                if (item.name === templateItem.name) return true;
                if (item.event && Array.isArray(item.event)) {
                    return item.event.some(e =>
                        e.listen === "prerequest" && e.script && e.script.exec &&
                        e.script.exec.some(line => line.trim().startsWith("const obj = {"))
                    );
                }
                return false;
            });

            if (templateItemIndex !== -1) {
                // Replace the template item and any other items with obj pattern in this folder
                // with all the new items
                topLevelItem.item = newItems;
                foundFolder = true;
                break;
            }
        }
    }

    if (!foundFolder) {
        // No folder found or no folders in template, replace all items with obj pattern
        // Keep items without obj pattern
        const itemsWithoutObj = postmanContent.item.filter(item => {
            if (item.item && Array.isArray(item.item)) {
                // It's a folder - we already processed folders above
                return false;
            }
            // Check if this item has obj pattern
            if (item.event && Array.isArray(item.event)) {
                for (const event of item.event) {
                    if (event.listen === "prerequest" && event.script && event.script.exec) {
                        const hasObj = event.script.exec.some(line =>
                            line.trim().startsWith("const obj = {")
                        );
                        return !hasObj;
                    }
                }
            }
            return true;
        });

        // Combine new items with items that don't have obj pattern
        postmanContent.item = [...newItems, ...itemsWithoutObj];
    }

    // Update collection info
    postmanContent.info.name = `Collection: Total ${newItems.length} APIs at ${new Date().toISOString()}`;

    // Export the result
    const outputPath = path.join(__dirname, "data", "script-based-output.postman_collection.json");
    exportJson(outputPath, postmanContent);

    console.log(`\nProcessed ${newItems.length} API items.`);
}

