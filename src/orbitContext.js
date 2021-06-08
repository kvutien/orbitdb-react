/* 
 * quote React docs: “Context provides a way to pass data through the component tree
 * without having to pass props down manually at every level.”
 * The following component follows the example given by React
 */
import { createContext } from "react";

const orbitContext = createContext(null);

export default orbitContext;
