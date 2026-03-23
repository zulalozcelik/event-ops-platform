import { UserRole } from '@event-ops/shared';
import { Email } from '../value-objects/email.vo';

export type UserEntityProps = {
  id: string;
  name: string;
  email: Email;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export class User {
  private constructor(private readonly props: UserEntityProps) {}

  public static create(props: UserEntityProps): User {
    return new User(props);
  }

  public get id(): string {
    return this.props.id;
  }

  public get name(): string {
    return this.props.name;
  }

  public get email(): string {
    return this.props.email.value;
  }

  public get role(): UserRole {
    return this.props.role;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
