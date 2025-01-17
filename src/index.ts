import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

export interface Argv {
  _: (string | number)[];
  jobName: string;
  local: boolean | undefined;
  currency: string | undefined;
  [x: string]: unknown;
  $0: string;
}

const run = async () => {
  const argv: Argv = yargs(hideBin(process.argv))
    .options({
      jobName: {
        alias: "j",
        type: "string",
        demandOption: true,
      },
      local: {
        alias: "l",
        type: "boolean",
      },
      currency: {
        alias: "c",
        type: "string",
      },
    })
    .parseSync();

  const { default: handler } = await import(`./jobs/${argv.jobName}`);
  handler(argv);
};

run();
