import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export interface Arguments {
  job: string;
}

const run = async () => {
  const args: Arguments = yargs(hideBin(process.argv))
    .options({
      job: {
        alias: "j",
        type: "string",
        demandOption: true,
      },
    })
    .parseSync();

  const { default: handler } = await import(`./jobs/${args.job}`).catch(
    () => ({})
  );

  if (!handler) {
    console.log(`Job '${args.job}' does not exist`);
    process.exit(1);
  }

  handler(args);
};

run();
