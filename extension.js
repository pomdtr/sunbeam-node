#!/usr/bin/env node

const axios = require('axios');
const process = require('process');

const manifest = {
    "title": "Sunbeam",
    "preferences": [{ "label": "API Key", "name": "api_key", "type": "text" }],
    "commands": [
        { "name": "platforms", "title": "List all platforms", "mode": "filter" },
        {
            "name": "search",
            "title": "Search for a package",
            "mode": "search",
            "params": [{ "name": "platform", "label": "Platform", "type": "text", "optional": true }],
        },
    ],
};

async function main() {
    if (process.argv.length === 2) {
        console.log(JSON.stringify(manifest));
        process.exit(0);
    }

    const payload = JSON.parse(process.argv[2]);
    const command = payload["command"];
    const prefs = payload["preferences"];
    const params = payload["params"];

    if (command === "platforms") {
        const response = await axios.get("https://libraries.io/api/platforms", { params: { "api_key": prefs["api_key"] } });
        const data = response.data;
        const res = {
            "items": data.map(item => ({
                "title": item["name"],
                "accessories": [`${item['project_count']} projects available`],
                "actions": [
                    {
                        "title": "Search",
                        "type": "run",
                        "run": {
                            "command": "search",
                            "params": { "platform": item["name"] },
                        },
                    },
                    {
                        "title": "Open Homepage",
                        "type": "open",
                        "open": { "url": item["homepage"] },
                    },
                ],
            })),
        };
        console.log(JSON.stringify(res));
    } else if (command === "search") {
        if (!payload.query) {
            console.log(JSON.stringify({ "emptyText": "Enter a query to search for" }));
            process.exit(0);
        }
        const response = await axios.get(
            "https://libraries.io/api/search",
            {
                params: {
                    "api_key": prefs.api_key,
                    "platforms": params.platform,
                    "q": payload.query,
                },
            }
        );
        const data = response.data;
        const res = {
            "items": data.map(item => ({
                "title": item["name"],
                "actions": [
                    {
                        "title": "Open Homepage",
                        "type": "open",
                        "open": { "url": item.homepage },
                    }
                ],
            })),
        };
        console.log(JSON.stringify(res));
    }
}

main();
