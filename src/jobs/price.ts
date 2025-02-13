import axios from "axios";
import dayjs from "dayjs";
import fs from "fs";
import client from "src/services/postgres";
import { retry, timeoutablePromise } from "src/utils/helpers";

interface Arguments {
  currency?: string;
  local?: boolean;
}

interface Currency {
  id: number;
  code: string;
  symbol: string;
  name: string;
}

interface Rates {
  [key: string]: {
    [key: string]: number;
  };
}

interface Price {
  currency_id: number;
  date: Date;
  price: number;
}

const DEFAULT_START_DATE = dayjs.utc("2025-01-01");

const handler = async (args: Arguments) => {
  console.log("Initializing price job...");

  await client.connect();

  const currencies = await retry(() =>
    timeoutablePromise(
      client
        .query(`SELECT * FROM currency WHERE code != 'USD';`)
        .then((r) => r.rows as Currency[])
    )
  );

  const currenciesToProcess = currencies.filter(
    (x) => !args.currency || args.currency!.toUpperCase() === x.code
  );

  const to = dayjs.utc();

  for (let i = 0; i < currenciesToProcess.length; i++) {
    const currency = currenciesToProcess[i];

    try {
      console.log(
        `Processing ${currency.code}...(${i + 1}/${currenciesToProcess.length})`
      );

      const lastRecord = await retry(() =>
        timeoutablePromise(
          client
            .query(
              `SELECT date FROM price WHERE currency_id = $1 ORDER BY date DESC LIMIT 1;`,
              [currency.id]
            )
            .then((r) => r?.rows?.[0] as Price)
        )
      );

      if (lastRecord && dayjs.utc(lastRecord.date).isSame(dayjs.utc(), "day"))
        continue;

      const from = lastRecord
        ? dayjs.utc(lastRecord.date).add(1, "day")
        : DEFAULT_START_DATE;

      const rates = await retry(() =>
        timeoutablePromise(
          axios
            .get(
              `https://api.frankfurter.dev/v1/${from
                .toISOString()
                .slice(0, 10)}..${to
                .toISOString()
                .slice(0, 10)}?base=USD&symbols=${currency.code}`
            )
            .then((r) => r.data.rates as Rates)
        )
      );

      if (args.local) {
        fs.writeFileSync(
          `out/price${currency.code}.json`,
          JSON.stringify(rates, null, 2)
        );
      } else {
        const query = `INSERT INTO price (currency_id, date, price) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`;
        for (const [date, { [currency.code]: rate }] of Object.entries(rates)) {
          await retry(() =>
            timeoutablePromise(client.query(query, [currency.id, date, rate]))
          );
        }

        console.log(
          `Updated the database for ${currency.code} ...(${i + 1}/${
            currenciesToProcess.length
          })`
        );
      }
    } catch (err) {
      console.log(
        `An error ocurred while processing currency ${currency.code}`,
        err
      );
    }

    console.log(
      `Finished processing ${currency.code}...(${
        i + 1 + "/" + currenciesToProcess.length
      })`
    );
  }

  await client.end();
  console.log("Finished price job...");
};

export default handler;
