const passwordValidator = require('password-validator');

const passwordSchema = new passwordValidator();

// Add properties to the schema
passwordSchema
  .is().min(8)
  .is().max(32)
  .has().uppercase()
  .has().lowercase()
  .has().digits()
  .has().not().spaces()
  .is().not().oneOf(['Passw0rd', 'Password123']);

const validatePassword = (req, res, next) => {
    const password = req.body.password;

    if (!passwordSchema.validate(password)) {
        res.status(400).json({message: "Le mot de passe ne respecte pas les critères de sécurité"});
    } else {
        next();
    };
};

module.exports = validatePassword;