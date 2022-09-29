const BankAccount = require('../models/bank-account');



exports.getBalance = async (req, res, next) => {

  const userId = req.userId;
  const bankAccount = await BankAccount.findOne({ user: userId });

  const savingAccountBalance = bankAccount.movements.reduce(
    (acc, movement) => (acc += movement.amount),
    0
  );

  const depositAccountBalance = bankAccount.depositDetails.reduce(
    (acc, deposit) => (acc += deposit.sum),
    0
  );

  res.send({ savingAccountBalance, depositAccountBalance });
};

exports.getAccountDetails = async (req, res, next) => {
  
  const userId = req.userId;

  const bankAccount = await BankAccount.findOne({
    user: userId,
  }).populate({ path: 'user', select: 'email address fullName' });

  res.send({
    email: bankAccount.user.email,
    accountType: bankAccount.bankAccountDetails.accountType,
    accountNumber: bankAccount.bankAccountDetails.accountNumber,
    nominee: bankAccount.bankAccountDetails.nominee,
    branch: bankAccount.bankAccountDetails.branch,
    ifsc: bankAccount.bankAccountDetails.ifsc,
    address: bankAccount.user.address ?? '',
    fullName: bankAccount.user.fullName,
  });
};

exports.getCards = async (req, res, next) => {
  const userId = req.userId;

  const bankAccount = await BankAccount.findOne({ user: userId });

  res.send({
    debitCardDetails: bankAccount.debitCardDetails,
    creditCardDetails: bankAccount.creditCardDetails,
  });
};
exports.getLoans = async (req, res, next) => {
  const userId = req.userId;

  const bankAccount = await BankAccount.findOne({ user: userId });

  res.send({ loanAccountDetails: bankAccount.loanAccountDetails });
};

exports.getDeposits = async (req, res, next) => {
  const userId = req.userId;

  const bankAccount = await BankAccount.findOne({ user: userId });

  res.send({ depositDetails: bankAccount.depositDetails });
};

exports.getStatement = async (req, res, next) => {
  const userId = req.userId;

  const bankAccount = await BankAccount.findOne({ user: userId });

  const accountBalance = bankAccount.movements.reduce(
    (acc, movement) => (acc += movement.amount),
    0
  );

  res.send({ accountBalance, movements: bankAccount.movements });
};
