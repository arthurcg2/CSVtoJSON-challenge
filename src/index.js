const fs = require("fs");
const path = require("path");

fs.readFile(path.join(__dirname, "input.csv"), "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  let obj = createObjectFromCSV(data);
  group_addresses(obj);
  exportJSON(obj, "output-test");
});

function createObjectFromCSV(csv) {
  let res = [];
  let lines = csv.split("\n").filter((e) => e !== "");

  const cols = lines[0].split(",").map((el) => el.replace(/\"/g, ""));

  for (let i = 1; i < lines.length; i++) {
    let currentObject = {};
    const currentLine = lines[i].split(",");

    for (let j = 0; j < cols.length; j++) {
      currentObject[cols[j]] = currentLine[j];
    }

    res.push(currentObject);
  }

  return res;
}

function exportJSON(obj, name) {
  fs.writeFileSync(path.join(__dirname, `${name}.json`), JSON.stringify(obj));
}
