const mongoose = require("mongoose");
const { DateTime } = require("luxon");

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
						fullname = this.family_name + ", " + this.first_name;
					}

					return fullname;
				},
			},
			url: {
				get() {
					return `/catalog/authors/${this._id}`;
				},
			},
			lifespan: {
				get() {
					return (
						DateTime.fromJSDate(this.date_of_birth).toLocaleString(
							DateTime.DATE_MED
						) +
						" - " +
						DateTime.fromJSDate(this.date_of_death).toLocaleString(
							DateTime.DATE_MED
						)
					);
				},
			},
		},
	}
);

module.exports = mongoose.model("Author", AuthorSchema);
