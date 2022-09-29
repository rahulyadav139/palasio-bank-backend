const User = require('../models/user');
const BankAccount = require('../models/bank-account');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.putSignup = async (req, res, next) => {
  const { fullName, username, email, password } = req.body;

  const isUser = await User.findOne({ email: email });

  if (isUser) {
    return res.send({ message: 'User is already registered!' });
  }

  const encryptedPassword = await bcryptjs.hash(password, 12);

  const user = new User({
    fullName: fullName,
    username: username,
    email: email,
    password: encryptedPassword,
  });

  user.save();

  const bankAccount = new BankAccount({
    user: user._id,
  });

  bankAccount.save();

  jwt.sign(
    { fullName, email, userId: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: 30 * 60,
    },
    (err, token) => {
      if (err) return res.send(err);
      return res.send({
        token: token,
        fullName: user.fullName,
        accountNumber: bankAccount.accountNumber,
      });
    }
  );
};

exports.postLogin = async (req, res, next) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username: username });

  const users = await User.find();

  if (!user) {
    res.status('401').send({ message: 'user not find!' });
    return;
  }

  const isMatched = await bcryptjs.compare(password, user.password);

  if (!isMatched) {
    res.status('401').send({ message: 'incorrect password!' });
    return;
  }

  const bankAccount = await BankAccount.findOne({ user: user._id });

  jwt.sign(
    { fullName: user.fullName, email: user.email, userId: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: 30 * 60,
    },
    (err, token) => {
      if (err) return res.send(err);
      return res.send({
        token: token,
        fullName: user.fullName,
        accountNumber: bankAccount.bankAccountDetails.accountNumber,
      });
    }
  );
};
