import { body, validationResult } from 'express-validator';

// validation ליצירת דמות
export const validateCreateCharacter = [
  body('inlognaam')
    .trim()
    .isLength({ min: 4, max: 12 })
    .withMessage('שם המשתמש חייב להכיל בין 4 ל-12 תווים')
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage('שם המשתמש יכול להכיל רק אותיות ומספרים באנגלית'),
  
  body('wereld')
    .isIn(['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola'])
    .withMessage('העולם שנבחר אינו תקין'),
  
  body('character')
    .notEmpty()
    .withMessage('יש לבחור דמות'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'שגיאות בנתונים שהוזנו',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg
        }))
      });
    }
    next();
  }
];

// validation כללי
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'שגיאות בנתונים שהוזנו',
      errors: errors.array()
    });
  }
  next();
};
