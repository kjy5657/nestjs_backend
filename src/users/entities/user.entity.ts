import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CoreEntity } from './../../common/entities/core.entity';
import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';
import { Restaurant } from './../../restaurants/entities/restaurant.entity';
import { Order } from '../../orders/entities/order.entity';
import { Payment } from './../../payments/entities/payment.entity';

export enum UserRole {
  Client = 'Client',
  Owner = 'Owner',
  Delivery = 'Delivery',
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column({ unique: true })
  @Field((type) => String)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Field((type) => String)
  @IsString()
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field((type) => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field((type) => Boolean)
  @IsBoolean()
  verified: boolean;

  @ManyToOne((type) => Restaurant, (restaurant) => restaurant.owner)
  @Field((type) => [Restaurant])
  restaurants: Restaurant[];

  @OneToMany((type) => Order, (order) => order.customer)
  @Field((type) => [Order])
  orders: Order[];

  @OneToMany((type) => Payment, (payment) => payment.user)
  @Field((type) => [Payment])
  payments: Payment[];

  @OneToMany((type) => Order, (order) => order.driver)
  @Field((type) => [Order])
  rides: Order[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    //넘겨준 object에 password가 존재하면, hash
    if (this.password) {
      try {
        //entity's password, after create make entity
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        console.error(e);
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(
    inputPassword: string,
    userPassword: string,
  ): Promise<Boolean> {
    try {
      return bcrypt.compare(inputPassword, userPassword);
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException();
    }
  }
}
