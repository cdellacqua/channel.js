[reactive-channel](../README.md) / ChannelClosedError

# Class: ChannelClosedError

Error that occurs trying to send or receive data from
a closed channel.

## Hierarchy

- `Error`

  ↳ **`ChannelClosedError`**

## Table of contents

### Constructors

- [constructor](ChannelClosedError.md#constructor)

### Properties

- [cause](ChannelClosedError.md#cause)
- [message](ChannelClosedError.md#message)
- [name](ChannelClosedError.md#name)
- [stack](ChannelClosedError.md#stack)
- [prepareStackTrace](ChannelClosedError.md#preparestacktrace)
- [stackTraceLimit](ChannelClosedError.md#stacktracelimit)

### Methods

- [captureStackTrace](ChannelClosedError.md#capturestacktrace)

## Constructors

### constructor

• **new ChannelClosedError**()

#### Overrides

Error.constructor

#### Defined in

src/lib/index.ts:33

## Properties

### cause

• `Optional` **cause**: `Error`

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

node_modules/typescript/lib/lib.es5.d.ts:1029

___

### name

• **name**: `string`

#### Inherited from

Error.name

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1028

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

Error.stack

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1030

___

### prepareStackTrace

▪ `Static` `Optional` **prepareStackTrace**: (`err`: `Error`, `stackTraces`: `CallSite`[]) => `any`

#### Type declaration

▸ (`err`, `stackTraces`): `any`

Optional override for formatting stack traces

**`see`** https://v8.dev/docs/stack-trace-api#customizing-stack-traces

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
