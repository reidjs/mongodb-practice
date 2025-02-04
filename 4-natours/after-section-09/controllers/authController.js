const User = require('./../models/userModel')
const catchAsync = require('../utils/catchAsync')
const jwt = require('jsonwebtoken')
const AppError = require('./../utils/AppError')

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  })

  const token = signToken(newUser._id)

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  })
})
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  // check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400))
  }
  // check if user exists && password is correct
  // + is used to select a field that is not selected
  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.correctPassword(password, user.password)
  )) {
    return next(new AppError('Incorrect email or password', 401))
  }

  const token = signToken(user._id) 

  // send JWT back to client
  res.status(200).json({
    status: 'success',
    token
  })
})