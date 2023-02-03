const prompts = require("prompts");
const { exec, execSync } = require("child_process");
const readline = require("readline");
readline.emitKeypressEvents(process.stdin);

process.stdin.setRawMode(true);
process.stdin.resume();

let process_id_list = [];
let process_list = [];

async function launch_child(programm, id, async) {
    return new Promise((resolve, reject) => {
        const child_id = id;
        if (async) {
            let child = exec(
                programm,
                { detached: true },
                (err, stdout, stderr) => {
                    if (err) {
                        reject(child_id);
                    }
                    console.log(stdout);
                    resolve(child_id);
                }
            );
            process_list.push({ id: child_id.id, pid: child.pid });
        } else {
            try {
                resolve(execSync(programm, { stdio: "inherit" }));
            } catch (err) {
                reject(err);
            }
        }
    });
}

async function getInput() {
    const res = await prompts({
        type: "text",
        name: "value",
        message: "",
    });
    return res;
}

function print_processes(list) {
    if (list.length) {
        console.log("name   -   id   -   status");
        for (const proc of list) {
            id = proc.id;
            n = proc.name;
            p = proc.paused;

            console.log(n, "   -   ", id, "   -   ", p ? "paused" : "running");
        }
    } else {
        console.log("No processes were launched yet");
    }
}

function print_help() {
    console.log("Here is a list of the commands:");
    console.log("Use 'run <program>' to launch any program");
    console.log("Use 'run <program> !' to launch any program in background");
    console.log("Use 'lp' to get a list of all the programs launched");
    console.log(
        "Use 'bing [-k|-p|-c] <id>' to kill/pause/resume the program given by its id"
    );
    console.log();
    console.log("To quit the CLI, hit CTRL-P");
}

async function cli() {
    while (true) {
        console.log();
        let res = await getInput();
        let user_input = res.value.split(" ");

        if (user_input[0] == "run") {
            if (user_input[user_input.length - 1] == "!") {
                child_id = {
                    id: process_id_list.length + 1,
                    name: user_input.slice(1, user_input.length - 1).join(" "),
                    paused: false,
                };

                launch_child(
                    user_input.slice(1, user_input.length - 1).join(" "),
                    child_id,
                    1
                )
                    .then((ans) => {
                        console.log(
                            "Closed",
                            user_input.slice(1, user_input.length - 1).join(" ")
                        );
                        let id_index = process_id_list.findIndex(
                            (item) => item.id == ans.id
                        );
                        let process_index = process_list.findIndex(
                            (item) => item.id == ans.id
                        );
                        process_id_list.splice(id_index, 1);
                        process_list.splice(process_index, 1);
                    })
                    .catch((err) => {
                        console.log(
                            "Closed",
                            user_input.slice(1, user_input.length - 1).join(" ")
                        );
                        let id_index = process_id_list.findIndex(
                            (item) => item.id == err.id
                        );
                        let process_index = process_list.findIndex(
                            (item) => item.id == err.id
                        );
                        process_id_list.splice(id_index, 1);
                        process_list.splice(process_index, 1);
                    });

                process_id_list.push(child_id);
            } else {
                child_id = {
                    id: process_id_list.length + 1,
                    name: user_input.slice(user_input.slice(1)).join(" "),
                    paused: false,
                };
                await launch_child(user_input.slice(1).join(" "), child_id)
                    .then((ans) => {})
                    .catch((err) => {});
            }
        } else if (user_input[0] == "lp") {
            print_processes(process_id_list);
        } else if (user_input[0] == "bing") {
            let id_to_kill = parseInt(user_input[2]);
            let pid_to_kill = process_list.find(
                (item) => item.id == id_to_kill
            ).pid;
            if (user_input[1] == "-k") {
                exec(`pkill -9 -P ${pid_to_kill}`);
            } else if (user_input[1] == "-p") {
                exec(`pkill -19 -P ${pid_to_kill}`);
                process_id_list.find(
                    (item) => item.id == id_to_kill
                ).paused = true;
            } else if (user_input[1] == "-c") {
                exec(`pkill -18 -P ${pid_to_kill}`);
                process_id_list.find(
                    (item) => item.id == id_to_kill
                ).paused = false;
            }
        } else if (user_input[0] == "help") {
            print_help();
        } else {
            console.log("Sorry, unrecognized command.");
        }
    }
}

console.log("HI ! I am vCLIon, happy to help you.");
console.log("Type 'help' for a list of the commands.");
cli();

process.stdin.on("keypress", (ch, key) => {
    if (key && key.ctrl && key.name == "p") {
        console.log();
        console.log("Exit command issued. Terminating...");
        process.exit();
    }
});
