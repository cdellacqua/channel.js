[reactive-channel](../README.md) / NotEnoughFilledSlotsQueueError

# Class: NotEnoughFilledSlotsQueueError

Error that is thrown when trying to dequeue n items from a queue containing m < n items.

## Hierarchy

- `Error`

  ↳ **`NotEnoughFilledSlotsQueueError`**

## Table of contents

### Constructors

- [constructor](NotEnoughFilledSlotsQueueError.md#constructor)

### Properties

- [cause](NotEnoughFilledSlotsQueueError.md#cause)
- [filledSlots](NotEnoughFilledSlotsQueueError.md#filledslots)
- [message](NotEnoughFilledSlotsQueueError.md#message)
- [name](NotEnoughFilledSlotsQueueError.md#name)
- [requestedItems](NotEnoughFilledSlotsQueueError.md#requesteditems)
- [stack](NotEnoughFilledSlotsQueueError.md#stack)
- [prepareStackTrace](NotEnoughFilledSlotsQueueError.md#preparestacktrace)
- [stackTraceLimit](NotEnoughFilledSlotsQueueError.md#stacktracelimit)

### Methods

- [captureStackTrace](NotEnoughFilledSlotsQueueError.md#capturestacktrace)

## Constructors

### constructor

• **new NotEnoughFilledSlotsQueueError**(`requestedItems`, `filledSlots`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `requestedItems` | `number` |
| `filledSlots` | `number` |

#### Overrides

Error.constructor

#### Defined in

node_modules/reactive-circular-queue/dist/index.d.ts:148

## Properties

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

Error.cause

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:26

___

### filledSlots

• **filledSlots**: `number`

#### Defined in

node_modules/reactive-circular-queue/dist/index.d.ts:147

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

node_modules/reactive-circular-queue/dist/index.d.ts:146

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
