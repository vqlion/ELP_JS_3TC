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
  if (async) {
    let child = exec(programm, (err, stdout, stderr) => {
      if (err) {
        console.error("Couldn't run", programm);
        return;
      }
      console.log(stdout);
      // console.log("exiting", programm);
    });
    child.on("close", (id) => {
      console.log(child.spawnargs[2], "closed");
      process_index = process_list.indexOf({id: id, name: child.spawnargs[2]})
      process_list.pop(process_index)
    });
  } else {
    child = execSync(programm, { stdio: "inherit" })
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
        child_id = process_list.length
        launch_child(user_input[1], child_id, 1);
        process_list.push({
          id: child_id,
          name: user_input[1],
        });
      } else {
        child_id = process_list.length
        await launch_child(user_input[1], child_id);
        process_list.push({
          id: process_list.length,
          name: user_input[1],
        });
        console.log('here')
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
