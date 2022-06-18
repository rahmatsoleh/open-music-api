const InvariantError = require('../../exceptions/InvarianError');
const { CollaborationPayloadSchema } = require('./schema');

const CollaborationsValidator = {
  validateCollaborationPayload: (payload) => {
    const ValidationResult = CollaborationPayloadSchema.validate(payload);

    if (ValidationResult.error) throw new InvariantError(ValidationResult.error.message);
  },
};

module.exports = CollaborationsValidator;
