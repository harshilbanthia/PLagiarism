import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserSettings {
  openaiApiKey?: string;
  huggingfaceApiKey?: string;
  sensitivity: number;
}

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  settings: IUserSettings;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    settings: {
      openaiApiKey: { type: String, default: '' },
      huggingfaceApiKey: { type: String, default: '' },
      sensitivity: { type: Number, default: 0.7, min: 0, max: 1 },
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// Remove sensitive fields from serialised output
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  if (obj.settings?.openaiApiKey) obj.settings.openaiApiKey = '***';
  if (obj.settings?.huggingfaceApiKey) obj.settings.huggingfaceApiKey = '***';
  return obj;
};

export const User = mongoose.model<IUser>('User', UserSchema);
export default User;
