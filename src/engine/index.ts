// Terrarium is distributed under the MIT license.

import { Engine } from "aurora";
import movementSystem from "./systems/movement";
import terrainSystem from "./systems/terrain";

const engine = new Engine();

engine.addSystem( movementSystem );
engine.addSystem( terrainSystem );

export default engine;
