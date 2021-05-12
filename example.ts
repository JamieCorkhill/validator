import { createValidationContext } from './lib/main'
import { not } from './lib/validation/modifiers'
import { beEmailAddress, beGreaterThanOrEqualTo, beProvided, beUuid, equal, haveMaximumLength, haveMinimumLength, must, satisfy } from './lib/validation/validators'

type CreateUserCommand = {
  id: string
  firstName: string
  lastName: string
  username: string
  emailAddress: string
  password: string
  age: number,
}

function createUserCommandValidator(command: CreateUserCommand) {
  const { valueFor, validate } = createValidationContext<CreateUserCommand>()

  valueFor('id').must(
    beProvided(),
    beUuid()
  )

  valueFor('firstName').must(
    beProvided(), 
    haveMinimumLength(3)
  )

  valueFor('lastName').must(
    beProvided(),
    haveMinimumLength(3)
  )

  valueFor('username').must(
    beProvided(),
    not(
      equal(command.firstName),
      equal(command.lastName),
      equal(command.password)
    ),
    haveMaximumLength(20)
  )

  valueFor('emailAddress').must(
    beProvided(),
    beEmailAddress()
  )

  valueFor('password').must(
    beProvided(),
    haveMinimumLength(6),
    not(
      equal(command.firstName),
      equal(command.lastName),
      equal(command.emailAddress),
      equal(command.username)
    ),
    satisfy(isNotStupidRule)
  )

  valueFor('age').must(
    beProvided(),
    beGreaterThanOrEqualTo(16)
  )

  const validationResult = validate(command)
  console.log('Passes:', validationResult)
}

function isNotStupidRule(password: string) {
  return password !== '123456'
}

createUserCommandValidator({
  id: '6927e47a-c9a4-4474-9a10-a97e77950b45',
  firstName: 'john',
  lastName: 'doe',
  username: 'jdoe',
  emailAddress: 'j@d.com',
  password: 'abc-123',
  age: 100,
})