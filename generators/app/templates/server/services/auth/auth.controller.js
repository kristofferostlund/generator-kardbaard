'use strict'

import _ from 'lodash';

import User from './../../api/user/user.db';
import auth from './auth.service';
import utils from './../../utils/utils';

const __errors = {
  userNotExists: new Error('User does not exists'),
}

/**
 * Route: PUT '/services/auth/login'
 */
export function login(req, res) {
  const { email, password } = req.body;

  User.findByEmail(email)
  .then(user => {
    // If there is no user, the email must be incorrect.
    if (!user) {
      utils.log(`Login failed, no user at email: ${email}`)
      return res.status(401).send('Unauthorized.');
    }

    let isValid = auth.validatePassword(user.password, password);

    // Passwords didn't match
    if (!isValid) {
      utils.log(`Login failed, incorrect password for email: ${email}`)
      return res.status(401).send('Unauthorized.');
    }

    let token = auth.signToken({ userId: user.userId });

    utils.log(`Login successful, for email: ${email} at userId ${user.userId}`);

    res.status(200).json({ data: _.omit(user, ['password']), token });
  })
}

export default {
  login: login,
}
