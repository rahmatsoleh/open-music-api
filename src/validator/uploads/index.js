const InvariantError = require('../../exceptions/InvarianError');
const ImageHeadersSchema = require('./schema');

const UploadsValidator = {
  validateImageHeaders: (headers) => {
    const validationResult = ImageHeadersSchema.validate(headers);

    if (validationResult.error) throw new InvariantError(validationResult.error.message);
  },
};

module.exports = UploadsValidator;
