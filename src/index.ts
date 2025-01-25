import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export interface Arguments {
  jobName: string;
}

const run = async () => {
  const args: Arguments = yargs(hideBin(process.argv))
    .options({
      jobName: {
        alias: "j",
        type: "string",
        demandOption: true,
      },
    })
    .parseSync();

  const { default: handler } = await import(`./jobs/${args.jobName}`).catch(
    () => ({})
  );

  if (!handler) {
    console.log(`Job '${args.jobName}' does not exist`);
    process.exit(-1);
  }

  handler(args);
};

run();
