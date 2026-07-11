const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

/**
 * User Schema — Covers both Realtors and Admins.
 * Role is differentiated by the `role` field.
 */
const bankDetailsSchema = new mongoose.Schema({
  bankName:      { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  accountName:   { type: String, default: '' },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    // ---- Identity ------------------------------------------------------
    fullName: {
      type:     String,
      required: [true, 'Full name is required'],
      trim:     true,
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    phone: {
      type:     String,
      required: [true, 'Phone number is required'],
    },
    password: {
      type:     String,
      required: [true, 'Password is required'],
      select:   false,  // Never return password in queries
    },

    // ---- Role & Status -------------------------------------------------
    role: {
      type:    String,
      enum:    ['realtor', 'admin'],
      default: 'realtor',
    },
    // Realtors start as PENDING until an admin approves them
    status: {
      type:    String,
      enum:    ['pending', 'approved', 'suspended'],
      default: 'pending',
    },

    // ---- Referral Network ----------------------------------------------
    referralCode: {
      type:   String,
      unique: true,
    },
    referredBy: {
      type:    String,  // The upline realtor's referralCode
      default: null,
    },

    // ---- Office Location -----------------------------------------------
    officeLocation: {
      type: String,
      enum: ['Aba', 'Asaba', 'Port Harcourt', 'Abuja', 'Anambra', 'Other'],
    },

    // ---- Subscription Plan ---------------------------------------------
    subscriptionPlan: {
      type: String,
      default: 'None',
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    paymentReference: {
      type: String,
      default: '',
    },

    // ---- Financials ----------------------------------------------------
    bankDetails:       { type: bankDetailsSchema, default: {} },
    totalEarnings:     { type: Number, default: 0 },   // Cumulative commissions credited
    pendingPayout:     { type: Number, default: 0 },   // Approved but unpaid
    totalPaidOut:      { type: Number, default: 0 },   // All-time paid
  },
  {
    timestamps: true,
  }
);

// ---- Pre-save Hook: Hash password before storing -------------------
userSchema.pre('save', async function (next) {
  // Only hash if the password field has been modified
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ---- Instance Method: Compare plain-text password with hash --------
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ---- Pre-save Hook: Auto-generate referral code --------------------
userSchema.pre('save', function (next) {
  if (!this.referralCode) {
    const namePart = this.fullName.split(' ')[0].toUpperCase().slice(0, 8);
    const randPart = Math.floor(10 + Math.random() * 90); // 2-digit number
    this.referralCode = `GW-${namePart}-${randPart}`;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
