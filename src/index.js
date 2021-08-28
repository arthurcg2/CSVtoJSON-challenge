const fs = require("fs");
const path = require("path");
const PNF = require("google-libphonenumber").PhoneNumberFormat;
const phoneUtil =
  require("google-libphonenumber").PhoneNumberUtil.getInstance();

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

function group_addresses(obj) {
  let addresses = [];

  for (let person of obj) {
    for (let key of Object.keys(person)) {
      // checks keys of the objects to find 'email' or 'phone'
      if (key.includes("email")) {
        addresses.push({
          type: "email",
          tags: [...key.split(" ").filter((e) => e != "email")], // adds tags, removing the word 'email'
          address: person[key],
        });

        delete person[key];
      } else if (key.includes("phone")) {
        let number;

        // ignores invalid phone numbers
        try {
          number = phoneUtil.parseAndKeepRawInput(person[key], "BR");
        } catch {
          delete person[key];
          continue;
        }

        if (phoneUtil.isValidNumber(number))
          addresses.push({
            type: "phone",
            tags: [...key.split(" ").filter((e) => e != "phone")],
            address: phoneUtil.format(number, PNF.E164).slice(1),
          });

        delete person[key];
      }
    }

    person.addresses = addresses;
  }
}

function exportJSON(obj, name) {
  fs.writeFileSync(path.join(__dirname, `${name}.json`), JSON.stringify(obj));
}
