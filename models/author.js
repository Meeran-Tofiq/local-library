const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema(
	{
		first_name: { type: String, required: true, max_length: 100 },
		family_name: { type: String, required: true, max_length: 100 },
		date_of_birth: { type: Date },
		date_of_death: { type: Date },
	},
	{
		virtuals: {
			name: {
				get() {
					let fullname = "";

					if (this.first_name && this.family_name) {
						fullname = first_name + " " + family_name;
					}

					return fullname;
				},
			},
			url: {
				get() {
					return `/catalog/authors/${this._id}`;
				},
			},
		},
	}
);

module.exports = mongoose.model("Author", AuthorSchema);
