const mongoose = require('mongoose');
const Book = require('./book');

const authorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  first_name: { type: String, required: true },
  family_name: { type: String, required: true },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

authorSchema.virtual('age').get(function () {
  const birthDate = this.date_of_birth;
  const deathDate = this.date_of_death || new Date();

  const ageInMilliseconds = deathDate - birthDate;
  const ageInYears = ageInMilliseconds / (365 * 24 * 60 * 60 * 1000);

  return Math.floor(ageInYears);
});

authorSchema.set('toJSON', { virtuals: true });

authorSchema.pre('remove', function (next) {
  Book.find({ author: this.id }, (err, books) => {
    if (err) {
      next(err);
    } else if (books.length > 0) {
      next(new Error('This author has books still'));
    } else {
      next();
    }
  });
});

module.exports = mongoose.model('Author', authorSchema);
