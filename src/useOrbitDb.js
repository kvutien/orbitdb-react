/* 
 * "custom hook" to call Read/Write functions of an OrbitDB database
 * called by all components of App.js to instanciate an Orbit database of a given type
 * this instance opens an existing database, doesn't create a new one
 * return {state}, an object {the React context, the db interface to the OrbitDB, its records}
 */
import { useEffect, useState, useContext } from "react";
import Logger from "logplease";

import orbitContext from "./orbitContext";

const logger = Logger.create("useOrbitDb");

// accessController object gives "write" authorization only to owner of the instance
// the ID of this owner is in orbitdb passed as argument
const publicRead = (orbitdb) => ({
    accessController: {
        write: [orbitdb.identity.id],
    },
});

// in this demo options.create, options.public are true, so publicWrite is always called
// no argument for publicWrite, because it gives to everybody write and admin rights on this instance
const publicWrite = () => ({
    accessController: {
        write: ["*"],
        admin: ["*"],
    },
});

const useOrbitDb = (address, options = {}) => {
    // "address" and "options" are arguments when called by CounterDemo, EventLogDemo, etc.
    // "address" is the OrbitDB address of each type of database
    // "options" carries the type of database (counter, event, docstore, keywalue)
    const orbit = useContext(orbitContext);
    // "orbit" comes from the Context, in the attribute "value" of the tag "Provider"
    // "value" is set in l. 24 of OrbitProvider, it comes from custom hook "useOrbit"
    // it is a JavaScript object representing an instance of an OrbitDB

    // initialise the state variables "records" and "orbitDb"
    const [records, setRecords] = useState(null);
    const [orbitDb, setDb] = useState(null);

    // triggered by change in either of "orbit", "address", "options"
    useEffect(() => {
        // do nothing when orbitDb is already filled
        if (orbitDb) return;
        // do nothing when address is empty
        if (!address) return;

        const createDb = async () => {
            // define the options used to open the database whose descriptor is in "orbit"
            // we open, we don't create; specific OrbitDB type is "keyvalue",
            // we append and don't overwrite
            const allOptions = {                
                indexBy: "id",
                create: false,
                type: "keyvalue",
                overwrite: false,
                // "..." is spread operator that overwrites the values above with the options in argument
                ...options,
                // set the accessController, using options.create and options.public, arguments by the caller
                // they are always 'true' in this demo
                // if we are creating then options.public controls write access
                ...(options.create && options.public
                ? publicWrite(orbit)
                : publicRead(orbit)),
            };
            logger.debug("calling orbit.open with", address, allOptions);
            // examples of address are given in examples/src/index.html,
            // for example ORBIT_DB_EVENTS, ORBIT_DB_DOCS, ORBIT_DB_KEYVALUE, ORBIT_DB_COUNTER
            const db = await orbit.open(address, allOptions);
            logger.debug("orbitdb.opened", db.address.toString());
            const refreshDb = async () => {
                await db.load();
                // orbitDb and db seem to be the same thing?
                if (!orbitDb) {
                    // update the state variable "db"
                    setDb(db);
                }
                // set the state variable "records"
                if (db.type === "keyvalue") {
                    setRecords({ ...(db.all || {}) });
                } else if (db.type === "eventlog") {
                    const allEvents = await db
                        .iterator({ limit: -1 })
                        .collect()
                        .map((e) => e.payload.value);
                    setRecords([...allEvents] || []);
                } else if (db.type === "docstore") {
                    setRecords(db.query(() => true));
                } else if (db.type === "counter") {
                    setRecords(db.value);
                }
            };

            db.events.on("replicate", (address) => {
                logger.debug("db.events.replicate", address.toString());
                //refreshDb();
            });

            db.events.on("replicated", (address) => {
                logger.debug("db.events.replicated", address.toString());
                refreshDb();
            });

            db.events.on("write", (address) => {
                logger.debug("db.events.write", address.toString());
                refreshDb();
            });
            await refreshDb();
        };
        if (orbit) {
            createDb();
        }
        return () => {
            if (orbitDb) {
                logger.debug("db.close()");
                orbitDb.close();
            }
        };
    }, [orbit, address, options]);

    const state = { orbit, db: orbitDb, records };
    if (orbitDb && orbitDb.type === "counter") {
        state.inc = orbitDb.inc.bind(orbitDb);
        state.value = orbitDb.value;
    }
    return state;
};

export default useOrbitDb;
