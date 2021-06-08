/* 
 * Functional component, called by index.App as a rendered tag
 * Set up an OrbitDB node: define IPFS configuration, set up IPFS node
 * setup OrbitDB database, create the React "context" for orbitDB props
 */
import React, { useEffect, useState } from "react";

import DEFAULT_IPFS_CONFIG from "./ipfs-config";
import useIpfs from "./useIpfs";
import useOrbit from "./useOrbit";
import orbitContext from "./orbitContext";

// In React documentation, every context object comes with a "Provider" React component 
// It is the "Provider" that allows the context to be consumed by other components
// OrbitProvider is called in next line with a config and a set of props, that will be added to Provider Context
const OrbitProvider = ({ config = DEFAULT_IPFS_CONFIG, ...props }) => {
    const [ipfs] = useIpfs(config);
    const [orbit] = useOrbit(ipfs);
    const [value, setValue] = useState(null);
    const { Provider } = orbitContext;
    useEffect(() => {
        if (ipfs && orbit) {
            // store the database instance in state variable 'value', used as React Context
            setValue(orbit);
        }
    }, [ipfs, orbit]);
    // set the React OrbitDB context with the props given in argument
    // syntax of this tag, including the attribute "value", is dictated by React
    // here "value" is set to "orbit" in line 22, making "orbit" available everywhere
    return <Provider value={value} {...props} />;
};

export default OrbitProvider;
