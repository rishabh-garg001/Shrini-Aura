const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const message = error.details.map(d => d.message.replace(/"/g, '')).join(', ');
    return res.status(400).json({ message });
  }
  next();
};

const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  createOrder: Joi.object({
    orderItems: Joi.array().items(Joi.object({
      product: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
    })).min(1).required(),
    shippingAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      pincode: Joi.string().length(6).pattern(/^\d+$/).required(),
      phone: Joi.string().min(10).required(),
    }).required(),
    paymentMethod: Joi.string().default('razorpay'),
  }),
  review: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().min(5).max(500).required(),
  }),
};

module.exports = { validate, schemas };
