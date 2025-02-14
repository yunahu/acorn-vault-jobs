import 'dotenv/config';

interface Environment {
  PG_USER: string;
  PG_PASSWORD: string;
  PG_HOST: string;
  PG_PORT: number;
  PG_DB: string;
}

const env: Environment = {
  PG_USER: process.env.PG_USER ?? 'postgres',
  PG_PASSWORD: process.env.PG_PASSWORD!,
  PG_HOST: process.env.PG_HOST!,
  PG_PORT: parseInt(process.env.PG_PORT ?? '5432'),
  PG_DB: process.env.PG_DB!,
};

export default env;
