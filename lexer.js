const readline = require("readline");
const shell = require("shelljs");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const parseCommand = require("./parser");

const commandMap = {
  useDBSQL: /USE (.*);/i,
  showDBSQL: /SHOW DATABASES;/i,
  showTBSQL: /SHOW TABLES\;/i,
  dropDBSQL: /DROP DATABASE (.*);/i,
  dropTBSQL: /DROP TABLE (.*);/i,
  createDBSQL: /CREATE DATABASE ([a-zA-Z][a-zA-Z0-9_]+);/i,
  createTBSQL: /CREATE TABLE ([a-zA-Z][a-zA-Z0-9_]+) \((.*)\);/i,
  insertWithConditionSQL: /INSERT INTO (.*) \((.*)\) VALUES \((.*)\);/i,
  insertSQL: /INSERT INTO (.*) VALUES \((.*)\);/i,
  deleteSQL: /DELETE FROM (.*) WHERE (.*);/i,
  updateWithConditionSQL: /UPDATE (.*) SET (.*) WHERE (.*);/i,
  updateSQL: /UPDATE (.*) SET (.*);/i,
  selectWithConditionSQL: /SELECT (.*) FROM (.*) WHERE (.*);/i,
  selectSQL: /SELECT (.*) FROM (.*);/i,
};

const question = (query) =>
  new Promise((resolve) => rl.question(query, (answer) => resolve(answer)));

let db_name = "";
let dbs = {};

(async (db_name, dbs) => {
  let cur_db = db_name;
  let datas = dbs;
  while (1) {
    let command = await question("GSCSQL>");
    let isQuit = command.match(/^quit;/i);
    if (isQuit) break;
    else {
      let entries = Object.keys(commandMap);
      let state = "empty";

      for (let i = 0; i < entries.length; i++) {
        let res = command.match(commandMap[entries[i]]);

        if (res) {
          state = entries[i];
          if (state === "useDBSQL") {
            cur_db = res[1];
            data = { foldername: cur_db };
          }
          let newData = parseCommand(cur_db, datas, state, res);
          datas = newData.dbs;
          break;
        }
      }

      nextCommandLoop(state, dbs, cur_db);
    }
  }
  console.log("Good day.");
  rl.close();
})(db_name, dbs);

const nextCommandLoop = (commandType, data, cur_db) => {
  if (
    cur_db === "" &&
    commandType !== "createDBSQL" &&
    commandType !== "showDBSQL" &&
    commandType !== "dropDBSQL"
  ) {
    shell.echo("SELECT A DATABASE FIRST");
    return;
  } else {
    shell.echo(`command is ${commandType}\nresult is ${JSON.stringify(data)}`);
    return;
  }
};
