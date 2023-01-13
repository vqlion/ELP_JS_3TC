const prompt = require("prompt");
// const spawn = require("./test_spawn");
const { exec, spawn, execSync, execFile } = require("child_process");
const { spawnSync } = require("child_process");
const readline = require("readline");
readline.emitKeypressEvents(process.stdin);

prompt.message = "";
prompt.delimiter = "";

process.stdin.setRawMode(true);
process.stdin.resume();

console.log("HI ! I am hello.js, happy to serve you");
let process_list = [];

prompt.properties = {
  input: {
    message: "\u200B",
  },
};

function launch_child(programm, async) {
  //   const pg = spawnSync(programm);
  if (async) {
    exec(programm, (err, stdout, stderr) => {
      if (err) {
        console.error("Couldn't run", programm);
        return;
      }
      console.log("output:");
      console.log(stdout);
    });
  } else {
    execFile(programm, (err, stdout, stderr) => {
      if (err) {
        console.error("Couldn't run", programm);
        return;
      }
      console.log("output:");
      console.log(stdout);
    });
  }
}

async function getInput() {
  prompt.start();
  let input = await prompt.get(["input"]);
  return input.input;
}

async function run() {
  while (true) {
    console.log();
    let user_input_str = await getInput();
    let user_input = user_input_str.split(" ");
    if (user_input[0] == "run") {
      if (user_input[user_input.length - 1] == "!") {
        launch_child(user_input[1], 1);
        process_list.push({
          id: process_list.length,
          name: user_input[1],
        });
      } else {
        launch_child(user_input[1]);
        process_list.push({
          id: process_list.length,
          name: user_input[1],
        });
      }
    } else if (user_input[0] == "lp") {
      console.log(process_list);
    }
  }
}

run();

process.stdin.on("keypress", (ch, key) => {
  if (key && key.ctrl && key.name == "p") {
    console.log();
    console.log("Exit command issued. Terminating...");
    process.exit();
  }
});
