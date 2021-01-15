import React from "react";
import ReactDOM from "react-dom";
import "leaflet/dist/leaflet.css";
import {MapComponent} from "./fcav";
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Button from "@material-ui/core/Button";

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
