const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GenreSchema = new Schema(
	{
		name: { type: String, required: true, min_length: 3, max_length: 100 },
	},
	{
		virtuals: {
			url: {
				get() {
					return `/catalog/genre/${this._id}`;
				},
			},
		},
	}
);

module.exports = mongoose.model("Genre", GenreSchema);
