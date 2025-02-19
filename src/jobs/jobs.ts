import price from './price/price';

interface Jobs {
  [key: string]: Function;
}

const jobs: Jobs = {
  price,
};

export default jobs;
