const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

// Read and parse CSV data from data/data-new.csv
function readCSVData() {
  try {
    const csvFilePath = path.join(__dirname, "data", "data-new.csv");

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
function parseStepsData(stepsString) {
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
    console.error("Error parsing JSON data:", error);
    console.error("Raw data:", stepsString);
    return null;
  }
}

// Process the data
function processData() {
  console.log("Reading CSV data from data/data-new.csv...\n");

  const records = readCSVData();

  if (records.length === 0) {
    console.log("No data found in CSV file.");
    return;
  }

  console.log(`Found ${records.length} records:\n`);

  records.forEach((record, index) => {
    const name = record.Name;
    const stepsRaw = record.Steps;

    // console.log(`${index + 1}. Name: ${name}`);

    if (stepsRaw && stepsRaw.trim()) {
      const stepsData = parseStepsData(stepsRaw);

      if (stepsData) {
        //
      } else {
        console.log("   Invalid JSON data");
      }
    } else {
      // console.log('   No steps data');
    }
    // console.log('');
  });

  // Return processed data for further use if needed
  return records.map((record) => ({
    name: record.Name,
    stepsData: record.Steps ? parseStepsData(record.Steps) : null,
  }));
}

function exportJson(path, data) {
  // TODO:
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

    const index = Number(record.name.replace("API", ""));

    if (index < 64) return false;

    return true
  });

  const postmanRecords = records.map((record) => {
    return {
			"name": record.name.replace("API", "API_ "),
			"event": [
				{
					"listen": "prerequest",
					"script": {
						"exec": [
							""
						],
						"type": "text/javascript",
						"packages": {}
					}
				}
			],
			"request": {
				"auth": {
					"type": "bearer",
					"bearer": [
						{
							"key": "token",
							"value": "{{globalToken}}",
							"type": "string"
						}
					]
				},
				"method": "POST",
				"header": [
					{
						"key": "channel",
						"value": "IBANK2"
					},
					{
						"key": "i-encrypted",
						"value": "false"
					},
					{
						"key": "i-os",
						"value": "Android"
					},
					{
						"key": "i-os-version",
						"value": "17.1.1"
					},
					{
						"key": "timestamp",
						"value": "2025-09-08T08:48:01.146Z"
					},
					{
						"key": "x-api-interaction-id",
						"value": "071753df-fbbf-4d34-8e1c-ecc30ca7b3bb"
					},
					{
						"key": "x-client-id",
						"value": "635bdf50465dce92380c15b9c19d8c51"
					},
					{
						"key": "i-device-model",
						"value": "Android"
					},
					{
						"key": "accept-language",
						"value": "vi-VN"
					},
					{
						"key": "i-version",
						"value": "1.0.0"
					},
					{
						"key": "Content-Type",
						"value": "application/json"
					},
					{
						"key": "Authorization",
						"value": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJBUzNmeXdOM1ljem1EWVUteVF1VkdzQ21rejY4eU9SMF8xdjl5czY4WHdrIn0.eyJleHAiOjE3NTczMjU3ODYsImlhdCI6MTc1NzMyMjE4NiwianRpIjoib25ydG5hOmM0MzMwODU3LWU2NTktNDhjOC05YWI1LTcxNDc5NzA0ZDllMSIsImlzcyI6Imh0dHA6Ly9rZXljbG9hay1zZXJ2aWNlL2JpZHZkaXJlY3RzaXQvYXV0aC9yZWFsbXMvaWJhbmsiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiN2EyYzUyZjEtYTY5Yy00ZGU3LThiOTEtY2I2ZDI4MzQxNjcwIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiaWJhbmstbW9iaWxlIiwic2lkIjoiOWFmMTUwNzMtYTNmNC00NmM3LWEyMjUtY2Q1OTJkODQyNTI1IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIvKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJkZWZhdWx0LXJvbGVzLWliYW5rIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6ImVtYWlsIHByb2ZpbGUiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiI4ODA2NWR1bmdtYWtlciIsIkktQ2xpZW50LUlEIjoiQVBQIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiODgwNjVkdW5nbWFrZXIiLCJnaXZlbl9uYW1lIjoiODgwNjVkdW5nbWFrZXIiLCJlbWFpbCI6ImR1bmcuY2h1QGFldG9za3kuY29tIiwiSS1EZXZpY2UtSUQiOiI5NTlCN0I2RS00MjgxLTRDQkYtOTlFRC01NEVDQUE0QzYxRDkifQ.dePmEGQ-vs34QHoDUnTl0pbdnCJWkNYfObW9d1zUdwv07kAYHgWl2Q5-gCT6oVI5-6ptS5Mo4xqqBhVsduOhSljnhneqD-A482OQOfPxK_4gam1n8Ua4lnuXZoF2D479prMK7qOgdVhUG8FBgbUap27pwXjSOIlyn6W4uRKaQvuUiqSRY7xOa4AHINHl34vCjz7VauY9uyn_3cmqWOoxqFHhSi-9XXiE-2K0qORjoLSgzq6huv62MgTn11WOoHX2hnacw1FGXqeyAyLWxFSeI9ZMxxauDVp7TRxsZm5C-hPRy2p9BS-p4TiYa2CLS--ab4QAw-LJLjz3G447FFJYwA",
						"disabled": true
					},
					{
						"key": "I-Device-ID",
						"value": "027E15E4-AD4B-4612-84A6-6711D241226B",
						"type": "text"
					},
					{
						"key": "I-Client-ID",
						"value": "APP",
						"type": "text"
					}
				],
				"body": {
					"mode": "raw",
					"raw": JSON.stringify(record.stepsData, null, 4),
					"options": {
						"raw": {
							"language": "json"
						}
					}
				},
				"url": {
					"raw": "{{serviceUrl}}/gov/domestic/tax/validate-first/1.0",
					"host": [
						"{{serviceUrl}}"
					],
					"path": [
						"gov",
						"domestic",
						"tax",
						"validate-first",
						"1.0"
					]
				},
				"description": "Generated from cURL: curl --location 'https://bidv.net:9303/bidvorg/service/open-banking/ibank2-sit/v2/gov/domestic/txn/pending/list/1.0' \\\n--header 'channel: IBANK2' \\\n--header 'i-device-id: 959B7B6E-4281-4CBF-99ED-54ECAA4C61D9' \\\n--header 'i-encrypted: false' \\\n--header 'i-os: Android' \\\n--header 'i-os-version: 17.1.1' \\\n--header 'timestamp: 2025-09-08T08:48:01.146Z' \\\n--header 'x-api-interaction-id: 071753df-fbbf-4d34-8e1c-ecc30ca7b3bb' \\\n--header 'x-client-id: 635bdf50465dce92380c15b9c19d8c51' \\\n--header 'i-device-model: Android' \\\n--header 'i-client-id: APP' \\\n--header 'accept-language: vi-VN' \\\n--header 'i-version: 1.0.0' \\\n--header 'Content-Type: application/json' \\\n--header 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJBUzNmeXdOM1ljem1EWVUteVF1VkdzQ21rejY4eU9SMF8xdjl5czY4WHdrIn0.eyJleHAiOjE3NTczMjU3ODYsImlhdCI6MTc1NzMyMjE4NiwianRpIjoib25ydG5hOmM0MzMwODU3LWU2NTktNDhjOC05YWI1LTcxNDc5NzA0ZDllMSIsImlzcyI6Imh0dHA6Ly9rZXljbG9hay1zZXJ2aWNlL2JpZHZkaXJlY3RzaXQvYXV0aC9yZWFsbXMvaWJhbmsiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiN2EyYzUyZjEtYTY5Yy00ZGU3LThiOTEtY2I2ZDI4MzQxNjcwIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiaWJhbmstbW9iaWxlIiwic2lkIjoiOWFmMTUwNzMtYTNmNC00NmM3LWEyMjUtY2Q1OTJkODQyNTI1IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIvKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJkZWZhdWx0LXJvbGVzLWliYW5rIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6ImVtYWlsIHByb2ZpbGUiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiI4ODA2NWR1bmdtYWtlciIsIkktQ2xpZW50LUlEIjoiQVBQIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiODgwNjVkdW5nbWFrZXIiLCJnaXZlbl9uYW1lIjoiODgwNjVkdW5nbWFrZXIiLCJlbWFpbCI6ImR1bmcuY2h1QGFldG9za3kuY29tIiwiSS1EZXZpY2UtSUQiOiI5NTlCN0I2RS00MjgxLTRDQkYtOTlFRC01NEVDQUE0QzYxRDkifQ.dePmEGQ-vs34QHoDUnTl0pbdnCJWkNYfObW9d1zUdwv07kAYHgWl2Q5-gCT6oVI5-6ptS5Mo4xqqBhVsduOhSljnhneqD-A482OQOfPxK_4gam1n8Ua4lnuXZoF2D479prMK7qOgdVhUG8FBgbUap27pwXjSOIlyn6W4uRKaQvuUiqSRY7xOa4AHINHl34vCjz7VauY9uyn_3cmqWOoxqFHhSi-9XXiE-2K0qORjoLSgzq6huv62MgTn11WOoHX2hnacw1FGXqeyAyLWxFSeI9ZMxxauDVp7TRxsZm5C-hPRy2p9BS-p4TiYa2CLS--ab4QAw-LJLjz3G447FFJYwA' \\\n--data '{\n    \"search\": \"\",\n    \"startDate\": \"\",\n    \"endDate\": \"\",\n    \"minAmount\": 0,\n    \"maxAmount\": \"\",\n    \"statuses\": [],\n    \"debitAccNo\": \"\",\n    \"taxCode\": \"\",\n    \"declarationNo\": \"\",\n    \"batchNo\": \"\",\n    \"page\": {\n        \"pageSize\": 20,\n        \"pageNum\": 1\n    }\n}'"
			},
			"response": []
		};
  });

  const postmanContent = {
    info: {
      _postman_id: "386785d2-fab4-401a-9d4d-757f2b180fc8",
      name: "TNĐ_API Xác thực khoản nộp-Step1-Import",
      schema:
        "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      _exporter_id: "48157969",
      _collection_link:
        "https://skymapdvc-2192823.postman.co/workspace/BIDV_DVC3~600e9cb6-95a8-4548-ac90-6c70af8099f4/collection/48157969-386785d2-fab4-401a-9d4d-757f2b180fc8?action=share&source=collection_link&creator=48157969",
    },
    item: [],
    event: [
      {
        listen: "prerequest",
        script: {
          type: "text/javascript",
          packages: {},
          exec: [
            "// Headers cần thêm\r",
            "const headersToSet = [\r",
            "  { key: 'I-Device-ID', value: '959B7B6E-4281-4CBF-99ED-54ECAA4C61D5' },\r",
            "  { key: 'I-Client-ID', value: 'APP' }\r",
            "];\r",
            "\r",
            "// Xóa header cũ (nếu có) rồi thêm mới\r",
            "headersToSet.forEach(h => {\r",
            "  if (!h.value) return; // bỏ qua nếu chưa có giá trị\r",
            "  try { pm.request.headers.remove(h.key); } catch (e) {}\r",
            "  pm.request.headers.add({ key: h.key, value: String(h.value) });\r",
            "});",
          ],
        },
      },
      {
        listen: "test",
        script: {
          type: "text/javascript",
          packages: {},
          exec: [""],
        },
      },
    ],
  };

  postmanContent.item = postmanRecords;

  exportJson("./data/postman.json", postmanContent);
}
