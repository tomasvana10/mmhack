const fs = require("fs");
const path = require("path");

const absPath = path.resolve(__dirname);

let DOC_DATA;

DOC_DATA = JSON.parse(fs.readFileSync(path.join(absPath, "data.json"), "utf-8")).DOC_DATA;

const sortDocs = (data) => {
    const formatted = {
        Actions: {},
        Toggles: {},
        Configurations: {},
    };

    data.forEach((item) => {
        const { command, doc, type } = item;
        if (type === "action") {
            formatted.Actions[command] = doc;
        } else if (type === "toggle") {
            formatted.Toggles[command] = doc;
        } else if (type === "config") {
            formatted.Configurations[command] = doc;
        }
    });

    return formatted;
};

const generateMarkdown = (formatted) => {
    let markdown = "";

    for (const [category, commands] of Object.entries(formatted)) {
        markdown += `### ${category}\n\n`;
        for (const [command, doc] of Object.entries(commands)) {
            markdown += `- \`${command}\`: ${doc}\n`;
        }
        markdown += "\n";
    }

    return markdown;
};

const writeToFile = (filename, content) => {
    fs.writeFileSync(filename, content, "utf8");
};

const formattedDocs = sortDocs(DOC_DATA);
const markdownContent = generateMarkdown(formattedDocs);
writeToFile(path.join(absPath, "docs.md"), markdownContent);
