# Title Placeholder

A simple, minimal, and expressive validation library that relies on functional composition. 

### Example Usage

```typescript
type CreateUserCommand = {
  id: string
  firstName: string
  lastName: string
  username: string
  emailAddress: string
  password: string
  age: number
}

function createUserCommandValidator(command: CreateUserCommand) {
  const { valueFor, validate } = createValidationContext<CreateUserCommand>()

  valueFor('id').must(
    beProvided(),
    beUuid()
  )

  valueFor('firstName').must(
    beProvided(), 
    haveLengthGreaterThan(3)
  )

  valueFor('lastName').must(
    beProvided(),
    haveLengthGreaterThan(3)
  )

  valueFor('username').must(
    beProvided(),
    not(
      equal(command.firstName),
      equal(command.lastName),
      equal(command.password)
    ),
    haveLengthLessThan(20)
  )

  valueFor('emailAddress').must(
    beProvided(),
    beEmail()
  )

  valueFor('password').must(
    beProvided(),
    haveLengthGreaterThan(6),
    not(
      equal(command.firstName),
      equal(command.lastName),
      equal(command.emailAddress),
      equal(command.username)
    ),
    must(() => yourCustomValidator())
  )

  valueFor('age').must(
    beProvided(),
    beGreaterThanOrEqual(16)
  )

  const validationResult = validate(command)

  // Properties
  console.log(validationResult.isSuccess)
  console.log(validationResult.isFailure)
  console.log(validationResult.getErrors())
  console.log(validationResult.result) // Enum for pattern matching.

  // Throws if validation fails
  validationResult.throwIfInvalid()

  // If you wish wrap or map errors
  validationResult.throwIfInvalid(e => errorFactory(e))
}
```
=======

# Title Placeholder

A simple, minimal, and expressive validation library that relies on functional composition. 

### Example Usage

```typescript
type CreateUserCommand = {
  id: string
  firstName: string
  lastName: string
  username: string
  emailAddress: string
  password: string
  age: number
}

function createUserCommandValidator(command: CreateUserCommand) {
  const { valueFor, validate } = createValidationContext<CreateUserCommand>()

  valueFor('id').must(
    beProvided(),
    beUuid()
  )

  valueFor('firstName').must(
    beProvided(), 
    haveLengthGreaterThan(3)
  )

  valueFor('lastName').must(
    beProvided(),
    haveLengthGreaterThan(3)
  )

  valueFor('username').must(
    beProvided(),
    not(
      equal(command.firstName),
      equal(command.lastName),
      equal(command.password)
    ),
    haveLengthLessThan(20)
  )

  valueFor('emailAddress').must(
    beProvided(),
    beEmail()
  )

  valueFor('password').must(
    beProvided(),
    haveLengthGreaterThan(6),
    not(
      equal(command.firstName),
      equal(command.lastName),
      equal(command.emailAddress),
      equal(command.username)
    ),
    must(() => yourCustomValidator())
  )

  valueFor('age').must(
    beProvided(),
    beGreaterThanOrEqual(16)
  )

  const validationResult = validate(command)

  // Properties
  console.log(validationResult.isSuccess)
  console.log(validationResult.isFailure)
  console.log(validationResult.getErrors())
  console.log(validationResult.result) // Enum for pattern matching.

  // Throws if validation fails
  validationResult.throwIfInvalid()

  // If you wish wrap or map errors
  validationResult.throwIfInvalid(e => errorFactory(e))
}
```
>>>>>>> 2e9ce77cb39b4cb24c22add51a00d344a2f93aa4
