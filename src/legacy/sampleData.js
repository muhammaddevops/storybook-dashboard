import Moment from "moment";

export const lineChartData = {
  labels: [
    Moment("2018-05-18").format("MMM Do"),
    Moment("2018-06-18").format("MMM Do"),
    Moment("2018-07-18").format("MMM Do"),
    Moment("2018-08-18").format("MMM Do"),
    Moment("2018-09-18").format("MMM Do"),
    Moment("2018-10-18").format("MMM Do")
  ],
  datasets: [
    {
      label: "Meeting targets",
      data: [
        {
          x: Moment("2018-05-18").format("MMM Do"),
          y: 34
        },
        {
          x: Moment("2018-06-18").format("MMM Do"),
          y: 38
        },
        {
          x: Moment("2018-07-18").format("MMM Do"),
          y: 39
        },
        {
          x: Moment("2018-08-18").format("MMM Do"),
          y: 5
        },
        {
          x: Moment("2018-09-18").format("MMM Do"),
          y: 4
        },
        {
          x: Moment("2018-10-18").format("MMM Do"),
          y: 2
        }
      ],
      backgroundColor: "#db1919",
      borderColor: "#db1919",
      fill: false
    },
    {
      label: "Reporting",
      data: [
        {
          x: Moment("2018-05-18").format("MMM Do"),
          y: 32
        },
        {
          x: Moment("2018-06-18").format("MMM Do"),
          y: 42
        },
        {
          x: Moment("2018-07-18").format("MMM Do"),
          y: 3
        },
        {
          x: Moment("2018-08-18").format("MMM Do"),
          y: 0
        },
        {
          x: Moment("2018-09-18").format("MMM Do"),
          y: 5
        },
        {
          x: Moment("2018-10-18").format("MMM Do"),
          y: 2
        }
      ],
      backgroundColor: "#095f6e",
      borderColor: "#095f6e",
      fill: false
    }
  ]
};

export const barChartData = {
  labels: [
    Moment("2018-05-18").format("MMM Do"),
    Moment("2018-06-18").format("MMM Do"),
    Moment("2018-07-18").format("MMM Do"),
    Moment("2018-08-18").format("MMM Do"),
    Moment("2018-09-18").format("MMM Do"),
    Moment("2018-10-18").format("MMM Do")
  ],
  datasets: [
    {
      label: "Registered",
      data: [2, 3, 2, 0, 0, 0],
      backgroundColor: "#db1919"
    },
    {
      label: "Reporting",
      data: [2, 2, 0, 0, 5, 0],
      backgroundColor: "#095f6e"
    }
  ]
};

export const iconData = {
  data: ["amber", "red", "green", "grey", "red", "amber", "grey", "grey", "amber", "green", "grey", "red", "amber"]
};

export const metricIconData = {
  labels: [
    Moment("2018-05-18").format("MMM Do"),
    Moment("2018-06-18").format("MMM Do"),
    Moment("2018-07-18").format("MMM Do"),
    Moment("2018-08-18").format("MMM Do"),
    Moment("2018-09-18").format("MMM Do"),
    Moment("2018-10-18").format("MMM Do")
  ],
  datasets: [
    {
      label: "CO2 Emissions",
      data: [2, 3, 2, 0, 0, 0],
      backgroundColor: "#db1919"
    }
  ]
};

export const metricIconData2 = {
  labels: [
    Moment("2018-05-18").format("MMM Do"),
    Moment("2018-06-18").format("MMM Do"),
    Moment("2018-07-18").format("MMM Do"),
    Moment("2018-08-18").format("MMM Do"),
    Moment("2018-09-18").format("MMM Do"),
    Moment("2018-10-18").format("MMM Do")
  ],
  datasets: [
    {
      label: "Tons",
      data: [2, 5, 2, 3, 7, 9],
      backgroundColor: "#db1919"
    }
  ]
};

export const testData = {
  "Air Quality": {
    color: "green",
    thresholds: [1, 3],
    data: Object.assign({}, metricIconData2),
    sliderValues: {
      max: 5,
      min: 0
    }
  },
  Award: {
    color: "green",
    thresholds: [1, 3],
    data: Object.assign({}, metricIconData),
    sliderValues: {
      max: 5,
      min: 0
    }
  },
  Biodiversity: {
    color: "green",
    thresholds: [1, 3],
    data: Object.assign({}, metricIconData),
    sliderValues: {
      max: 5,
      min: 0
    }
  },
  Carbon: {
    color: "green",
    thresholds: [1, 3],
    data: Object.assign({}, metricIconData2),
    sliderValues: {
      max: 5,
      min: 0
    }
  },
  Community: {
    color: "green",
    thresholds: [1, 3],
    data: Object.assign({}, metricIconData),
    sliderValues: {
      max: 5,
      min: 0
    }
  },
  "Environmental Management": {
    color: "green",
    thresholds: [1, 3],
    data: Object.assign({}, metricIconData),
    sliderValues: {
      max: 5,
      min: 0
    }
  },
  Ethics: {
    color: "green",
    thresholds: [1, 3],
    data: Object.assign({}, metricIconData),
    sliderValues: {
      max: 5,
      min: 0
    }
  },
  "Health & Safety": {
    color: "green",
    thresholds: [1, 3],
    data: Object.assign({}, metricIconData),
    sliderValues: {
      max: 5,
      min: 0
    }
  },
  Procurement: {
    color: "green",
    thresholds: [1, 3],
    data: Object.assign({}, metricIconData2),
    sliderValues: {
      max: 5,
      min: 0
    }
  },
  Materials: {
    color: "green",
    thresholds: [1, 3],
    data: Object.assign({}, metricIconData),
    sliderValues: {
      max: 10,
      min: 0
    }
  },
  Waste: {
    color: "green",
    thresholds: [2, 5],
    data: Object.assign({}, metricIconData),
    sliderValues: {
      max: 5,
      min: 0
    }
  },
  Water: {
    color: "green",
    thresholds: [1, 3],
    data: Object.assign({}, metricIconData),
    sliderValues: {
      max: 5,
      min: 0
    }
  },
  Employees: {
    color: "amber",
    thresholds: [1, 3],
    data: Object.assign({}, metricIconData),
    sliderValues: {
      max: 5,
      min: 0
    }
  }
};
