module.exports = {
  stories: [
    // "./stories/**/*.stories.mdx",
    // "./stories/**/*.stories.@(js|jsx|ts|tsx)",
    './stories/geom-point/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],
  addons: [
    { name: '@storybook/addon-links' },
    {
      name: '@storybook/addon-essentials',
      options: {
        backgrounds: false,
      },
    },
    { name: '@storybook/preset-typescript' },
    // "@storybook/addon-storysource"
  ],
}
