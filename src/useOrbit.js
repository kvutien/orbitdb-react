/* 
 * "custom hook" to setup an access descriptor to an OrbitJS database
 * called by functional component OrbitProvider.js
 * return [orbit], array with 1 object to interface to the database
 */
import { useEffect, useState } from "react";
import OrbitDB from "orbit-db";
import Logger from "logplease";

const logger = Logger.create("useOrbit");

const useOrbit = (ipfs) => {
    const [orbit, setOrbit] = useState(null);

    useEffect(() => {
        const createInstance = async () => {
            // create an instance of Orbit database descriptor
            const instance = await OrbitDB.createInstance(ipfs);
            logger.info( "object 'orbit.identity._id'",instance.identity._id);
            // store the database instance in state variable 'orbit'
            setOrbit(instance);
        };
        if (ipfs) createInstance();
        return () => {
            if (orbit && orbit.stop) {
                logger.debug("orbit.stop()");
                orbit.stop();
            }
        };
    }, [ipfs]);
    return [orbit];
};

export default useOrbit;
