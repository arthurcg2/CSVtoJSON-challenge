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
  groupAddresses(obj);
  exportJSON(obj, "output-test");
});

function createObjectFromCSV(csv) {
  let res = [];
  let lines = csv.split("\n").filter((e) => e !== "");

  const cols = lines[0].split(",").map((el) => el.replace(/\"/g, ""));

  for (let i = 1; i < lines.length; i++) {
    let currentObject = {};
    const currentLine = lines[i].split(",").map((el) => el.replace(/\"/g, ""));

    for (let j = 0; j < cols.length; j++) {
      currentObject[cols[j]] = currentLine[j];
    }

    res.push(currentObject);
  }

  return res;
}

function groupAddresses(obj) {
  let addresses = [];

  for (let person of obj) {
    for (let key of Object.keys(person)) {
      // checks keys of the objects to find 'email' or 'phone'
      if (key.includes("email")) {
        validateAndReturnEmail(person[key])?.forEach((email) => {
          addresses.push({
            type: "email",
            tags: [...key.split(" ").filter((e) => e != "email")], // adds tags, removing the word 'email'
            address: email,
          });
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

function validateAndReturnEmail(email) {
  // returns all matches of emails in a string
  return email.match(
    /(([^<>()\[\]\\\/.,;:\s@"]+(\.[^<>()\[\]\\\/.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g
  );
}

function exportJSON(obj, name) {
  fs.writeFileSync(path.join(__dirname, `${name}.json`), JSON.stringify(obj));
}
