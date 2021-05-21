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

function isNotStupidRule(password: string) {
  return password !== '123456'
}
```


```typescript
valueFor('firstName').must(be(10, otherwise())))
```