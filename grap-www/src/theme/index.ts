import {black, green, grey, red, white} from "./colors";

const theme = {
  borderRadius: 0,
  breakpoints: {
    mobile: 400,
  },
  color: {
    green,
    black,
    grey,
    red,
    primary: {
      light: red[200],
      main: red[500],
    },
    secondary: {
      main: green[500],
    },
    white,
    ongoing: green[500],
    successful: green[500],
    fail: red[500],
  },
  siteWidth: 1200,
  spacing: {
    1: 4,
    2: 8,
    3: 16,
    4: 24,
    5: 32,
    6: 48,
    7: 64,
  },
  topBarSize: 72,
};

export default theme;
