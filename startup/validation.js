import Joi from "joi";
import joiObjectid from "joi-objectid";

export default () => {
  Joi.objectId = joiObjectid(Joi);
};
