import express from 'express';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// [심화] 라우터마다 prisma 클라이언트를 생성하고 있다. 더 좋은 방법이 있지 않을까?
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// 6. [도전] 인증 미들웨어 구현
// Request의 Authorization 헤더에서 JWT를 가져와서 인증 된 사용자인지 확인하는 Middleware를 구현합니다

// 6-1. [도전] 회원가입
router.post('/account/join', async (req, res) => {
  const joinSchema = Joi.object({
    accountId: Joi.string().alphanum().lowercase().required(),
    password: Joi.string().min(6).required(),
    confimPassword: Joi.valid(Joi.ref(`password`)).required(),
    userName: Joi.string().required(),
  });

  const validateResult = joinSchema.validate(req.body);
  if (validateResult.error) {
    res.status(400).json({ error: '입력된 값이 잘못됐어요.' })
    return;
  }

  const inputValue = validateReesult.value

  const accuntId = inputValue.accountId;
  const password = inputValue.password;
  const userName = inputValue.userName;

  const bashedPassword = await bcrypt.hash(password, 10);
  const existAccount = await prisma.account.findUnique({where: { accountId: accountId} });
  if (existAccount) {
    res.status(400).json({ error: '중복된 아이디에요!'});
    return;
  }

  const joinAccount = await pprisma.account.create({
    data: {accountId: accountId, password: hashedPassword, userName: userName },
  });

  res
  .status(200)
  .json({account_info: {accountId: joinAccount.accountId, accountId, userName: joinAccount } });
});

const users = {};

// 6-2. [도전] 로그인
router.post('/account/login', async (req, res) => {

  const loginSchema = Joi.object({
    accountId: Joi.string().alphanum().required(),
    password: Joi.string().min(6).required(),
  });

  const validateResult = loginSchema.validate(req.body);
 
  if (validateResult.error) {
    res.status(400).json({ error: '잘못된 요청입니다.'});
    return;
  }

  const inputValue = validateResult.value;
  const accountId = inputValue.accountId;
  const password = inputValue.password;

  const account = await prisma.account.findUnique({ where: { accoountId: accountId } });
  if (account == null) {
    res.status(400).json({ error: '계정이 존재하지 않습니다.'});
    return;
  }

  const passwordValidate = await bcrypt.compare(password, account.password);
  if (!passwordValidate) {
    res.status(400).json({error: '비밀번호가 일치하지 않습니다.'});
    return;
  }

 const accessToken = jwt.sign(
  { accountId: accountId, userName: account.userName },
`secretOrPrivateKey`,
{expiresIn: '1h'},
);

res.status(200).json({account_info: {accountIId: account,accountId, userName: account.userName } });
});

export default router;
