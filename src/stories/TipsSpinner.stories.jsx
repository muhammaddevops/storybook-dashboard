import React from "react";

import { TipsSpinner } from "./TipsSpinner";

export default {
  title: "Example/TipsSpinner",
  component: TipsSpinner,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
};

const Template = (args) => <TipsSpinner {...args} />;

export const Default = Template.bind({});
Default.args = {};
