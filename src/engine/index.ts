// Terrarium is distributed under the MIT license.

import { Engine } from "aurora";

// Systems
import movementSystem from "./systems/movement";
import terrainSystem from "./systems/terrain";

// Assemblies
import Player from "./assemblies/Player";
import TerrainChunk from "./assemblies/TerrainChunk";

const engine = new Engine();

engine.addSystem( movementSystem );
engine.addSystem( terrainSystem );

// Add assemblies
engine.addAssembly( Player );
engine.addAssembly( TerrainChunk );

export default engine;
