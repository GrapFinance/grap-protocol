import {createContext} from "react";
import {WinesContext} from "./types";

const context = createContext<WinesContext>({
  wines: [],
});

export default context;
