const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bankAccountSchema = new Schema({
  user: {
    type: mongoose.ObjectId,
    ref: 'User',
  },

  bankAccountDetails: {
    accountNumber: {
      type: String,
      default: Math.floor(Math.random() * Math.pow(10, 12))
        .toString()
        .padStart(12, 0),
    },
    accountType: {
      type: String,
      default: 'Saving',
    },

    ifsc: {
      type: String,
      default: 'PLSO012345',
    },
    branch: {
      type: String,
      default: 'Metro Tower, Palasia Indore, MP',
    },
    nominee: {
      type: String,
      default: '',
    },
  },
  debitCardDetails: {
    cardType: {
      type: String,
      default: 'Premium Debit Card',
    },
    cardNumber: {
      type: String,
      default: Math.floor(Math.random() * Math.pow(10, 16))
        .toString()
        .padStart(16, 0),
    },
    validity: {
      type: String,
      default: '12/30',
    },
    cvv: {
      type: Number,
      default: 123,
    },
    cardPin: {
      type: Number,
      default: 0000,
    },
    POSLimit: {
      type: Number,
      default: 20000,
    },
    withdrawalLimit: {
      type: Number,
      default: 50000,
    },
  },
  creditCardDetails: {
    cardType: {
      type: String,
      default: 'Premium Credit Card',
    },
    cardNumber: {
      type: String,
      default: Math.floor(Math.random() * Math.pow(10, 16))
        .toString()
        .padStart(16, 0),
    },
    validity: {
      type: String,
      default: '12/30',
    },
    cvv: {
      type: Number,
      default: 123,
    },
    cardPin: {
      type: Number,
      default: 0000,
    },
    POSLimit: {
      type: Number,
      default: 20000,
    },
    withdrawalLimit: {
      type: Number,
      default: 50000,
    },
  },
  loanAccountDetails: [
    {
      loanAccountNumber: String,
      loanType: String,
      period: {
        type: Number,
        default: 5,
      },
      sum: {
        type: String,
        default: '5,00,000',
      },
      emi: {
        type: String,
        default: '12,000',
      },
    },
  ],
  depositDetails: [
    {
      sum: Number,
      rate: String,
      maturityDate: String,
      maturityValue: String,
      interest: String,
    },
  ],
  movements: [
    {
      amount: Number,
      time: String,
      remark: String,
    },
  ],
});

module.exports = mongoose.model('Bank Account', bankAccountSchema);
