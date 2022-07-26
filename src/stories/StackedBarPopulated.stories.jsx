import { StackedBarChartStory } from "./StackedBarPopulated";

export default {
  title: "Example/StackedBarChartStory",
  component: StackedBarChartStory,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
};

const Template = (args) => <StackedBarChartStory {...args} />;

export const Default = Template.bind({});
Default.args = {};
