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
let process_id_list = [];
let process_list = [];

prompt.properties = {
  input: {
    message: "\u200B",
  },
};

async function launch_child(programm, id, async) {
  const child_id = id;
  if (async) {
    let child = exec(programm, { detached: true }, (err, stdout, stderr) => {
      if (err) {
        console.error("Couldn't run", programm);
        return;
      }
      console.log(stdout);
      // console.log("exiting", programm);
    });
    child.on("close", () => {
      console.log(child.spawnargs[2], "closed");
      process_id_list.splice(child_id.id - 1, 1);
    });
    // child_id.pid = child.pid;
    // console.log(child_id);
    return child;
  } else {
    let child = execSync(programm, { stdio: "inherit" });
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
          id: process_id_list.length + 1,
          name: user_input.slice(1, user_input.length - 1).join(" "),
          paused: false,
        };
        process_list.push(
          launch_child(
            user_input.slice(1, user_input.length - 1).join(" "),
            child_id,
            1
          )
        );
        process_id_list.push(child_id);
      } else {
        child_id = {
          id: process_id_list.length + 1,
          name: user_input.slice(user_input.slice(1)).join(" "),
          paused: false,
        };
        await launch_child(user_input.slice(1).join(" "), child_id);
        console.log("here");
      }
    } else if (user_input[0] == "lp") {
      console.log(process_id_list);
    } else if (user_input[0] == "bing") {
      id_to_kill = parseInt(user_input[2]);
      pid_to_kill = process_id_list[id_to_kill - 1].pid;
      if (user_input[1] == "-k") {
        exec(`pkill -9 -P ${pid_to_kill}`);
      } else if (user_input[1] == "-p") {
        exec(`pkill -19 -P ${pid_to_kill}`);
        process_id_list[id_to_kill - 1].paused = true;
      } else if (user_input[1] == "-c") {
        exec(`pkill -18 -P ${pid_to_kill}`);
        process_id_list[id_to_kill - 1].paused = false;
      }
    } else {
      console.log("Sorry, unrecognized command.");
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
