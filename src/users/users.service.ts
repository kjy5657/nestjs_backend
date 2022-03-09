import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { compare } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { JwtService } from './../jwt/jwt.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    //check email already taken
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        return { ok: false, error: 'there is a user with that email already' };
      }
      await this.users.save(this.users.create({ email, password, role }));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Couldn't create account" };
    }

    //create user & hash the password
  }

  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    try {
      const user = await this.users.findOne({ email });
      if (!user) {
        return { ok: false, error: 'User does not exist' };
      }
      console.log(user);

      const matchPassword = compare(password, user.password);
      if (!matchPassword) {
        return { ok: false, error: 'Not Authorized' };
      } else {
        const token = jwt.sign(
          { id: user.id },
          this.config.get('TOKEN_SECRET'),
        );
        return { ok: true, token };
      }
    } catch (e) {
      console.error(e);
      return { ok: false, error: "Couldn't Login" };
    }
  }
}