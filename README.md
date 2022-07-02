# reactive-channel

A simple yet powerful abstraction that enables communication between asynchronous tasks.

A Channel is an abstraction that enables
communication between asynchronous tasks.
A channel exposes two objects: `tx` and `rx`,
which respectively provide methods to transmit
and receive data.

Channels can be used and combined in a multitude of
ways. The simplest way to use a channel is to create
a simplex communication: one task transmits data, another consumes it.
A full-duplex communication can be achieved by creating two channels
and exchanging the `rx` and `tx` objects between two tasks.

It's also possible to create a Multiple Producers Single Consumer (mpsc) scenario
by sharing a single channel among several tasks.

[NPM Package](https://www.npmjs.com/package/reactive-channel)

`npm install reactive-channel`

[Documentation](./docs/README.md)

## Highlights

`Channel<T>` provides the following properties:

- `tx`, an object that exposes methods and properties to interact and query the transmitting end of the channel;
- `rx`, an object that exposes methods and properties to interact and query the receiving end of the channel;
- `buffer`, a readonly queue that represents the internal buffer containing data waiting to be consumed by the receiving end.

The `tx` object is a `ChannelTx<T>`, which in turn exposes the following:

- `capacity`, the total capacity of the channel, configured at creation time;
- `send(...)`, to send data to the receiving end. If the receiving end is
  not waiting for data, this method will enqueue the message in the channel
  buffer;
- `sendWait(...)`, similar to `send(...)`, but let the caller wait for
  the receiving end to consume the data;
- `close()`, to close the channel. This will also reject all pending receiving Promises;
- `closed`/`closed$`, boolean getter and store that can be used to check
  if the channel has been closed, i.e. the `close()` method has been called by either the receiving or transmission end of the channel;
- `canWrite`/`canWrite$`, boolean getter and store that can be used to check
  if the channel is capable of receiving data, that is its buffer is not full and the channel is not closed;
- `availableOutboxSlots`/`availableOutboxSlots$`, number getter and store that can be used to check how much space is available in the transmission buffer.

The `rx` object is a `ChannelRx<T>`, which in turn exposes the following:

- `capacity`, the total capacity of the channel, configured at creation time;
- `recv(...)`, to receive data. If the transmission buffer contains some data
  the returned promise resolves immediately, otherwise it will resolve once
  the transmitting end calls `send(...)` or `sendWait(...)`;
- `iter()/[Symbol.asyncIterator]()`, to consume the channel buffer using an async iterator;
- `close()`, to close the channel. This will also reject all pending receiving Promises;
- `closed`/`closed$`, boolean getter and store that can be used to check
  if the channel has been closed, i.e. the `close()` method has been called by either the receiving or transmission end of the channel;
- `canRead`/`canRead$`, boolean getter and store that can be used to check
  if the channel can be consumed, that is its buffer is not empty and the channel is not closed;
- `filledInboxSlots`/`filledInboxSlots$`, number getter and store that can be used to check how much space is filled in the transmission buffer.

This library provides a function called `makeChannel` to create `Channel<T>` objects.

### Examples

Basics:

```ts
import {makeChannel} from 'reactive-channel';

// Create a channel that can be used to pass strings.
const {rx, tx} = makeChannel<string>();
rx.recv().then((message) => console.log(message));
// ...
tx.send('hello!'); // this will resolve the above promise, printing "hello!"
```

Reactivity:

```ts
import {makeChannel} from 'reactive-channel';

// Create a channel that can be used to pass strings.
const {rx, tx} = makeChannel<string>();
tx.availableOutboxSlots$
	// this will immediately print 1024, which is the default channel capacity.
	.subscribe((n) => console.log(`Available slots: ${n}`));

// this will trigger the above subscription, printing 1023,
// because there is no pending `recv` that can consume the data.
tx.send('hello!');
// this will also trigger the subscription, printing 1024 again,
// because `recv()` will consume the channel buffer, emptying it.
rx.recv();
```

Simple job queue:

```ts
import {makeChannel} from 'reactive-channel';

// Create a channel that can be used to pass strings.
const {rx, tx} = makeChannel<{email: string; content: string}>();

async function processEmailQueue() {
	while (!rx.closed) {
		try {
			const {email, content} = await rx.recv();
			console.log(`Now sending an email to ${email}`);
			// ... your favorite email dispatcher here.
		} catch (err) {
			console.error('unable to send because of the following error:', err);
		}
	}
}

// Somewhere in the startup of your application.
processEmailQueue();

// Somewhere where an email should be sent, e.g. when a user subscribes to your newsletter.
tx.send({
	email: user.email,
	content: 'Subscription activated, you will receive our best deals and coupons!',
});
```

Abort a blocking `recv(...)`

You can abort a `recv` using a simple timeout:
```ts
import {makeChannel} from 'reactive-channel';

// Create a channel that can be used to pass strings.
const {rx, tx} = makeChannel<{email: string; content: string}>();
// You can abort a `recv` using a simple timeout:
try {
	const {email, content} = await rx.recv({timeout: 5000});
} catch (err) {
	if (err instanceof ChannelTimeoutError) {
		console.warn('No data to consume, timeout expired');
	}
	// ...
}
```

Or you can abort a `recv` using some custom logic, e.g. when the user clicks a button:

```ts
import {makeChannel} from 'reactive-channel';
import {makeSignal} from '@cdellacqua/signals';

// Create a channel that can be used to pass strings.
const {rx, tx} = makeChannel<{email: string; content: string}>();

const abort$ = makeSignal<Error>();
// Assuming you have a `abortButton` variable
abortButton.addEventListener(
	'click',
	() => abort$.emit(new Error('Action cancelled by the user'))
);

// You can abort a `recv` using an abort$ signal:
try {
	const {email, content} = await rx.recv({abort$});
} catch (err) {
	// ...
}
```
