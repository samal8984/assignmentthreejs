/** @type {import('next').NextConfig} */
  import path from 'path'
const nextConfig = {  webpack: (config, { isServer }) => {
    
    config.module.rules.push({
      test: /\.glb$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            outputPath: 'static/models/',
            publicPath: '/files/drift_race_track_free.glb',
          },
        },
      ],
    });

    return config;
  },



};

export default nextConfig;
