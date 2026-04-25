[**reactive-channel**](../README.md)

***

[reactive-channel](../README.md) / makeChannel

# Function: makeChannel()

> **makeChannel**\<`T`\>(`params?`): [`Channel`](../type-aliases/Channel.md)\<`T`\>

Defined in: [src/lib/index.ts:213](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L213)

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

## Type Parameters

### T

`T`

## Parameters

### params?

[`MakeChannelParams`](../type-aliases/MakeChannelParams.md)

(optional) configuration parameters for this channel (e.g maximum capacity).

## Returns

[`Channel`](../type-aliases/Channel.md)\<`T`\>

a [Channel](../type-aliases/Channel.md)
