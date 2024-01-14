import {makeCircularQueue, ReadonlyCircularQueue} from 'reactive-circular-queue';
import {makeDerivedStore, makeStore, ReadonlyStore} from 'universal-stores';

export type {ReadonlyCircularQueue} from 'reactive-circular-queue';
export {
	NotEnoughAvailableSlotsQueueError,
	NotEnoughFilledSlotsQueueError,
} from 'reactive-circular-queue';
export type {Unsubscribe, Subscriber, ReadonlyStore} from 'universal-stores';

const noop = () => undefined as void;

/**
 * Error that occurs when the channel buffer has been filled up, and thus it cannot
 * accept any more `send` calls.
 */
export class ChannelFullError extends Error {
	constructor() {
		super('channel full, cannot enqueue data');
	}
}

/**
 * Error that occurs trying to send or receive data from
 * a closed channel.
 */
export class ChannelClosedError extends Error {
	constructor() {
		super('channel closed');
	}
}

/**
 * Error that occurs when calling `recv`
 * and there are already too many enqueued similar requests.
 */
export class ChannelTooManyPendingRecvError extends Error {
	constructor() {
		super('channel has already too many pending recv');
	}
}

/**
 * Transmission end of a channel.
 */
export type ChannelTx<T> = {
	/**
	 * Push data into the channel.
	 * This operation enqueues the passed value in the transmission queue if there
	 * is no pending `recv`.
	 * @param v the data to send.
	 * @throws {ChannelClosedError} if the channel is closed.
	 * @throws {ChannelFullError} if the channel is transmission queue is full.
	 */
	send(v: T): void;
	/**
	 * Push data into the channel and waits for it to be consumed by the receiving end.
	 * This operation enqueues the passed value in the transmission queue if there
	 * is no pending `recv`, but removes it if the operation is aborted by an abort
	 * signal.
	 * @param v the data to send.
	 * @param options.signal (optional) an abort signal to stop the pending promise.
	 * If this signal emits before `sendWait` can resolve, the enqueued value will be removed
	 * and the emitted value will be "thrown" (as in `throw ...;`) to the caller
	 * of `sendWait`.
	 * @throws {ChannelClosedError} if the channel is closed.
	 * @throws {ChannelFullError} if the channel is transmission queue is full.
	 * @throws {unknown} if `signal` triggers before `sendWait` can resolve.
	 */
	sendWait(v: T, options?: {signal?: AbortSignal}): Promise<void>;
	/**
	 * A store that contains true if the transmission buffer is not full and the channel is not closed.
	 */
	canWrite$: ReadonlyStore<boolean>;
	/**
	 * A store that contains the number of available slots (from 0 to the channel capacity) in the output buffer or 0 if the channel is closed.
	 */
	availableOutboxSlots$: ReadonlyStore<number>;
	/**
	 * Return the total size (number of slots) of the channel buffer.
	 */
	get capacity(): number;
	/**
	 * Close the channel, stopping all pending send/recv requests.
	 */
	close(): void;
	/**
	 * A store that contains true if the channel is closed.
	 */
	closed$: ReadonlyStore<boolean>;
};

/**
 * Receiving end of a channel.
 */
export type ChannelRx<T> = {
	/**
	 * A store that contains true if there is some data ready to be consumed, the channel is not closed and there are not too many pending `recv` requests.
	 */
	canRead$: ReadonlyStore<boolean>;
	/**
	 * A store that contains the number of filled slots (from 0 to the channel capacity) in the input buffer or 0 if the channel is closed.
	 */
	filledInboxSlots$: ReadonlyStore<number>;
	/**
	 * Return the total size (number of slots) of the channel buffer.
	 */
	get capacity(): number;
	/**
	 * Consume data from the channel buffer.
	 * If there is no data in the channel, this method will block the caller
	 * until it's available.
	 * @param options.signal (optional) an abort signal to stop the pending promise.
	 * If this signal triggers before `recv` can resolve, the channel buffer won't be
	 * consumed and the abort reason value will be "thrown" (as in `throw ...;`) to the caller
	 * of `recv`.
	 * @throws {ChannelClosedError} if the channel is closed.
	 * @throws {unknown} if `.abort(...)` is called before `recv` is able to consume the channel buffer.
	 */
	recv(options?: {signal?: AbortSignal}): Promise<T>;
	/**
	 * Return an async iterator that consumes the channel buffer
	 * If the channel buffer is already empty the iterator will not emit any value.
	 */
	iter(): AsyncIterator<T>;
	/**
	 * Return an async iterator that consumes the channel buffer
	 * If the channel buffer is already empty the iterator will not emit any value.
	 */
	[Symbol.asyncIterator](): AsyncIterator<T>;
	/**
	 * Close the channel, stopping all pending send/recv requests.
	 */
	close(): void;
	/**
	 * A store that contains true if the channel is closed.
	 */
	closed$: ReadonlyStore<boolean>;
	/**
	 * A store that contains the number of currently waiting `recv` promises.
	 */
	pendingRecvPromises$: ReadonlyStore<number>;
};

/**
 * A Channel is an abstraction that enables
 * communication between asynchronous tasks.
 * A channel exposes two objects: `tx` and `rx`,
 * which respectively provide methods to transmit
 * and receive data.
 *
 * Channels can be used and combined in a multitude of
 * ways. The simplest way to use a channel is by creating
 * a simplex communication: one task transmit data, another consumes it.
 * A full-duplex communication can be achieved by creating two channels
 * and exchanging the `rx` and `tx` objects between two tasks.
 *
 * It's also possible to create a Multiple Producers Single Consumer (mpsc) scenario
 * by sharing a single channel among several tasks.
 */
export type Channel<T> = {
	/**
	 * Transmission end of the channel.
	 */
	tx: ChannelTx<T>;
	/**
	 * Receiving end of the channel.
	 */
	rx: ChannelRx<T>;
	/**
	 * Return the internal buffer in readonly mode.
	 */
	get buffer(): ReadonlyCircularQueue<T>;
};

export type MakeChannelParams = {
	/** (optional, defaults to 1024) The maximum number of items that the channel can buffer while waiting data to be consumed. */
	capacity?: number;
	/** (optional, defaults to 1024) The maximum number of pending `recv`. If this limit is reached, `recv` will immediately reject with {@link ChannelTooManyPendingRecvError}. */
	maxConcurrentPendingRecv?: number;
};

/**
 * Create a Channel.
 *
 * A Channel is an abstraction that enables
 * communication between asynchronous tasks.
 * A channel exposes two objects: `tx` and `rx`,
 * which respectively provide methods to transmit
 * and receive data.
 *
 * Channels can be used and combined in a multitude of
 * ways. The simplest way to use a channel is by creating
 * a simplex communication: one task transmit data, another consumes it.
 * A full-duplex communication can be achieved by creating two channels
 * and exchanging the `rx` and `tx` objects between two tasks.
 *
 * It's also possible to create a Multiple Producers Single Consumer (mpsc) scenario
 * by sharing a single channel among several tasks.
 *
 * Example:
 * ```ts
 * const {tx, rx} = makeChannel<number>();
 * rx.recv().then((n) => console.log('Here it is: ' + n)); // doesn't print anything, the channel is currently empty.
 * tx.send(1); // resolves the above promise, causing it to print 'Here it is: 1'
 * ```
 *
 * @param params (optional) configuration parameters for this channel (e.g maximum capacity).
 * @param params.capacity (optional, defaults to 1024) The maximum number of items that the channel can buffer while waiting data to be consumed.
 * @param params.maxConcurrentPendingRecv (optional, defaults to 1024) The maximum number of pending `recv`. If this limit is reached, `recv` will immediately reject with {@link ChannelTooManyPendingRecvError}.
 * @returns a {@link Channel}
 */
export function makeChannel<T>(params?: MakeChannelParams): Channel<T> {
	const {capacity = 1024, maxConcurrentPendingRecv = 1024} = params || {};

	type BufferItemMetadata = {
		promise: Promise<void>;
		resolveSend: () => void;
		rejectSend: (err?: unknown) => void;
	};
	type BufferItem = BufferItemMetadata & {
		value: T;
	};
	type RecvQueueItem = {
		resolveRecv: (item: BufferItem) => void;
		rejectRecv: (err?: unknown) => void;
	};
	const metadataQueue = makeCircularQueue<BufferItemMetadata>(capacity);
	const itemsQueue = makeCircularQueue<T>(capacity);
	const recvQueue = makeCircularQueue<RecvQueueItem>(maxConcurrentPendingRecv);

	const closed$ = makeStore(false);
	const availableOutboxSlots$ = makeDerivedStore(
		[closed$, metadataQueue.availableSlots$],
		([closed, availableSlots]) => (closed ? 0 : availableSlots),
	);
	const filledInboxSlots$ = makeDerivedStore(
		[closed$, metadataQueue.filledSlots$],
		([closed, filledSlots]) => (closed ? 0 : filledSlots),
	);
	const canWrite$ = makeDerivedStore(
		availableOutboxSlots$,
		(availableOutboxSlots) => availableOutboxSlots > 0,
	);
	const canRead$ = makeDerivedStore(
		[filledInboxSlots$, recvQueue.full$],
		([filledInboxSlots, recvFull]) => filledInboxSlots > 0 && !recvFull,
	);

	async function sendWait(v: T, options?: {signal?: AbortSignal}): Promise<void> {
		if (closed$.content()) {
			throw new ChannelClosedError();
		}
		if (metadataQueue.full$.content()) {
			throw new ChannelFullError();
		}
		let resolveSend: () => void = noop;
		let rejectSend: () => void = noop;
		const promise = new Promise<void>((res, rej) => {
			resolveSend = res;
			rejectSend = rej;
		});
		let metadataItem: BufferItemMetadata | undefined;
		if (!recvQueue.empty$.content()) {
			recvQueue.dequeue().resolveRecv({
				promise,
				resolveSend,
				rejectSend,
				value: v,
			});
		} else {
			metadataItem = {
				promise,
				resolveSend,
				rejectSend,
			};
			metadataQueue.enqueue(metadataItem);
			itemsQueue.enqueue(v);
		}
		try {
			if (!options?.signal) {
				await promise;
			} else {
				const signal = options.signal;
				signal.throwIfAborted();
				await Promise.race([
					promise,
					new Promise<void>((_, rej) => {
						signal.addEventListener('abort', () => {
							// Postpone the rejection by one "tick" to
							// make the fulfillment of the above promise
							// have priority over the rejection caused by the signal.
							Promise.resolve()
								.then(() => rej(signal.reason))
								.catch(noop);
						});
					}),
				]);
			}
		} catch (err) {
			if (metadataItem) {
				const metadataItemIndex = metadataQueue.indexOf(metadataItem);
				if (metadataItemIndex !== -1) {
					metadataQueue.remove(metadataItemIndex);
					itemsQueue.remove(metadataItemIndex);
				}
			}
			throw err;
		}
	}

	function send(v: T): void {
		if (closed$.content()) {
			throw new ChannelClosedError();
		}
		if (metadataQueue.full$.content()) {
			throw new ChannelFullError();
		}
		sendWait(v).catch(noop);
	}

	async function recv(options?: {signal?: AbortSignal}) {
		if (closed$.content()) {
			throw new ChannelClosedError();
		}
		let item: BufferItem;
		if (!metadataQueue.empty$.content()) {
			item = {...metadataQueue.dequeue(), value: itemsQueue.dequeue()};
		} else {
			if (recvQueue.full$.content()) {
				throw new ChannelTooManyPendingRecvError();
			}
			const recvContext: RecvQueueItem = {
				resolveRecv: noop,
				rejectRecv: noop,
			};
			const recvPromise = new Promise<BufferItem>((res, rej) => {
				recvContext.resolveRecv = res;
				recvContext.rejectRecv = rej;
				recvQueue.enqueue(recvContext);
			});

			try {
				if (!options?.signal) {
					item = await recvPromise;
				} else {
					const signal = options.signal;
					signal.throwIfAborted();
					item = await Promise.race([
						recvPromise,
						new Promise<BufferItem>((_, rej) => {
							signal.addEventListener('abort', () => {
								// Postpone the rejection by one "tick" to
								// make the fulfillment of the above promise
								// have priority over the rejection caused by the signal.
								Promise.resolve()
									.then(() => rej(signal.reason))
									.catch(noop);
							});
						}),
					]);
				}
			} catch (err) {
				const recvContextIndex = recvQueue.indexOf(recvContext);
				if (recvContextIndex !== -1) {
					recvQueue.remove(recvContextIndex);
				}
				throw err;
			}
		}
		item.resolveSend();
		return item.value;
	}

	async function* iter() {
		while (metadataQueue.filledSlots$.content() > 0) {
			yield await recv();
		}
	}

	function close() {
		if (closed$.content()) {
			return;
		}
		closed$.set(true);
		const channelClosedError = new ChannelClosedError();
		for (const pendingRecv of recvQueue) {
			pendingRecv.rejectRecv(channelClosedError);
		}
		for (const item of metadataQueue) {
			item.rejectSend(channelClosedError);
		}
		itemsQueue.clear();
	}

	return {
		buffer: itemsQueue,
		tx: {
			send,
			sendWait,
			canWrite$,
			closed$,
			close,
			availableOutboxSlots$,
			capacity,
		},
		rx: {
			pendingRecvPromises$: recvQueue.filledSlots$,
			recv,
			iter,
			[Symbol.asyncIterator]: iter,
			canRead$: canRead$,
			closed$,
			close,
			capacity,
			filledInboxSlots$,
		},
	};
}
