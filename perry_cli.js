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

console.log("HI ! I am perry the placlipus, happy to serve you");
let process_list = [];

prompt.properties = {
  input: {
    message: "\u200B",
  },
};

async function launch_child(programm, id, async) {
  const child_id = id;
  if (async) {
    let child = exec(programm, (err, stdout, stderr) => {
      if (err) {
        console.error("Couldn't run", programm);
        return;
      }
      console.log(stdout);
      // console.log("exiting", programm);
    });
    child.on("close", () => {
      console.log(child.spawnargs[2], "closed");
      console.log(child_id);
      process_list.splice(child_id.id, 1);
    });
  } else {
    child = execSync(programm, { stdio: "inherit" });
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
        child_id = {
          id: process_list.length,
          name: user_input[1],
        };
        launch_child(user_input[1], child_id, 1);
        process_list.push(child_id);
      } else {
        await launch_child(user_input[1], child_id);
        console.log("here");
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
