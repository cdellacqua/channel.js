[**reactive-channel**](../README.md)

***

[reactive-channel](../README.md) / MakeChannelParams

# Type Alias: MakeChannelParams

> **MakeChannelParams** = `object`

Defined in: [src/lib/index.ts:176](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L176)

## Properties

### capacity?

> `optional` **capacity?**: `number`

Defined in: [src/lib/index.ts:178](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L178)

(optional, defaults to 1024) The maximum number of items that the channel can buffer while waiting data to be consumed.

***

### maxConcurrentPendingRecv?

> `optional` **maxConcurrentPendingRecv?**: `number`

Defined in: [src/lib/index.ts:180](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L180)

(optional, defaults to 1024) The maximum number of pending `recv`. If this limit is reached, `recv` will immediately reject with [ChannelTooManyPendingRecvError](../classes/ChannelTooManyPendingRecvError.md).
