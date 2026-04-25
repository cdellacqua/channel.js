[**reactive-channel**](../README.md)

***

[reactive-channel](../README.md) / ChannelRx

# Type Alias: ChannelRx\<T\>

> **ChannelRx**\<`T`\> = `object`

Defined in: [src/lib/index.ts:96](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L96)

Receiving end of a channel.

## Type Parameters

### T

`T`

## Properties

### canRead$

> **canRead$**: [`ReadonlyStore`](ReadonlyStore.md)\<`boolean`\>

Defined in: [src/lib/index.ts:100](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L100)

A store that contains true if there is some data ready to be consumed, the channel is not closed and there are not too many pending `recv` requests.

***

### closed$

> **closed$**: [`ReadonlyStore`](ReadonlyStore.md)\<`boolean`\>

Defined in: [src/lib/index.ts:138](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L138)

A store that contains true if the channel is closed.

***

### filledInboxSlots$

> **filledInboxSlots$**: [`ReadonlyStore`](ReadonlyStore.md)\<`number`\>

Defined in: [src/lib/index.ts:104](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L104)

A store that contains the number of filled slots (from 0 to the channel capacity) in the input buffer or 0 if the channel is closed.

***

### pendingRecvPromises$

> **pendingRecvPromises$**: [`ReadonlyStore`](ReadonlyStore.md)\<`number`\>

Defined in: [src/lib/index.ts:142](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L142)

A store that contains the number of currently waiting `recv` promises.

## Accessors

### capacity

#### Get Signature

> **get** **capacity**(): `number`

Defined in: [src/lib/index.ts:108](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L108)

Return the total size (number of slots) of the channel buffer.

##### Returns

`number`

## Methods

### \[asyncIterator\]()

> **\[asyncIterator\]**(): `AsyncIterator`\<`T`\>

Defined in: [src/lib/index.ts:130](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L130)

Return an async iterator that consumes the channel buffer
If the channel buffer is already empty the iterator will not emit any value.

#### Returns

`AsyncIterator`\<`T`\>

***

### close()

> **close**(): `void`

Defined in: [src/lib/index.ts:134](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L134)

Close the channel, stopping all pending send/recv requests.

#### Returns

`void`

***

### iter()

> **iter**(): `AsyncIterator`\<`T`\>

Defined in: [src/lib/index.ts:125](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L125)

Return an async iterator that consumes the channel buffer
If the channel buffer is already empty the iterator will not emit any value.

#### Returns

`AsyncIterator`\<`T`\>

***

### recv()

> **recv**(`options?`): `Promise`\<`T`\>

Defined in: [src/lib/index.ts:120](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L120)

Consume data from the channel buffer.
If there is no data in the channel, this method will block the caller
until it's available.

#### Parameters

##### options?

###### signal?

`AbortSignal`

(optional) an abort signal to stop the pending promise.
If this signal triggers before `recv` can resolve, the channel buffer won't be
consumed and the abort reason value will be "thrown" (as in `throw ...;`) to the caller
of `recv`.

#### Returns

`Promise`\<`T`\>

#### Throws

if the channel is closed.

#### Throws

if `.abort(...)` is called before `recv` is able to consume the channel buffer.
