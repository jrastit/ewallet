module.exports = {
  module: {
    rules: [
      {
        test: /\.bin$/i,
        use: [
          {
            loader: 'raw-loader',
          },
        ],
      },
      {
        test: /\.abi$/i,
        use: [
          {
            loader: 'raw-loader',
          },
        ],
      },
    ],
  },
};
