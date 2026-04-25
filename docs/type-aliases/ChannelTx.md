[**reactive-channel**](../README.md)

***

[reactive-channel](../README.md) / ChannelTx

# Type Alias: ChannelTx\<T\>

> **ChannelTx**\<`T`\> = `object`

Defined in: [src/lib/index.ts:46](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L46)

Transmission end of a channel.

## Type Parameters

### T

`T`

## Properties

### availableOutboxSlots$

> **availableOutboxSlots$**: [`ReadonlyStore`](ReadonlyStore.md)\<`number`\>

Defined in: [src/lib/index.ts:78](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L78)

A store that contains the number of available slots (from 0 to the channel capacity) in the output buffer or 0 if the channel is closed.

***

### canWrite$

> **canWrite$**: [`ReadonlyStore`](ReadonlyStore.md)\<`boolean`\>

Defined in: [src/lib/index.ts:74](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L74)

A store that contains true if the transmission buffer is not full and the channel is not closed.

***

### closed$

> **closed$**: [`ReadonlyStore`](ReadonlyStore.md)\<`boolean`\>

Defined in: [src/lib/index.ts:90](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L90)

A store that contains true if the channel is closed.

## Accessors

### capacity

#### Get Signature

> **get** **capacity**(): `number`

Defined in: [src/lib/index.ts:82](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L82)

Return the total size (number of slots) of the channel buffer.

##### Returns

`number`

## Methods

### close()

> **close**(): `void`

Defined in: [src/lib/index.ts:86](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L86)

Close the channel, stopping all pending send/recv requests.

#### Returns

`void`

***

### send()

> **send**(`v`): `void`

Defined in: [src/lib/index.ts:55](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L55)

Push data into the channel.
This operation enqueues the passed value in the transmission queue if there
is no pending `recv`.

#### Parameters

##### v

`T`

the data to send.

#### Returns

`void`

#### Throws

if the channel is closed.

#### Throws

if the channel is transmission queue is full.

***

### sendWait()

> **sendWait**(`v`, `options?`): `Promise`\<`void`\>

Defined in: [src/lib/index.ts:70](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L70)

Push data into the channel and waits for it to be consumed by the receiving end.
This operation enqueues the passed value in the transmission queue if there
is no pending `recv`, but removes it if the operation is aborted by an abort
signal.

#### Parameters

##### v

`T`

the data to send.

##### options?

###### signal?

`AbortSignal`

(optional) an abort signal to stop the pending promise.
If this signal emits before `sendWait` can resolve, the enqueued value will be removed
and the emitted value will be "thrown" (as in `throw ...;`) to the caller
of `sendWait`.

#### Returns

`Promise`\<`void`\>

#### Throws

if the channel is closed.

#### Throws

if the channel is transmission queue is full.

#### Throws

if `signal` triggers before `sendWait` can resolve.
