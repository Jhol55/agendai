import axios from 'axios';

// export const api = axios.create({
//   baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

export const api = (test: boolean) => {
  return axios.create({
    baseURL: `${test ? process.env.NEXT_PUBLIC_TEST_API_URL : process.env.NEXT_PUBLIC_API_URL}`,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
