/* 
 * "custom hook" to setup an IPFS node calling IPFS.create()
 * called by functional component OrbitProvider.js
 * return [ipfs], array of 1 object to interface to IPFS
 */
import { useEffect, useState } from "react";
import Logger from "logplease";
import IPFS from "ipfs";

const logger = Logger.create("useIpfs");

// window.ipfsLoaded hack to keep a global ipfs instance
const useIpfs = (config) => {
    const [ipfs, setIpfs] = useState(null);

    useEffect(() => {
        const ipfsInit = async () => {
            // logger.info("ipfsInit, IPFS config as in object 'config':", config);
            if (typeof window !== "undefined" && window.ipfsLoaded) {
                setIpfs(window.ipfsLoaded);
                return;
            }
            // start an IPFS node if not exists
            const ipfs = await IPFS.create(config);
            logger.info("ipfsInit, object 'ipfs.id':", await ipfs.id());
            // keep ipfs in window.ipfs to avoid the next calls to spawn another IPFS node
            if (typeof window !== "undefined") window.ipfsLoaded = ipfs;
            // log the peerID of the node
            const peerId = (await ipfs.id()).id;
            logger.info("IPFS: connected as peerId=", peerId);
            // save in the state variable ipfs
            setIpfs(ipfs);
        };
        ipfsInit();
        return () => {
            if (ipfs) {
                logger.debug("ipfs.stop()");
                ipfs.stop();
            }
        };
    }, [ipfs, config]);

    return [ipfs];
};

export default useIpfs;
