[**reactive-channel**](../README.md)

***

[reactive-channel](../README.md) / Channel

# Type Alias: Channel\<T\>

> **Channel**\<`T`\> = `object`

Defined in: [src/lib/index.ts:161](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L161)

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

## Type Parameters

### T

`T`

## Properties

### rx

> **rx**: [`ChannelRx`](ChannelRx.md)\<`T`\>

Defined in: [src/lib/index.ts:169](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L169)

Receiving end of the channel.

***

### tx

> **tx**: [`ChannelTx`](ChannelTx.md)\<`T`\>

Defined in: [src/lib/index.ts:165](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L165)

Transmission end of the channel.

## Accessors

### buffer

#### Get Signature

> **get** **buffer**(): [`ReadonlyCircularQueue`](ReadonlyCircularQueue.md)\<`T`\>

Defined in: [src/lib/index.ts:173](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L173)

Return the internal buffer in readonly mode.

##### Returns

[`ReadonlyCircularQueue`](ReadonlyCircularQueue.md)\<`T`\>
