/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-preset-env': { 
      stage: 0, 
      features: {
        'nesting-rules': true,
      },
    },
  },
};

export default config;
