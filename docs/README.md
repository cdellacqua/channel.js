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
- [CircularQueue](README.md#circularqueue)
- [DerivedStoreConfig](README.md#derivedstoreconfig)
- [EqualityComparator](README.md#equalitycomparator)
- [Getter](README.md#getter)
- [MakeChannelParams](README.md#makechannelparams)
- [ReadonlyCircularQueue](README.md#readonlycircularqueue)
- [ReadonlySignal](README.md#readonlysignal)
- [ReadonlyStore](README.md#readonlystore)
- [Setter](README.md#setter)
- [Signal](README.md#signal)
- [StartHandler](README.md#starthandler)
- [StopHandler](README.md#stophandler)
- [Store](README.md#store)
- [StoreConfig](README.md#storeconfig)
- [Subscriber](README.md#subscriber)
- [Unsubscribe](README.md#unsubscribe)
- [Update](README.md#update)
- [Updater](README.md#updater)

### Functions

- [coalesceSignals](README.md#coalescesignals)
- [deriveSignal](README.md#derivesignal)
- [makeChannel](README.md#makechannel)
- [makeCircularQueue](README.md#makecircularqueue)
- [makeDerivedStore](README.md#makederivedstore)
- [makeReadonlyStore](README.md#makereadonlystore)
- [makeSignal](README.md#makesignal)
- [makeStore](README.md#makestore)

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

[src/lib/index.ts:156](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L156)

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

[src/lib/index.ts:91](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L91)

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

[src/lib/index.ts:41](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L41)

___

### CircularQueue

Ƭ **CircularQueue**<`T`\>: [`ReadonlyCircularQueue`](README.md#readonlycircularqueue)<`T`\> & { `[iterator]`: () => `Iterator`<`T`, `any`, `undefined`\> ; `clear`: () => `void` ; `dequeue`: () => `T`(`n`: `number`) => `T`[] ; `dequeueAll`: () => `T`[] ; `enqueue`: (`v`: `T`) => `void` ; `enqueueMulti`: (`v`: `T`[]) => `void` ; `iter`: () => `Iterator`<`T`, `any`, `undefined`\> ; `remove`: (`positiveOrNegativeIndex`: `number`) => `T` ; `replace`: (`positiveOrNegativeIndex`: `number`, `item`: `T`) => `T`  }

A circular queue implementation with reactive features and Symbol.iterator support.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

node_modules/reactive-circular-queue/dist/index.d.ts:59

___

### DerivedStoreConfig

Ƭ **DerivedStoreConfig**<`T`\>: `Object`

Configurations for derived stores.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `comparator?` | [`EqualityComparator`](README.md#equalitycomparator)<`T`\> | (optional, defaults to `(a, b) => a === b`) a function that's used to determine if the current value of the store value is different from the one being set and thus if the store needs to be updated and the subscribers notified. |

#### Defined in

node_modules/universal-stores/dist/composition.d.ts:15

___

### EqualityComparator

Ƭ **EqualityComparator**<`T`\>: (`a`: `T`, `b`: `T`) => `boolean`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

▸ (`a`, `b`): `boolean`

A comparison function used to optimize subscribers notifications. Used in [Store](README.md#store)

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `T` |
| `b` | `T` |

##### Returns

`boolean`

#### Defined in

node_modules/universal-stores/dist/index.d.ts:22

___

### Getter

Ƭ **Getter**<`T`\>: () => `T`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

▸ (): `T`

A generic getter function. Used in [Store](README.md#store)

##### Returns

`T`

#### Defined in

node_modules/universal-stores/dist/index.d.ts:16

___

### MakeChannelParams

Ƭ **MakeChannelParams**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `capacity?` | `number` | (optional, defaults to 1024) The maximum number of items that the channel can buffer while waiting data to be consumed. |
| `maxConcurrentPendingRecv?` | `number` | (optional, defaults to 1024) The maximum number of pending `recv`. If this limit is reached, `recv` will immediately reject with [ChannelTooManyPendingRecvError](classes/ChannelTooManyPendingRecvError.md). |

#### Defined in

[src/lib/index.ts:171](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L171)

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

### ReadonlySignal

Ƭ **ReadonlySignal**<`T`\>: `Object`

A signal that can have subscribers and emit values to them.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `nOfSubscriptions` | () => `number` |
| `subscribe` | (`subscriber`: [`Subscriber`](README.md#subscriber)<`T`\>) => [`Unsubscribe`](README.md#unsubscribe) |
| `subscribeOnce` | (`subscriber`: [`Subscriber`](README.md#subscriber)<`T`\>) => [`Unsubscribe`](README.md#unsubscribe) |

#### Defined in

node_modules/@cdellacqua/signals/dist/index.d.ts:6

___

### ReadonlyStore

Ƭ **ReadonlyStore**<`T`\>: `Object`

A store that can have subscribers and emit values to them. It also
provides the current value upon subscription. It's readonly in the
sense that it doesn't provide direct set/update methods, unlike [Store](README.md#store),
therefore its value can only be changed by a [StartHandler](README.md#starthandler) (see also [makeReadonlyStore](README.md#makereadonlystore)).

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

### Setter

Ƭ **Setter**<`T`\>: (`newValue`: `T`) => `void`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

▸ (`newValue`): `void`

A generic setter function. Used in [Store](README.md#store)

##### Parameters

| Name | Type |
| :------ | :------ |
| `newValue` | `T` |

##### Returns

`void`

#### Defined in

node_modules/universal-stores/dist/index.d.ts:14

___

### Signal

Ƭ **Signal**<`T`\>: [`ReadonlySignal`](README.md#readonlysignal)<`T`\> & { `emit`: (`v`: `T`) => `void`  }

A signal that can have subscribers and emit values to them.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

node_modules/@cdellacqua/signals/dist/index.d.ts:28

___

### StartHandler

Ƭ **StartHandler**<`T`\>: (`set`: [`Setter`](README.md#setter)<`T`\>) => [`StopHandler`](README.md#stophandler) \| `void`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

▸ (`set`): [`StopHandler`](README.md#stophandler) \| `void`

A function that gets called once a store gets at least one subscriber. Used in [Store](README.md#store)

##### Parameters

| Name | Type |
| :------ | :------ |
| `set` | [`Setter`](README.md#setter)<`T`\> |

##### Returns

[`StopHandler`](README.md#stophandler) \| `void`

#### Defined in

node_modules/universal-stores/dist/index.d.ts:26

___

### StopHandler

Ƭ **StopHandler**: () => `void`

#### Type declaration

▸ (): `void`

A function that gets called once a store reaches 0 subscribers. Used in [Store](README.md#store)

##### Returns

`void`

#### Defined in

node_modules/universal-stores/dist/index.d.ts:24

___

### Store

Ƭ **Store**<`T`\>: [`ReadonlyStore`](README.md#readonlystore)<`T`\> & { `set`: (`v`: `T`) => `void` ; `update`: (`updater`: [`Updater`](README.md#updater)<`T`\>) => `void`  }

A store that can have subscribers and emit values to them. It also
provides the current value upon subscription.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

node_modules/universal-stores/dist/index.d.ts:56

___

### StoreConfig

Ƭ **StoreConfig**<`T`\>: `Object`

Configurations for Store<T> and ReadonlyStore<T>.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `comparator?` | [`EqualityComparator`](README.md#equalitycomparator)<`T`\> | (optional, defaults to `(a, b) => a === b`) a function that's used to determine if the current value of the store value is different from the one being set and thus if the store needs to be updated and the subscribers notified. |
| `start?` | [`StartHandler`](README.md#starthandler)<`T`\> | (optional) a [StartHandler](README.md#starthandler) that will get called once there is at least one subscriber to this store. |

#### Defined in

node_modules/universal-stores/dist/index.d.ts:72

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

___

### Update

Ƭ **Update**<`T`\>: (`updater`: (`current`: `T`) => `T`) => `void`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

▸ (`updater`): `void`

A generic update function. Used in [Store](README.md#store)

##### Parameters

| Name | Type |
| :------ | :------ |
| `updater` | (`current`: `T`) => `T` |

##### Returns

`void`

#### Defined in

node_modules/universal-stores/dist/index.d.ts:20

___

### Updater

Ƭ **Updater**<`T`\>: (`current`: `T`) => `T`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

▸ (`current`): `T`

A generic updater function. Used in [Store](README.md#store)

##### Parameters

| Name | Type |
| :------ | :------ |
| `current` | `T` |

##### Returns

`T`

#### Defined in

node_modules/universal-stores/dist/index.d.ts:18

## Functions

### coalesceSignals

▸ **coalesceSignals**<`T`\>(`signals$`): [`ReadonlySignal`](README.md#readonlysignal)<`T`[`number`]\>

Coalesce multiple signals into one that will emit the latest value emitted
by any of the source signals.

Example:
```ts
const lastUpdate1$ = makeSignal<number>();
const lastUpdate2$ = makeSignal<number>();
const latestUpdate$ = coalesceSignals([lastUpdate1$, lastUpdate2$]);
latestUpdate$.subscribe((v) => console.log(v));
lastUpdate1$.emit(1577923200000); // will log 1577923200000
lastUpdate2$.emit(1653230659450); // will log 1653230659450
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `unknown`[] |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `signals$` | { [P in string \| number \| symbol]: ReadonlySignal<T[P]\> } | an array of signals to observe. |

#### Returns

[`ReadonlySignal`](README.md#readonlysignal)<`T`[`number`]\>

a new signal that emits whenever one of the source signals emits.

#### Defined in

node_modules/@cdellacqua/signals/dist/composition.d.ts:35

___

### deriveSignal

▸ **deriveSignal**<`T`, `U`\>(`signal$`, `transform`): [`ReadonlySignal`](README.md#readonlysignal)<`U`\>

Create a signal that emits whenever the passed signal emits. The original
emitted value gets transformed by the passed function and the result gets
emitted.

Example:
```ts
const signal$ = makeSignal<number>();
const derived$ = deriveSignal(signal$, (n) => n + 100);
derived$.subscribe((v) => console.log(v));
signal$.emit(3); // will trigger console.log, echoing 103
```

#### Type parameters

| Name |
| :------ |
| `T` |
| `U` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `signal$` | [`ReadonlySignal`](README.md#readonlysignal)<`T`\> | a signal. |
| `transform` | (`data`: `T`) => `U` | a transformation function. |

#### Returns

[`ReadonlySignal`](README.md#readonlysignal)<`U`\>

a new signal that will emit the transformed data.

#### Defined in

node_modules/@cdellacqua/signals/dist/composition.d.ts:18

___

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

[src/lib/index.ts:208](https://github.com/cdellacqua/channel.js/blob/main/src/lib/index.ts#L208)

___

### makeCircularQueue

▸ **makeCircularQueue**<`T`\>(`capacity`): [`CircularQueue`](README.md#circularqueue)<`T`\>

Create a circular queue of a given capacity.

Example usage:
```ts
const queue = makeCircularQueue<string>(3);
queue.enqueue('hello');
queue.enqueue('world');
queue.enqueue('!');
console.log(queue.dequeue()); // hello
console.log(queue.dequeue()); // world
queue.enqueue('bye');
console.log(queue.toArray().join(', ')); // !, bye
```

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `capacity` | `number` | the number of slots to allocate for this queue. |

#### Returns

[`CircularQueue`](README.md#circularqueue)<`T`\>

a [CircularQueue](README.md#circularqueue)

#### Defined in

node_modules/reactive-circular-queue/dist/index.d.ts:176

▸ **makeCircularQueue**<`T`\>(`fromArray`, `capacity?`): [`CircularQueue`](README.md#circularqueue)<`T`\>

Create a circular queue and initialize it with
elements from an array. If the capacity (second optional parameter) is not passed,
the array length will be used to determine the maximum queue size.

Example usage:
```ts
const queue = makeCircularQueue(['hello', 'world']);
console.log(queue.dequeue()); // hello
console.log(queue.dequeue()); // world
```

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fromArray` | `T`[] | an array used to initialize the queue. |
| `capacity?` | `number` | (optional) the maximum queue size. If the array length is greater than the capacity, the extra elements will be ignored. |

#### Returns

[`CircularQueue`](README.md#circularqueue)<`T`\>

a [CircularQueue](README.md#circularqueue)

#### Defined in

node_modules/reactive-circular-queue/dist/index.d.ts:194

___

### makeDerivedStore

▸ **makeDerivedStore**<`TIn`, `TOut`\>(`readonlyStore`, `map`, `config?`): [`ReadonlyStore`](README.md#readonlystore)<`TOut`\>

Create a derived store.

Example usage:
```ts
const source$ = makeStore(10);
const derived$ = makeDerivedStore(source$, (v) => v * 2);
source$.subscribe((v) => console.log(v)); // prints 10
derived$.subscribe((v) => console.log(v)); // prints 20
source$.set(16); // triggers both console.logs, printing 16 and 32
```

#### Type parameters

| Name |
| :------ |
| `TIn` |
| `TOut` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `readonlyStore` | [`ReadonlyStore`](README.md#readonlystore)<`TIn`\> | a store or readonly store. |
| `map` | (`value`: `TIn`) => `TOut` | a function that takes the current value of the source store and maps it to another value. |
| `config?` | [`DerivedStoreConfig`](README.md#derivedstoreconfig)<`TOut`\> | a [DerivedStoreConfig](README.md#derivedstoreconfig) which contains configuration information such as a value comparator to avoid needless notifications to subscribers. |

#### Returns

[`ReadonlyStore`](README.md#readonlystore)<`TOut`\>

#### Defined in

node_modules/universal-stores/dist/composition.d.ts:37

▸ **makeDerivedStore**<`TIn`, `TOut`\>(`readonlyStores`, `map`, `config?`): [`ReadonlyStore`](README.md#readonlystore)<`TOut`\>

Create a derived store from multiple sources.

Example usage:
```ts
const source1$ = makeStore(10);
const source2$ = makeStore(-10);
const derived$ = makeDerivedStore([source1$, source2$], ([v1, v2]) => v1 + v2);
source1$.subscribe((v) => console.log(v)); // prints 10
source2$.subscribe((v) => console.log(v)); // prints -10
derived$.subscribe((v) => console.log(v)); // prints 0
source1$.set(11); // prints 11 (first console.log) and 1 (third console.log)
source2$.set(9); // prints 9 (second console.log) and 20 (third console.log)
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TIn` | extends `unknown`[] \| [`unknown`, ...unknown[]] |
| `TOut` | `TOut` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `readonlyStores` | { [K in string \| number \| symbol]: ReadonlyStore<TIn[K]\> } | an array of stores or readonly stores. |
| `map` | (`value`: { [K in string \| number \| symbol]: TIn[K] }) => `TOut` | a function that takes the current value of all the source stores and maps it to another value. |
| `config?` | [`DerivedStoreConfig`](README.md#derivedstoreconfig)<`TOut`\> | a [DerivedStoreConfig](README.md#derivedstoreconfig) which contains configuration information such as a value comparator to avoid needless notifications to subscribers. |

#### Returns

[`ReadonlyStore`](README.md#readonlystore)<`TOut`\>

#### Defined in

node_modules/universal-stores/dist/composition.d.ts:56

▸ **makeDerivedStore**<`TIn`, `TOut`\>(`readonlyStores`, `map`, `config?`): [`ReadonlyStore`](README.md#readonlystore)<`TOut`\>

Create a derived store from multiple sources.

Example usage:
```ts
const source1$ = makeStore(10);
const source2$ = makeStore(-10);
const derived$ = makeDerivedStore({v1: source1$, v2: source2$}, ({v1, v2}) => v1 + v2);
source1$.subscribe((v) => console.log(v)); // prints 10
source2$.subscribe((v) => console.log(v)); // prints -10
derived$.subscribe((v) => console.log(v)); // prints 0
source1$.set(11); // prints 11 (first console.log) and 1 (third console.log)
source2$.set(9); // prints 9 (second console.log) and 20 (third console.log)
```

#### Type parameters

| Name |
| :------ |
| `TIn` |
| `TOut` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `readonlyStores` | { [K in string \| number \| symbol]: ReadonlyStore<TIn[K]\> } | an array of stores or readonly stores. |
| `map` | (`value`: { [K in string \| number \| symbol]: TIn[K] }) => `TOut` | a function that takes the current value of all the source stores and maps it to another value. |
| `config?` | [`DerivedStoreConfig`](README.md#derivedstoreconfig)<`TOut`\> | a [DerivedStoreConfig](README.md#derivedstoreconfig) which contains configuration information such as a value comparator to avoid needless notifications to subscribers. |

#### Returns

[`ReadonlyStore`](README.md#readonlystore)<`TOut`\>

#### Defined in

node_modules/universal-stores/dist/composition.d.ts:79

___

### makeReadonlyStore

▸ **makeReadonlyStore**<`T`\>(`initialValue`, `start?`): [`ReadonlyStore`](README.md#readonlystore)<`T`\>

Make a store of type T.

Example usage:
```ts
let value = 0;
const store$ = makeReadonlyStore(value, (set) => {
	value++;
	set(value);
});
console.log(store$.content()); // 1
store$.subscribe((v) => console.log(v)); // immediately prints 2
console.log(store$.content()); // 2
```

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `initialValue` | `undefined` \| `T` | the initial value of the store. |
| `start?` | [`StartHandler`](README.md#starthandler)<`T`\> | a [StartHandler](README.md#starthandler) that will get called once there is at least one subscriber to this store. |

#### Returns

[`ReadonlyStore`](README.md#readonlystore)<`T`\>

a ReadonlyStore

#### Defined in

node_modules/universal-stores/dist/index.d.ts:144

▸ **makeReadonlyStore**<`T`\>(`initialValue`, `config?`): [`ReadonlyStore`](README.md#readonlystore)<`T`\>

Make a store of type T.

Example usage:
```ts
const store$ = makeReadonlyStore({prop: 'some value'}, {
	comparator: (a, b) => a.prop === b.prop,
	start: (set) => {
		// ...
	},
});
```

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `initialValue` | `undefined` \| `T` | the initial value of the store. |
| `config?` | [`StoreConfig`](README.md#storeconfig)<`T`\> | a [StoreConfig](README.md#storeconfig) which contains configuration information such as a value comparator to avoid needless notifications to subscribers and a [StartHandler](README.md#starthandler). |

#### Returns

[`ReadonlyStore`](README.md#readonlystore)<`T`\>

a ReadonlyStore

#### Defined in

node_modules/universal-stores/dist/index.d.ts:161

▸ **makeReadonlyStore**<`T`\>(`initialValue`, `startOrConfig?`): [`ReadonlyStore`](README.md#readonlystore)<`T`\>

Make a store of type T.

Example usage:
```ts
let value = 0;
const store$ = makeReadonlyStore(value, (set) => {
	value++;
	set(value);
});
console.log(store$.content()); // 1
store$.subscribe((v) => console.log(v)); // immediately prints 2
console.log(store$.content()); // 2
```

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `initialValue` | `undefined` \| `T` | the initial value of the store. |
| `startOrConfig?` | [`StartHandler`](README.md#starthandler)<`T`\> \| [`StoreConfig`](README.md#storeconfig)<`T`\> | a [StartHandler](README.md#starthandler) or a [StoreConfig](README.md#storeconfig) which contains configuration information such as a value comparator to avoid needless notifications to subscribers and a [StartHandler](README.md#starthandler). |

#### Returns

[`ReadonlyStore`](README.md#readonlystore)<`T`\>

a ReadonlyStore

#### Defined in

node_modules/universal-stores/dist/index.d.ts:180

___

### makeSignal

▸ **makeSignal**<`T`\>(): [`Signal`](README.md#signal)<`T`\>

Make a signal of type T.

Example usage:
```ts
const signal$ = makeSignal<number>();
signal$.emit(10);
```
Example usage with no data:
```ts
const signal$ = makeSignal<void>();
signal$.emit();
```

#### Type parameters

| Name |
| :------ |
| `T` |

#### Returns

[`Signal`](README.md#signal)<`T`\>

a signal.

#### Defined in

node_modules/@cdellacqua/signals/dist/index.d.ts:50

___

### makeStore

▸ **makeStore**<`T`\>(`initialValue`, `start?`): [`Store`](README.md#store)<`T`\>

Make a store of type T.

Example usage:
```ts
const store$ = makeStore(0);
console.log(store$.content()); // 0
store$.subscribe((v) => console.log(v));
store$.set(10); // will trigger the above console log, printing 10
```

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `initialValue` | `undefined` \| `T` | the initial value of the store. |
| `start?` | [`StartHandler`](README.md#starthandler)<`T`\> | a [StartHandler](README.md#starthandler) that will get called once there is at least one subscriber to this store. |

#### Returns

[`Store`](README.md#store)<`T`\>

a Store

#### Defined in

node_modules/universal-stores/dist/index.d.ts:95

▸ **makeStore**<`T`\>(`initialValue`, `config?`): [`Store`](README.md#store)<`T`\>

Make a store of type T.

Example usage:
```ts
const store$ = makeStore(0);
console.log(store$.content()); // 0
store$.subscribe((v) => console.log(v));
store$.set(10); // will trigger the above console log, printing 10
```

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `initialValue` | `undefined` \| `T` | the initial value of the store. |
| `config?` | [`StoreConfig`](README.md#storeconfig)<`T`\> | a [StoreConfig](README.md#storeconfig) which contains configuration information such as a value comparator to avoid needless notifications to subscribers and a [StartHandler](README.md#starthandler). |

#### Returns

[`Store`](README.md#store)<`T`\>

a Store

#### Defined in

node_modules/universal-stores/dist/index.d.ts:110

▸ **makeStore**<`T`\>(`initialValue`, `startOrConfig?`): [`Store`](README.md#store)<`T`\>

Make a store of type T.

Example usage:
```ts
const store$ = makeStore(0);
console.log(store$.content()); // 0
store$.subscribe((v) => console.log(v));
store$.set(10); // will trigger the above console log, printing 10
```

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `initialValue` | `undefined` \| `T` | the initial value of the store. |
| `startOrConfig?` | [`StartHandler`](README.md#starthandler)<`T`\> \| [`StoreConfig`](README.md#storeconfig)<`T`\> | a [StartHandler](README.md#starthandler) or a [StoreConfig](README.md#storeconfig) which contains configuration information such as a value comparator to avoid needless notifications to subscribers and a [StartHandler](README.md#starthandler). |

#### Returns

[`Store`](README.md#store)<`T`\>

a Store

#### Defined in

node_modules/universal-stores/dist/index.d.ts:125
