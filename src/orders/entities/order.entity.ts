import { CoreEntity } from './../../common/entities/core.entity';
import {
  ObjectType,
  InputType,
  Field,
  registerEnumType,
} from '@nestjs/graphql';
import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  RelationId,
} from 'typeorm';
import { User } from './../../users/entities/user.entity';
import { Restaurant } from './../../restaurants/entities/restaurant.entity';
import { Dish } from './../../restaurants/entities/dish.entity';
import { IsEnum, IsNumber } from 'class-validator';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  Cooked = 'Cooked',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  //user가 지워진다 하더라도, CASCADE 아니고 null 로 비워둠으로서 주문은 남겨둠
  @ManyToOne((type) => User, (user) => user.orders, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  @Field((type) => User, { nullable: true })
  customer?: User;

  @RelationId((order: Order) => order.customer)
  customerId: number;

  @RelationId((order: Order) => order.driver)
  driverId: number;

  @ManyToOne((type) => User, (user) => user.rides, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  @Field((type) => User, { nullable: true })
  driver?: User;

  @ManyToOne((type) => Restaurant, (restaurant) => restaurant.orders, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  @Field((type) => Restaurant, { nullable: true })
  restaurant?: Restaurant;

  @ManyToMany((type) => OrderItem, { eager: true })
  @Field((type) => [OrderItem])
  @JoinTable()
  items: OrderItem[];

  @Column({ nullable: true })
  @Field((type) => Number, { nullable: true })
  @IsNumber()
  total?: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
  @Field((type) => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
