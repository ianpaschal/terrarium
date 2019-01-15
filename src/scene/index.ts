import { Fog, Scene } from "three";
import cursor from "./cursor";
import terrain from "./terrain";
import daylightSystem from "./daylightSystem";

const scene = new Scene();
scene.fog = new Fog( 0xffffff, 0, 512 );
scene.add( daylightSystem );
scene.add( terrain );
scene.add( cursor );
export default scene;
