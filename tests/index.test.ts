import {
	ChannelClosedError,
	ChannelFullError,
	ChannelTooManyPendingRecvError,
	makeChannel,
} from '../src/lib/index.js';

function sleep(ms: number) {
	return new Promise((res) => setTimeout(res, ms));
}

describe('channel', () => {
	it('tests a simple use case of send + recv', async () => {
		const {tx, rx} = makeChannel<number>({capacity: 1});
		tx.send(1);
		await expect(rx.recv()).resolves.toBe(1);
	});
	it('tests sendWait', async () => {
		const {tx, rx} = makeChannel<number>({capacity: 1});
		await Promise.all([
			expect(tx.sendWait(1)).resolves.toBeUndefined(),
			expect(rx.recv()).resolves.toBe(1),
		]);
	});
	it('tests sendWait with a full channel', async () => {
		const {tx, rx} = makeChannel<number>({capacity: 1});
		tx.send(1);
		await expect(tx.sendWait(1)).rejects.toBeDefined();
		await expect(rx.recv()).resolves.toBe(1);
	});
	it('tests sendWait with a full channel, followed by a recv + send', async () => {
		const {tx, rx} = makeChannel<number>({capacity: 1});
		tx.send(1);
		await expect(tx.sendWait(1)).rejects.toBeDefined();
		await expect(rx.recv()).resolves.toBe(1);
		expect(() => tx.send(1)).not.to.throw();
	});
	it('tests canRead/canWrite stores', async () => {
		const {tx, rx} = makeChannel<number>({capacity: 1});
		expect(tx.canWrite$.content()).to.be.true;
		expect(rx.canRead$.content()).to.be.false;
		tx.send(1);
		expect(tx.canWrite$.content()).to.be.false;
		expect(rx.canRead$.content()).to.be.true;
	});
	it('tests slots stores', async () => {
		const {tx, rx} = makeChannel<number>({capacity: 1});
		expect(tx.availableOutboxSlots$.content()).to.eq(1);
		expect(rx.filledInboxSlots$.content()).to.eq(0);
		tx.send(1);
		expect(tx.availableOutboxSlots$.content()).to.eq(0);
		expect(rx.filledInboxSlots$.content()).to.eq(1);
	});
	it('tests pending recv stores', async () => {
		const {tx, rx} = makeChannel<number>({maxConcurrentPendingRecv: 1});
		expect(rx.pendingRecvPromises$.content()).to.eq(0);
		const recvPromise = rx.recv();
		expect(rx.pendingRecvPromises$.content()).to.eq(1);
		await expect(rx.recv()).rejects.toBeInstanceOf(ChannelTooManyPendingRecvError);
		expect(rx.pendingRecvPromises$.content()).to.eq(1);
		tx.send(1);
		expect(rx.pendingRecvPromises$.content()).to.eq(0);
		await expect(recvPromise).resolves.toBe(1);
	});
	it('tests closed store', async () => {
		const {tx, rx} = makeChannel<number>({capacity: 1});
		expect(tx.closed$.content()).to.be.false;
		expect(rx.closed$.content()).to.be.false;
		tx.close();
		expect(tx.closed$.content()).to.be.true;
		expect(rx.closed$.content()).to.be.true;
	});
	it('tests the iterators', async () => {
		const {tx, rx} = makeChannel<number>({capacity: 5});
		for await (const _ of rx) {
			expect(false).to.be.true; // unreachable
		}
		expect((await rx.iter().next()).done).to.be.true;

		tx.send(1);
		tx.send(2);
		tx.send(3);
		tx.send(4);
		tx.send(5);

		let counter = 1;
		for await (const item of rx) {
			expect(item).to.eq(counter);
			counter++;
		}

		tx.send(1);
		tx.send(2);
		tx.send(3);
		tx.send(4);
		tx.send(5);

		const iterator = rx.iter();
		for (let i = 1; i <= 5; i++) {
			expect((await iterator.next()).value).to.eq(i);
		}
	});
	it('closes a channel twice', async () => {
		const {tx, rx} = makeChannel<number>({capacity: 1});
		expect(tx.closed$.content()).to.be.false;
		expect(rx.closed$.content()).to.be.false;
		tx.close();
		expect(tx.closed$.content()).to.be.true;
		expect(rx.closed$.content()).to.be.true;
		expect(() => tx.close()).not.to.throw();
		expect(tx.closed$.content()).to.be.true;
		expect(rx.closed$.content()).to.be.true;
	});
	it('tests a simple queue', async () => {
		const {tx, rx} = makeChannel<number>({capacity: 3});
		const receivedValues: number[] = [];
		void (async () => {
			let exit = false;
			while (!exit) {
				const receivedValue = await rx.recv();
				receivedValues.push(receivedValue);
				await sleep(1);
				exit = receivedValue === -1;
			}
		})().catch(console.error);
		tx.send(1);
		tx.send(2);
		await tx.sendWait(3);
		expect(receivedValues).to.eql([1, 2, 3]);
		await tx.sendWait(-1);
	});
	it("tests a simple queue and closes the channel while it's been consumed", async () => {
		const {tx, rx} = makeChannel<number>({capacity: 3});
		const receivedValues: number[] = [];
		const recvPromise = (async () => {
			let exit = false;
			while (!exit) {
				const receivedValue = await rx.recv();
				receivedValues.push(receivedValue);
				await sleep(1);
				exit = receivedValue === -1;
			}
		})();
		tx.send(1);
		tx.close();
		expect(() => tx.send(2)).to.throw(ChannelClosedError);
		await expect(tx.sendWait(2)).rejects.toBeInstanceOf(ChannelClosedError);
		await expect(recvPromise).rejects.toBeInstanceOf(ChannelClosedError);
	});
	it('tests a simple queue and closes the channel while transmitting data', async () => {
		const {tx, rx} = makeChannel<number>({capacity: 3});
		const receivedValues: number[] = [];
		const recvPromise = (async () => {
			let exit = false;
			while (!exit) {
				const receivedValue = await rx.recv();
				receivedValues.push(receivedValue);
				await sleep(10);
				exit = receivedValue === -1;
			}
		})();
		tx.send(1);
		await Promise.all([
			expect(tx.sendWait(2)).rejects.toBeInstanceOf(ChannelClosedError),
			sleep(1).then(() => tx.close()),
		]);
		await expect(recvPromise).rejects.toBeInstanceOf(ChannelClosedError);
	});
	it('throttle a channel', async () => {
		const {tx, rx} = makeChannel<number>();
		const throttlePromise = Promise.all([
			(async () => {
				while (tx.canWrite$.content()) {
					tx.send(1);
				}
			})(),
			(async () => {
				while (true) {
					expect(await rx.recv()).to.eq(1);
				}
			})(),
		]);
		await sleep(50).then(() => tx.close());
		await expect(throttlePromise).rejects.toBeInstanceOf(ChannelClosedError);
	});
	it('tests recv with timeout', async () => {
		const {rx, tx} = makeChannel<string>();
		tx.send('hello!');
		expect(await rx.recv({signal: AbortSignal.timeout(5)})).to.eq('hello!');
	});
	it('tests sendWait with timeout', async () => {
		const {rx, tx} = makeChannel<string>();
		await expect(tx.sendWait('hello!', {signal: AbortSignal.timeout(5)})).rejects.toBeInstanceOf(DOMException);
		await expect(
			Promise.all([
				sleep(10).then(() => rx.recv()),
				tx.sendWait('hello!', {signal: AbortSignal.timeout(20)}),
			]),
		).resolves.toBeDefined();
	});
	it('tests too many pending recv', async () => {
		const {rx} = makeChannel<string>({maxConcurrentPendingRecv: 2});
		const recv1Promise = rx.recv();
		const recv2Promise = rx.recv();
		await expect(rx.recv()).rejects.toBeInstanceOf(ChannelTooManyPendingRecvError);
		rx.close();
		await expect(recv1Promise).rejects.toBeInstanceOf(ChannelClosedError);
		await expect(recv2Promise).rejects.toBeInstanceOf(ChannelClosedError);
	});
	it('fills a channel', async () => {
		const {tx} = makeChannel<number>({capacity: 2});
		tx.send(1);
		tx.send(1);
		expect(() => tx.send(1)).to.throw(ChannelFullError);
	});
	it('tests a custom abort signal', async () => {
		const {rx} = makeChannel<number>({capacity: 2});
		const abortController = new AbortController();
		await Promise.all([
			expect(rx.recv({signal: abortController.signal})).rejects.toBeInstanceOf(Error),
			sleep(10).then(() => abortController.abort(new Error())),
		]);
	});
	it('tests a custom abort signal that does not emit', async () => {
		const {rx, tx} = makeChannel<number>({capacity: 2});
		const abortController = new AbortController();
		tx.send(1);
		await expect(rx.recv({signal: abortController.signal})).resolves.toBe(1);
	});
	it('tests that an aborted sendWait restores the channel buffer', async () => {
		const {rx, tx} = makeChannel<number>({capacity: 2});
		const abortController = new AbortController();
		const sendWaitPromise = tx.sendWait(1, {signal: abortController.signal});
		const sendWaitExpectation = expect(sendWaitPromise).rejects.toBeInstanceOf(Error);
		expect(rx.filledInboxSlots$.content()).to.eq(1);
		await sleep(10);
		expect(rx.filledInboxSlots$.content()).to.eq(1);
		abortController.abort(new Error('abort sendWait'));
		await sleep(1);
		expect(rx.filledInboxSlots$.content()).to.eq(0);
		await sendWaitExpectation;
	});
	it('tests that an aborted sendWait fulfills if recv and abort happen almost at the same time', async () => {
		const {rx, tx} = makeChannel<number>({capacity: 2});
		const abortController = new AbortController();
		const sendWaitPromise = tx.sendWait(1, {signal: abortController.signal});
		const sendWaitExpectation = expect(sendWaitPromise).resolves.toBeUndefined();
		expect(rx.filledInboxSlots$.content()).to.eq(1);
		await sleep(10);
		expect(rx.filledInboxSlots$.content()).to.eq(1);
		abortController.abort(new Error('abort sendWait'));
		expect(await rx.recv()).to.eq(1);
		await sendWaitExpectation;
	});
	it('tests that an aborted sendWait restore the channel buffer', async () => {
		const {rx, tx} = makeChannel<number>({capacity: 2});
		const abortController = new AbortController();
		const sendWaitPromise = tx.sendWait(1, {signal: abortController.signal});
		const sendWaitExpectation = expect(sendWaitPromise).rejects.toBeInstanceOf(Error);
		expect(rx.filledInboxSlots$.content()).to.eq(1);
		await sleep(10);
		expect(rx.filledInboxSlots$.content()).to.eq(1);
		abortController.abort(new Error('abort sendWait'));
		await sleep(1);
		const recvPromise = rx.recv();
		await expect(
			Promise.race([
				recvPromise,
				sleep(10).then(() => Promise.reject(new DOMException('', 'TimeoutError'))),
			]),
		).rejects.toBeInstanceOf(DOMException);
		await sendWaitExpectation;
	});
	it('tests that an aborted recv does not consume the channel buffer', async () => {
		const {rx, tx} = makeChannel<number>({capacity: 2});
		const abortController = new AbortController();
		const recvPromise = rx.recv({signal: abortController.signal});
		const recvExpectation = expect(recvPromise).rejects.toBeInstanceOf(Error);
		expect(rx.pendingRecvPromises$.content()).to.eq(1);
		await sleep(10);
		expect(rx.pendingRecvPromises$.content()).to.eq(1);
		abortController.abort(new Error('abort sendWait'));
		await sleep(1);
		expect(rx.pendingRecvPromises$.content()).to.eq(0);
		await recvExpectation;
		tx.send(1);
		expect(rx.filledInboxSlots$.content()).to.eq(1);
	});
	it('tests that recv rejects immediately if the passed signal has already been aborted', async () => {
		const {rx} = makeChannel<number>({capacity: 2});
		const abortController = new AbortController();
		abortController.abort();
		const recvPromise = rx.recv({signal: abortController.signal});
		const recvExpectation = expect(recvPromise).rejects.toBeDefined();
		expect(rx.pendingRecvPromises$.content()).to.eq(0);
		await sleep(10);
		await recvExpectation;
	});
	it('tests that sendWait rejects immediately if the passed signal has already been aborted', async () => {
		const {tx} = makeChannel<number>({capacity: 2});
		const abortController = new AbortController();
		abortController.abort();
		const sendPromise = tx.sendWait(0, {signal: abortController.signal});
		const sendExpectation = expect(sendPromise).rejects.toBeDefined();
		await sleep(10);
		await sendExpectation;
	});
	it('tests that an aborted recv tests fulfills if send and abort happen almost at the same time', async () => {
		const {rx, tx} = makeChannel<number>({capacity: 2});
		const abortController = new AbortController();
		const recvPromise = rx.recv({signal: abortController.signal});
		expect(rx.pendingRecvPromises$.content()).to.eq(1);
		await sleep(10);
		expect(rx.pendingRecvPromises$.content()).to.eq(1);
		abortController.abort(new Error('abort recv'));
		expect(rx.pendingRecvPromises$.content()).to.eq(1);
		tx.send(1);
		await expect(recvPromise).resolves.toBe(1);
		expect(rx.filledInboxSlots$.content()).to.eq(0);
	});
	it('tests a multiple producer single consumer scenario', async () => {
		const {rx, tx} = makeChannel<number>({capacity: 20});
		const throttlePromise = Promise.all([
			(async () => {
				while (tx.canWrite$.content()) {
					tx.send(1);
				}
			})(),
			(async () => {
				while (tx.canWrite$.content()) {
					tx.send(2);
				}
			})(),
			(async () => {
				while (tx.canWrite$.content()) {
					tx.send(3);
				}
			})(),
			(async () => {
				while (tx.canWrite$.content()) {
					tx.send(4);
				}
			})(),
			(async () => {
				while (true) {
					expect(await rx.recv()).to.be.oneOf([1, 2, 3, 4]);
				}
			})(),
		]);
		await sleep(50).then(() => tx.close());
		await expect(throttlePromise).rejects.toBeInstanceOf(ChannelClosedError);
	});
});
