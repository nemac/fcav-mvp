import React from "react";
import ReactDOM from "react-dom";
import "leaflet/dist/leaflet.css";
import {App} from "./fcav";
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

export const theme = createMuiTheme({
  overrides: {
     MuiAppBar: {
       colorPrimary: {
         backgroundColor: "#FFC0CB" // Pink AppBar
       }     }   },
  palette: {
    primary: {
      main: "#424242",
      backgroundColor: "#424242"
    },
    secondary: {
      main: "#e0e0e0"
    }
  }
});
const rootElement = document.getElementById("app");
ReactDOM.render(
  <ThemeProvider theme={theme}>
    <App/>,
    </ThemeProvider>,
  rootElement
);
