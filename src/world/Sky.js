import FS from "fs";
import {
	BoxBufferGeometry,
	Mesh,
	Vector3,
	UniformsUtils,
	BackSide,
	ShaderMaterial
} from "three";

class Sky {
	constructor() {
		const uniforms = {
			luminance: {
				value: 1
			},
			turbidity: {
				value: 2
			},
			rayleigh: {
				value: 1
			},
			mieCoefficient: {
				value: 0.005
			},
			mieDirectionalG: {
				value: 0.8
			},
			sunPosition: {
				value: new Vector3( 1, 0, 1 )
			}
		};

		const material = new ShaderMaterial({
			fragmentShader: FS.readFileSync( "./resources/shaders/sky.frag", {
				"encoding": "utf8"
			}),
			vertexShader: FS.readFileSync( "./resources/shaders/sky.vert", {
				"encoding": "utf8"
			}),
			uniforms: UniformsUtils.clone( uniforms ),
			side: BackSide
		});

		return new Mesh( new BoxBufferGeometry( 1, 1, 1 ), material );
	}
}

export default Sky;
