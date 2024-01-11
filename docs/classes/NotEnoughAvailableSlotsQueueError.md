[reactive-channel](../README.md) / NotEnoughAvailableSlotsQueueError

# Class: NotEnoughAvailableSlotsQueueError

Error that is thrown when trying to enqueue n items into a queue having an availability of m < n slots.

## Hierarchy

- `Error`

  ↳ **`NotEnoughAvailableSlotsQueueError`**

## Table of contents

### Constructors

- [constructor](NotEnoughAvailableSlotsQueueError.md#constructor)

### Properties

- [availableSlots](NotEnoughAvailableSlotsQueueError.md#availableslots)
- [cause](NotEnoughAvailableSlotsQueueError.md#cause)
- [message](NotEnoughAvailableSlotsQueueError.md#message)
- [name](NotEnoughAvailableSlotsQueueError.md#name)
- [requestedItems](NotEnoughAvailableSlotsQueueError.md#requesteditems)
- [stack](NotEnoughAvailableSlotsQueueError.md#stack)
- [prepareStackTrace](NotEnoughAvailableSlotsQueueError.md#preparestacktrace)
- [stackTraceLimit](NotEnoughAvailableSlotsQueueError.md#stacktracelimit)

### Methods

- [captureStackTrace](NotEnoughAvailableSlotsQueueError.md#capturestacktrace)

## Constructors

### constructor

• **new NotEnoughAvailableSlotsQueueError**(`requestedItems`, `availableSlots`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `requestedItems` | `number` |
| `availableSlots` | `number` |

#### Overrides

Error.constructor

#### Defined in

node_modules/reactive-circular-queue/dist/index.d.ts:156

## Properties

### availableSlots

• **availableSlots**: `number`

#### Defined in

node_modules/reactive-circular-queue/dist/index.d.ts:155

___

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

Error.cause

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:26

___

### message

• **message**: `string`

#### Inherited from

Error.message

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1054

___

### name

• **name**: `string`

#### Inherited from

Error.name

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1053

___

### requestedItems

• **requestedItems**: `number`

#### Defined in

node_modules/reactive-circular-queue/dist/index.d.ts:154

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

Error.stack

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1055

___

### prepareStackTrace

▪ `Static` `Optional` **prepareStackTrace**: (`err`: `Error`, `stackTraces`: `CallSite`[]) => `any`

#### Type declaration

▸ (`err`, `stackTraces`): `any`

Optional override for formatting stack traces

**`See`**

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

##### Parameters

| Name | Type |
| :------ | :------ |
| `err` | `Error` |
| `stackTraces` | `CallSite`[] |

##### Returns

`any`

#### Inherited from

Error.prepareStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:11

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

Error.stackTraceLimit

#### Defined in

node_modules/@types/node/globals.d.ts:13

## Methods

### captureStackTrace

▸ `Static` **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Create .stack property on a target object

#### Parameters

| Name | Type |
| :------ | :------ |
| `targetObject` | `object` |
| `constructorOpt?` | `Function` |

#### Returns

`void`

#### Inherited from

Error.captureStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:4
