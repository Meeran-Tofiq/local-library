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
			date_of_birth_formatted: {
				get() {
					return this.date_of_birth
						? DateTime.fromJSDate(
								this.date_of_birth
						  ).toLocaleString(DateTime.DATE_MED)
						: " ";
				},
			},
			date_of_death_formatted: {
				get() {
					return this.date_of_death
						? DateTime.fromJSDate(
								this.date_of_death
						  ).toLocaleString(DateTime.DATE_MED)
						: " ";
				},
			},
			lifespan: {
				get() {
					return (
						this.date_of_birth_formatted +
						" - " +
						this.date_of_death_formatted
					);
				},
			},
		},
	}
);

module.exports = mongoose.model("Author", AuthorSchema);
