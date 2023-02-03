reactive-channel

# reactive-channel

## Table of contents

### Classes

- [ChannelClosedError](classes/ChannelClosedError.md)
- [ChannelFullError](classes/ChannelFullError.md)
- [ChannelTooManyPendingRecvError](classes/ChannelTooManyPendingRecvError.md)

### Type Aliases

- [Channel](README.md#channel)
- [ChannelRx](README.md#channelrx)
- [ChannelTx](README.md#channeltx)
- [MakeChannelParams](README.md#makechannelparams)

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
| `get buffer()` | `ReadonlyCircularQueue`<`T`\> | - |

#### Defined in

[src/lib/index.ts:154](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L154)

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
| `canRead$` | `ReadonlyStore`<`boolean`\> | A store that contains true if there is some data ready to be consumed, the channel is not closed and there are not too many pending `recv` requests. |
| `closed$` | `ReadonlyStore`<`boolean`\> | A store that contains true if the channel is closed. |
| `filledInboxSlots$` | `ReadonlyStore`<`number`\> | A store that contains the number of filled slots (from 0 to the channel capacity) in the input buffer or 0 if the channel is closed. |
| `pendingRecvPromises$` | `ReadonlyStore`<`number`\> | A store that contains the number of currently waiting `recv` promises. |
| `get capacity()` | `number` | - |
| `[asyncIterator]` | () => `AsyncIterator`<`T`, `any`, `undefined`\> | Return an async iterator that consumes the channel buffer If the channel buffer is already empty the iterator will not emit any value. |
| `close` | () => `void` | Close the channel, stopping all pending send/recv requests. |
| `iter` | () => `AsyncIterator`<`T`, `any`, `undefined`\> | Return an async iterator that consumes the channel buffer If the channel buffer is already empty the iterator will not emit any value. |
| `recv` | (`options?`: { `signal?`: `AbortSignal`  }) => `Promise`<`T`\> | Consume data from the channel buffer. If there is no data in the channel, this method will block the caller until it's available. **`Throws`** if the channel is closed. **`Throws`** if `.abort(...)` is called before `recv` is able to consume the channel buffer. |

#### Defined in

[src/lib/index.ts:89](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L89)

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
| `availableOutboxSlots$` | `ReadonlyStore`<`number`\> | A store that contains the number of available slots (from 0 to the channel capacity) in the output buffer or 0 if the channel is closed. |
| `canWrite$` | `ReadonlyStore`<`boolean`\> | A store that contains true if the transmission buffer is not full and the channel is not closed. |
| `closed$` | `ReadonlyStore`<`boolean`\> | A store that contains true if the channel is closed. |
| `get capacity()` | `number` | - |
| `close` | () => `void` | Close the channel, stopping all pending send/recv requests. |
| `send` | (`v`: `T`) => `void` | Push data into the channel. This operation enqueues the passed value in the transmission queue if there is no pending `recv`. **`Throws`** if the channel is closed. **`Throws`** if the channel is transmission queue is full. |
| `sendWait` | (`v`: `T`, `options?`: { `signal?`: `AbortSignal`  }) => `Promise`<`void`\> | Push data into the channel and waits for it to be consumed by the receiving end. This operation enqueues the passed value in the transmission queue if there is no pending `recv`, but removes it if the operation is aborted by an abort signal. **`Throws`** if the channel is closed. **`Throws`** if the channel is transmission queue is full. **`Throws`** if `signal` triggers before `sendWait` can resolve. |

#### Defined in

[src/lib/index.ts:39](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L39)

___

### MakeChannelParams

Ƭ **MakeChannelParams**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `capacity?` | `number` | (optional, defaults to 1024) The maximum number of items that the channel can buffer while waiting data to be consumed. |
| `maxConcurrentPendingRecv?` | `number` | (optional, defaults to 1024) The maximum number of pending `recv`. If this limit is reached, `recv` will immediately reject with [ChannelTooManyPendingRecvError](classes/ChannelTooManyPendingRecvError.md). |

#### Defined in

[src/lib/index.ts:169](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L169)

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

[src/lib/index.ts:206](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L206)
