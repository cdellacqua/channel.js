reactive-channel

# reactive-channel

## Table of contents

### Classes

- [ChannelClosedError](classes/ChannelClosedError.md)
- [ChannelFullError](classes/ChannelFullError.md)
- [ChannelTooManyPendingRecvError](classes/ChannelTooManyPendingRecvError.md)
- [NotEnoughAvailableSlotsQueueError](classes/NotEnoughAvailableSlotsQueueError.md)
- [NotEnoughFilledSlotsQueueError](classes/NotEnoughFilledSlotsQueueError.md)

### Type Aliases

- [Channel](README.md#channel)
- [ChannelRx](README.md#channelrx)
- [ChannelTx](README.md#channeltx)
- [MakeChannelParams](README.md#makechannelparams)
- [ReadonlyCircularQueue](README.md#readonlycircularqueue)
- [ReadonlyStore](README.md#readonlystore)
- [Subscriber](README.md#subscriber)
- [Unsubscribe](README.md#unsubscribe)

### Functions

- [makeChannel](README.md#makechannel)

## Type Aliases

### Channel

Ƭ **Channel**<`T`\>: `Object`

A Channel is an abstraction that enables
communication between asynchronous tasks.
A channel exposes two objects: `tx` and `rx`,
which respectively provide methods to transmit
and receive data.

Channels can be used and combined in a multitude of
ways. The simplest way to use a channel is by creating
a simplex communication: one task transmit data, another consumes it.
A full-duplex communication can be achieved by creating two channels
and exchanging the `rx` and `tx` objects between two tasks.

It's also possible to create a Multiple Producers Single Consumer (mpsc) scenario
by sharing a single channel among several tasks.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `rx` | [`ChannelRx`](README.md#channelrx)<`T`\> | Receiving end of the channel. |
| `tx` | [`ChannelTx`](README.md#channeltx)<`T`\> | Transmission end of the channel. |
| `get buffer()` | [`ReadonlyCircularQueue`](README.md#readonlycircularqueue)<`T`\> | - |

#### Defined in

[src/lib/index.ts:161](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L161)

___

### ChannelRx

Ƭ **ChannelRx**<`T`\>: `Object`

Receiving end of a channel.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `canRead$` | [`ReadonlyStore`](README.md#readonlystore)<`boolean`\> | A store that contains true if there is some data ready to be consumed, the channel is not closed and there are not too many pending `recv` requests. |
| `closed$` | [`ReadonlyStore`](README.md#readonlystore)<`boolean`\> | A store that contains true if the channel is closed. |
| `filledInboxSlots$` | [`ReadonlyStore`](README.md#readonlystore)<`number`\> | A store that contains the number of filled slots (from 0 to the channel capacity) in the input buffer or 0 if the channel is closed. |
| `pendingRecvPromises$` | [`ReadonlyStore`](README.md#readonlystore)<`number`\> | A store that contains the number of currently waiting `recv` promises. |
| `get capacity()` | `number` | - |
| `[asyncIterator]` | () => `AsyncIterator`<`T`, `any`, `undefined`\> | Return an async iterator that consumes the channel buffer If the channel buffer is already empty the iterator will not emit any value. |
| `close` | () => `void` | Close the channel, stopping all pending send/recv requests. |
| `iter` | () => `AsyncIterator`<`T`, `any`, `undefined`\> | Return an async iterator that consumes the channel buffer If the channel buffer is already empty the iterator will not emit any value. |
| `recv` | (`options?`: { `signal?`: `AbortSignal`  }) => `Promise`<`T`\> | Consume data from the channel buffer. If there is no data in the channel, this method will block the caller until it's available. **`Throws`** if the channel is closed. **`Throws`** if `.abort(...)` is called before `recv` is able to consume the channel buffer. |

#### Defined in

[src/lib/index.ts:96](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L96)

___

### ChannelTx

Ƭ **ChannelTx**<`T`\>: `Object`

Transmission end of a channel.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `availableOutboxSlots$` | [`ReadonlyStore`](README.md#readonlystore)<`number`\> | A store that contains the number of available slots (from 0 to the channel capacity) in the output buffer or 0 if the channel is closed. |
| `canWrite$` | [`ReadonlyStore`](README.md#readonlystore)<`boolean`\> | A store that contains true if the transmission buffer is not full and the channel is not closed. |
| `closed$` | [`ReadonlyStore`](README.md#readonlystore)<`boolean`\> | A store that contains true if the channel is closed. |
| `get capacity()` | `number` | - |
| `close` | () => `void` | Close the channel, stopping all pending send/recv requests. |
| `send` | (`v`: `T`) => `void` | Push data into the channel. This operation enqueues the passed value in the transmission queue if there is no pending `recv`. **`Throws`** if the channel is closed. **`Throws`** if the channel is transmission queue is full. |
| `sendWait` | (`v`: `T`, `options?`: { `signal?`: `AbortSignal`  }) => `Promise`<`void`\> | Push data into the channel and waits for it to be consumed by the receiving end. This operation enqueues the passed value in the transmission queue if there is no pending `recv`, but removes it if the operation is aborted by an abort signal. **`Throws`** if the channel is closed. **`Throws`** if the channel is transmission queue is full. **`Throws`** if `signal` triggers before `sendWait` can resolve. |

#### Defined in

[src/lib/index.ts:46](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L46)

___

### MakeChannelParams

Ƭ **MakeChannelParams**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `capacity?` | `number` | (optional, defaults to 1024) The maximum number of items that the channel can buffer while waiting data to be consumed. |
| `maxConcurrentPendingRecv?` | `number` | (optional, defaults to 1024) The maximum number of pending `recv`. If this limit is reached, `recv` will immediately reject with [ChannelTooManyPendingRecvError](classes/ChannelTooManyPendingRecvError.md). |

#### Defined in

[src/lib/index.ts:176](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L176)

___

### ReadonlyCircularQueue

Ƭ **ReadonlyCircularQueue**<`T`\>: `Object`

A circular queue "view" that exposes read-only methods.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `availableSlots$` | [`ReadonlyStore`](README.md#readonlystore)<`number`\> | A store that contains the number of available slots inside the queue. |
| `empty$` | [`ReadonlyStore`](README.md#readonlystore)<`boolean`\> | A store that contains true if the number of filled slots is zero. Note: a queue with a capacity of zero is always empty. |
| `filledSlots$` | [`ReadonlyStore`](README.md#readonlystore)<`number`\> | A store that contains the number of filled slots inside the queue. |
| `full$` | [`ReadonlyStore`](README.md#readonlystore)<`boolean`\> | A store that contains true if the number of filled slots equals the capacity. Note: a queue with a capacity of zero is always full. |
| `get capacity()` | `number` | - |
| `at` | (`positiveOrNegativeIndex`: `number`) => `undefined` \| `T` | Return an element of a queue given an index. The index can be positive or negative. If the index is positive, it counts forwards from the head of the queue, if it's negative, it counts backwards from the tail of the queue. As an example q.at(-1) returns the last enqueued element. Note: if the index is out of bounds, this method returns undefined. |
| `indexOf` | (`searchElement`: `T`) => `number` | Return the index of a given item inside the queue. |
| `toArray` | () => `T`[] | Return a copy of this queue in the form of an array. |

#### Defined in

node_modules/reactive-circular-queue/dist/index.d.ts:6

___

### ReadonlyStore

Ƭ **ReadonlyStore**<`T`\>: `Object`

A store that can have subscribers and emit values to them. It also
provides the current value upon subscription. It's readonly in the
sense that it doesn't provide direct set/update methods, unlike Store,
therefore its value can only be changed by a StartHandler (see also makeReadonlyStore).

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `content` | () => `T` |
| `nOfSubscriptions` | () => `number` |
| `subscribe` | (`subscriber`: [`Subscriber`](README.md#subscriber)<`T`\>) => [`Unsubscribe`](README.md#unsubscribe) |

#### Defined in

node_modules/universal-stores/dist/index.d.ts:33

___

### Subscriber

Ƭ **Subscriber**<`T`\>: (`current`: `T`) => `void`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

▸ (`current`): `void`

A generic subscriber that takes a value emitted by a signal as its only parameter.

##### Parameters

| Name | Type |
| :------ | :------ |
| `current` | `T` |

##### Returns

`void`

#### Defined in

node_modules/@cdellacqua/signals/dist/index.d.ts:2

___

### Unsubscribe

Ƭ **Unsubscribe**: () => `void`

#### Type declaration

▸ (): `void`

A function that's used to unsubscribe a subscriber from a signal.

##### Returns

`void`

#### Defined in

node_modules/@cdellacqua/signals/dist/index.d.ts:4

## Functions

### makeChannel

▸ **makeChannel**<`T`\>(`params?`): [`Channel`](README.md#channel)<`T`\>

Create a Channel.

A Channel is an abstraction that enables
communication between asynchronous tasks.
A channel exposes two objects: `tx` and `rx`,
which respectively provide methods to transmit
and receive data.

Channels can be used and combined in a multitude of
ways. The simplest way to use a channel is by creating
a simplex communication: one task transmit data, another consumes it.
A full-duplex communication can be achieved by creating two channels
and exchanging the `rx` and `tx` objects between two tasks.

It's also possible to create a Multiple Producers Single Consumer (mpsc) scenario
by sharing a single channel among several tasks.

Example:
```ts
const {tx, rx} = makeChannel<number>();
rx.recv().then((n) => console.log('Here it is: ' + n)); // doesn't print anything, the channel is currently empty.
tx.send(1); // resolves the above promise, causing it to print 'Here it is: 1'
```

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params?` | [`MakeChannelParams`](README.md#makechannelparams) | (optional) configuration parameters for this channel (e.g maximum capacity). |

#### Returns

[`Channel`](README.md#channel)<`T`\>

a [Channel](README.md#channel)

#### Defined in

[src/lib/index.ts:213](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L213)
