import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { DateTime } from 'luxon';

export function IsLuxonDateTime(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isLuxonDateTime',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return DateTime.isDateTime(value) && value.isValid;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid ISO 8601 date-time`;
        },
      },
    });
  };
}
