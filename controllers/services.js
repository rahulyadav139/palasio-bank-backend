const bcryptjs = require('bcryptjs');

const User = require('../models/user');
const BankAccount = require('../models/bank-account');

exports.postChangePassword = async (req, res, next) => {
  const userId = req.userId;

  if (userId === '622db2cd70d5230aeae51935') {
    return res.status(401).send({
      message:
        "Are you kidding me? You can't do that. This doesn't belong to you!",
    });
  }

  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(userId);

  const isMatched = await bcryptjs.compare(oldPassword, user.password);

  if (!isMatched) {
    return res.status(401).send({ message: 'Incorrect password' });
  }

  const encodedPassword = await bcryptjs.hash(newPassword, 12);

  await user.updateOne({
    password: encodedPassword,
  });

  user.save();

  res.send({ message: 'password changed successfully!' });
};

exports.postChangeAddress = async (req, res, next) => {
  const userId = req.userId;

  const { newAddress, password } = req.body;

  const user = await User.findOne({ _id: userId });

  const isMatched = await bcryptjs.compare(password, user.password);

  if (!isMatched) {
    return res.status(401).send({ message: 'Incorrect password' });
  }

  await user.updateOne({ address: newAddress });

  user.save();

  res.send({ message: 'Address changed successfully!' });
};

exports.getUpgrade = async (req, res, next) => {
  const userId = req.userId;

  const bankAccount = await BankAccount.findOne({ user: userId });

  res.send({
    debitCardType: bankAccount.debitCardDetails.cardType,
    creditCardType: bankAccount.creditCardDetails.cardType,
    accountType: bankAccount.bankAccountDetails.accountType,
  });
};

exports.postUpgrade = async (req, res, next) => {
  const userId = req.userId;

  const { upgradeType, upgradeTo, password } = req.body;

  const bankAccount = await BankAccount.findOne({ user: userId }).populate(
    'user'
  );

  const isMatched = await bcryptjs.compare(password, bankAccount.user.password);

  if (!isMatched) {
    return res.status(401).send({ message: 'Incorrect password' });
  }

  const debitCardDetails = bankAccount.debitCardDetails;
  const creditCardDetails = bankAccount.creditCardDetails;
  const bankAccountDetails = bankAccount.bankAccountDetails;

  switch (upgradeType) {
    case 'debit':
      await bankAccount.updateOne({
        debitCardDetails: { ...debitCardDetails, cardType: upgradeTo },
      });
      break;
    case 'credit':
      await bankAccount.updateOne({
        creditCardDetails: { ...creditCardDetails, cardType: upgradeTo },
      });
      break;
    default:
      await bankAccount.updateOne({
        bankAccountDetails: { ...bankAccountDetails, accountType: upgradeTo },
      });
      break;
  }

  res.send({ message: 'successfully upgraded!' });
};

exports.postLoan = async (req, res, next) => {
  const userId = req.userId;
  const newLoanDetails = req.body;

  const bankAccount = await BankAccount.findOneAndUpdate(
    { user: userId },
    { $push: { loanAccountDetails: newLoanDetails } }
  );

  res.send({ message: 'new loan added successfully!' });
};

exports.postNominee = async (req, res, next) => {
  const userId = req.userId;
  const { nomineeDetails, password } = req.body;

  const bankAccount = await BankAccount.findOne({ user: userId }).populate(
    'user'
  );

  const bankAccountDetails = bankAccount.bankAccountDetails;

  const isMatched = await bcryptjs.compare(password, bankAccount.user.password);

  if (!isMatched) {
    return res.status(401).send({ message: 'Incorrect password' });
  }

  await bankAccount.updateOne({
    bankAccountDetails: { ...bankAccountDetails, nominee: nomineeDetails },
  });

  res.send({ message: 'nominee details added successfully!' });
};

exports.postFixedDeposit = async (req, res, next) => {
  const userId = req.userId;

  const newFD = req.body;

  const bankAccount = await BankAccount.findOne({ user: userId });

  const savingAccountBalance = bankAccount.movements.reduce(
    (acc, movement) => (acc += movement.amount),
    0
  );

  if (newFD.sum > savingAccountBalance) {
    return res.status(404).send({ message: 'Insufficient balance!' });
  }

  await bankAccount.updateOne({ $push: { depositDetails: newFD } });

  await bankAccount.updateOne({
    $push: {
      movements: {
        amount: -newFD.sum,
        time: new Date(Date.now()).toISOString(),
        remark: 'fixed deposit',
      },
    },
  });

  res.send({ message: 'New FD created successfully!' });
};

exports.getLimits = async (req, res, next) => {
  const userId = req.userId;

  const bankAccount = await BankAccount.findOne({ user: userId });

  const currentLimits = {
    dcWithdrawalLimit: bankAccount.debitCardDetails.withdrawalLimit,
    ccWithdrawalLimit: bankAccount.creditCardDetails.withdrawalLimit,
    dcPOSLimit: bankAccount.debitCardDetails.POSLimit,
    ccPOSLimit: bankAccount.creditCardDetails.POSLimit,
  };

  res.send(currentLimits);
};

exports.postLimits = async (req, res, next) => {
  const userId = req.userId;

  const { dcWithdrawalLimit, ccWithdrawalLimit, dcPOSLimit, ccPOSLimit } =
    req.body;

  const bankAccount = await BankAccount.findOne({ user: userId });

  const debitCardDetails = bankAccount.debitCardDetails;
  const creditCardDetails = bankAccount.creditCardDetails;

  await bankAccount.updateOne({
    debitCardDetails: {
      ...debitCardDetails,
      withdrawalLimit: dcWithdrawalLimit,
      POSLimit: dcPOSLimit,
    },
  });

  await bankAccount.updateOne({
    creditCardDetails: {
      ...creditCardDetails,
      withdrawalLimit: ccWithdrawalLimit,
      POSLimit: ccPOSLimit,
    },
  });

  res.send({ message: 'limits updated successfully!' });
};

exports.postPin = async (req, res, next) => {
  const userId = req.userId;

  const { newPin, cardType, password } = req.body;

  const bankAccount = await BankAccount.findOne({ user: userId }).populate(
    'user'
  );

  const debitCardDetails = bankAccount.debitCardDetails;
  const creditCardDetails = bankAccount.creditCardDetails;

  const isMatched = await bcryptjs.compare(password, bankAccount.user.password);

  if (!isMatched) {
    return res.status(401).send({ message: 'Incorrect password' });
  }

  if (cardType === 'debit') {
    await bankAccount.updateOne({
      debitCardDetails: {
        ...debitCardDetails,
        cardPin: newPin,
      },
    });

    return res.send({ message: 'Pin updated successfully!' });
  }

  await bankAccount.updateOne({
    creditCardDetails: {
      ...creditCardDetails,
      cardPin: newPin,
    },
  });

  res.send({ message: 'Pin updated successfully!' });
};

exports.postTransfer = async (req, res, next) => {
  const userId = req.userId;

  const { password, newTransaction } = req.body;

  console.log(req.body);

  const { amount, time, senderRemark, receiverRemark, sendToAccNumber, ifsc } =
    newTransaction;

  const senderBankAccount = await BankAccount.findOne({
    user: userId,
  }).populate('user');

  const receiverBankAccount = await BankAccount.findOne({
    'bankAccountDetails.accountNumber': sendToAccNumber,
  });

  console.log(receiverBankAccount);

  const isMatched = await bcryptjs.compare(
    password,
    senderBankAccount.user.password
  );

  if (!isMatched) {
    return res.status(401).send({ message: 'Incorrect password' });
  }

  if (!receiverBankAccount) {
    return res
      .status(401)
      .send({ message: "Invalid beneficiary's account number" });
  }

  const savingAccountBalance = senderBankAccount.movements.reduce(
    (acc, movement) => (acc += movement.amount),
    0
  );

  if (Number(amount) > savingAccountBalance) {
    return res.status(401).send({ message: 'Insufficient balance!' });
  }

  if (ifsc !== senderBankAccount.bankAccountDetails.ifsc) {
    return res.status(401).send({ message: 'Incorrect IFSC!' });
  }

  const senderMovement = {
    amount: -amount,
    remark: senderRemark,
    time,
  };

  const receiverMovement = {
    amount: amount,
    remark: receiverRemark,
    time,
  };

  await senderBankAccount.updateOne({
    $push: { movements: senderMovement },
  });

  await receiverBankAccount.updateOne({
    $push: { movements: receiverMovement },
  });

  res.send({ message: 'Sent money successfully!' });
};

exports.postBillPayment = async (req, res, next) => {
  const userId = req.userId;

  const { password, newTransaction } = req.body;

  const { amount } = newTransaction;

  const bankAccount = await BankAccount.findOne({
    user: userId,
  }).populate('user');

  const isMatched = await bcryptjs.compare(password, bankAccount.user.password);

  if (!isMatched) {
    return res.status(401).send({ message: 'Incorrect password' });
  }

  const savingAccountBalance = bankAccount.movements.reduce(
    (acc, movement) => (acc += movement.amount),
    0
  );

  if (Number(amount) > savingAccountBalance) {
    return res.status(404).send({ message: 'Insufficient balance!' });
  }

  await bankAccount.updateOne({
    $push: { movements: newTransaction },
  });

  res.status(201).send({ message: 'Bill paid successfully!' });
};
