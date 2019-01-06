// Terrarium is distributed under the MIT license.

// TODO: Replace with Aurora
import { Engine } from "aurora";
import movementSystem from "./systems/movement";
import daylightSystem from "./systems/daylight";
import terrainSystem from "./systems/terrain";

const engine = new Engine();

engine.addSystem( movementSystem );
engine.addSystem( daylightSystem );
engine.addSystem( terrainSystem );

console.log( engine.systems );

export default engine;
