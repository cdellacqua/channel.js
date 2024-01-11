[reactive-channel](../README.md) / ChannelTooManyPendingRecvError

# Class: ChannelTooManyPendingRecvError

Error that occurs when calling `recv`
and there are already too many enqueued similar requests.

## Hierarchy

- `Error`

  ↳ **`ChannelTooManyPendingRecvError`**

## Table of contents

### Constructors

- [constructor](ChannelTooManyPendingRecvError.md#constructor)

### Properties

- [cause](ChannelTooManyPendingRecvError.md#cause)
- [message](ChannelTooManyPendingRecvError.md#message)
- [name](ChannelTooManyPendingRecvError.md#name)
- [stack](ChannelTooManyPendingRecvError.md#stack)
- [prepareStackTrace](ChannelTooManyPendingRecvError.md#preparestacktrace)
- [stackTraceLimit](ChannelTooManyPendingRecvError.md#stacktracelimit)

### Methods

- [captureStackTrace](ChannelTooManyPendingRecvError.md#capturestacktrace)

## Constructors

### constructor

• **new ChannelTooManyPendingRecvError**()

#### Overrides

Error.constructor

#### Defined in

[src/lib/index.ts:34](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L34)

## Properties

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
