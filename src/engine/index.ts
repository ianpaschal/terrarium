// Terrarium is distributed under the MIT license.

import { Engine } from "aurora";
// import movementSystem from "./systems/movement";
import terrainGenerationSystem from "./systems/terrainGeneration";

const engine = new Engine();

// engine.addSystem( movementSystem );
engine.addSystem( terrainGenerationSystem );

export default engine;
