import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';

dayjs.extend(utc);

import jobs from 'src/jobs/jobs';

export interface Arguments {
  job: string;
}

const run = async () => {
  const args: Arguments = yargs(hideBin(process.argv))
    .options({
      job: {
        alias: 'j',
        type: 'string',
        demandOption: true,
      },
    })
    .parseSync();

  const handler = jobs[args.job];

  if (!handler) {
    console.error(`Job '${args.job}' does not exist`);
    process.exit(1);
  }

  handler(args);
};

run();
