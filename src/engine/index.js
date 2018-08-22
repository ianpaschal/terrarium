// Terrarium is distributed under the MIT license.

// TODO: Replace with Aurora
import EngineLite from "./EngineLite";
import movementSystem from "./systems/movement";
import daylightSystem from "./systems/daylight";
import terrainSystem from "./systems/terrain";

const engine = new EngineLite();

engine.addSystem( movementSystem );
engine.addSystem( daylightSystem );
engine.addSystem( terrainSystem );

export default engine;
