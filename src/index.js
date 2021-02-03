import React from "react";
import ReactDOM from "react-dom";
import "leaflet/dist/leaflet.css";
import {MapComponent} from "./fcav";
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#424242"
    },
    secondary: {
      main: "#212121"
    }
  }
});

const rootElement = document.getElementById("app");
ReactDOM.render(
  <ThemeProvider theme={theme}>
    <MapComponent />,
    </ThemeProvider>,
  rootElement
);
