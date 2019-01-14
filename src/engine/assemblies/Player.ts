import { Entity } from "aurora";

export default new Entity({
	type: "player",
	components: [
		{
			type: "player-input",
			data: {
				x: 0,
				y: 0,
				z: 0
			}
		},
		{
			type: "player-index",
			data: 0
		},
		{
			type: "velocity",
			data: {
				x: 0,
				y: 0,
				z: 0
			}
		},
		{
			type: "position",
			data: {
				x: 0,
				y: 0,
				z: 0
			}
		}
	]
});
