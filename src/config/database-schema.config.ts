import { mongoose } from '@typegoose/typegoose';

export const getDefaultDatabaseSchemaOptions = (): mongoose.SchemaOptions => ({
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
  autoIndex: false,
  timestamps: true,
  versionKey: false,
});
