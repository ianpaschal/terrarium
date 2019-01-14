import { Entity } from "aurora";
export default new Entity({
	"type": "terrain-chunk",
	"components": [
		{
			"type": "buffer-geometry",
			"data": {
				"index": [],
				"position": [],
				"normal": [],
				"uv": []
			}
		},
		{
			"type": "voxel-data",
			"data": []
		},
		{
			"type": "position",
			"data": {
				"x": 0,
				"y": 0,
				"z": 0
			}
		}
	]
});
