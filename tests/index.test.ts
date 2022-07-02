import {makeSignal} from '@cdellacqua/signals';
import chai, {expect} from 'chai';
import chaiAsPromises from 'chai-as-promised';
import {
	ChannelClosedError,
	ChannelFullError,
	ChannelTimeoutError,
	ChannelTooManyPendingRecvError,
	makeChannel,
} from '../src/lib/index';

chai.use(chaiAsPromises);

function sleep(ms: number) {
	return new Promise((res) => setTimeout(res, ms));
}

describe('channel', () => {
	it('tests a simple use case of send + recv', async () => {
		const {tx, rx} = makeChannel<number>({capacity: 1});
		tx.send(1);
		await expect(rx.recv()).to.eventually.eq(1);
	});
	it('tests sendWait', async () => {
		const {tx, rx} = makeChannel<number>({capacity: 1});
		await Promise.all([
			expect(tx.sendWait(1)).to.be.fulfilled,
			expect(rx.recv()).to.eventually.eq(1),
		]);
	});
	it('tests sendWait with a full channel', async () => {
		const {tx, rx} = makeChannel<number>({capacity: 1});
		tx.send(1);
		await expect(tx.sendWait(1)).to.be.rejected;
		await expect(rx.recv()).to.eventually.eq(1);
	});
	it('tests sendWait with a full channel, followed by a recv + send', async () => {
		const {tx, rx} = makeChannel<number>({capacity: 1});
		tx.send(1);
		await expect(tx.sendWait(1)).to.be.rejected;
		await expect(rx.recv()).to.eventually.eq(1);
		expect(() => tx.send(1)).not.to.throw();
	});
	it('tests canRead/canWrite getters', async () => {
		const {tx, rx} = makeChannel<number>({capacity: 1});
		expect(tx.canWrite).to.be.true;
		expect(rx.canRead).to.be.false;
		tx.send(1);
		expect(tx.canWrite).to.be.false;
		expect(rx.canRead).to.be.true;
	});
	it('tests slots getters', async () => {
		const {tx, rx} = makeChannel<number>({capacity: 1});
		expect(tx.availableOutboxSlots).to.eq(1);
		expect(rx.filledInboxSlots).to.eq(0);
		tx.send(1);
		expect(tx.availableOutboxSlots).to.eq(0);
		expect(rx.filledInboxSlots).to.eq(1);
	});
	it('tests pending recv getters', async () => {
		const {tx, rx} = makeChannel<number>({maxConcurrentPendingRecv: 1});
		expect(rx.pendingRecvPromises).to.eq(0);
		const recvPromise = rx.recv();
		expect(rx.pendingRecvPromises).to.eq(1);
		await expect(rx.recv()).to.eventually.be.rejectedWith(ChannelTooManyPendingRecvError);
		expect(rx.pendingRecvPromises).to.eq(1);
		tx.send(1);
		expect(rx.pendingRecvPromises).to.eq(0);
		await expect(recvPromise).to.eventually.be.fulfilled;
	});
	it('tests closed getter', async () => {
		const {tx, rx} = makeChannel<number>({capacity: 1});
		expect(tx.closed).to.be.false;
		expect(rx.closed).to.be.false;
		tx.close();
		expect(tx.closed).to.be.true;
		expect(rx.closed).to.be.true;
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
		expect(tx.closed).to.be.false;
		expect(rx.closed).to.be.false;
		tx.close();
		expect(tx.closed).to.be.true;
		expect(rx.closed).to.be.true;
		expect(() => tx.close()).not.to.throw();
		expect(tx.closed).to.be.true;
		expect(rx.closed).to.be.true;
	});
	it('tests a simple queue', async () => {
		const {tx, rx} = makeChannel<number>({capacity: 3});
		const receivedValues: number[] = [];
		(async () => {
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
		await expect(tx.sendWait(2)).to.eventually.be.rejectedWith(ChannelClosedError);
		await expect(recvPromise).to.eventually.be.rejectedWith(ChannelClosedError);
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
			expect(tx.sendWait(2)).to.eventually.be.rejectedWith(ChannelClosedError),
			sleep(1).then(() => tx.close()),
		]);
		await expect(recvPromise).to.eventually.be.rejectedWith(ChannelClosedError);
	});
	it('throttle a channel', async () => {
		const {tx, rx} = makeChannel<number>();
		const throttlePromise = Promise.all([
			(async () => {
				// eslint-disable-next-line no-constant-condition
				while (tx.canWrite) {
					tx.send(1);
				}
			})(),
			(async () => {
				// eslint-disable-next-line no-constant-condition
				while (true) {
					expect(await rx.recv()).to.eq(1);
				}
			})(),
		]);
		await sleep(50).then(() => tx.close());
		await expect(throttlePromise).to.eventually.be.rejectedWith(ChannelClosedError);
	});
	it('tests recv with timeout', async () => {
		const {rx, tx} = makeChannel<string>();
		tx.send('hello!');
		expect(await rx.recv({timeout: 5})).to.eq('hello!');
	});
	it('tests sendWait with timeout', async () => {
		const {rx, tx} = makeChannel<string>();
		await expect(tx.sendWait('hello!', {timeout: 5})).to.eventually.be.rejectedWith(
			ChannelTimeoutError,
		);
		await expect(
			Promise.all([sleep(10).then(() => rx.recv()), tx.sendWait('hello!', {timeout: 20})]),
		).to.eventually.be.fulfilled;
	});
	it('tests too many pending recv', async () => {
		const {rx} = makeChannel<string>({maxConcurrentPendingRecv: 2});
		const recv1Promise = rx.recv();
		const recv2Promise = rx.recv();
		await expect(rx.recv()).to.eventually.be.rejectedWith(ChannelTooManyPendingRecvError);
		rx.close();
		await expect(recv1Promise).to.eventually.be.rejectedWith(ChannelClosedError);
		await expect(recv2Promise).to.eventually.be.rejectedWith(ChannelClosedError);
	});
	it('fills a channel', async () => {
		const {tx} = makeChannel<number>({capacity: 2});
		tx.send(1);
		tx.send(1);
		expect(() => tx.send(1)).to.throw(ChannelFullError);
	});
	it('tests a custom abort signal', async () => {
		const {rx} = makeChannel<number>({capacity: 2});
		const abort$ = makeSignal<Error>();
		await Promise.all([
			expect(rx.recv({abort$})).to.eventually.be.rejectedWith(Error),
			sleep(10).then(() => abort$.emit(new Error())),
		]);
	});
	it('tests a custom abort signal that does not emit', async () => {
		const {rx, tx} = makeChannel<number>({capacity: 2});
		const abort$ = makeSignal<Error>();
		tx.send(1);
		await expect(rx.recv({abort$})).to.eventually.not.be.rejectedWith(Error);
	});
	it('tests that an aborted sendWait restores the channel buffer', async () => {
		const {rx, tx} = makeChannel<number>({capacity: 2});
		const abort$ = makeSignal<Error>();
		const sendWaitPromise = tx.sendWait(1, {abort$});
		expect(rx.filledInboxSlots).to.eq(1);
		await sleep(10);
		expect(rx.filledInboxSlots).to.eq(1);
		abort$.emit(new Error('abort sendWait'));
		await sleep(1);
		expect(rx.filledInboxSlots).to.eq(0);
		await expect(sendWaitPromise).to.eventually.be.rejectedWith(Error);
	});
	it('tests that an aborted sendWait fulfills if recv and abort$ happen almost at the same time', async () => {
		const {rx, tx} = makeChannel<number>({capacity: 2});
		const abort$ = makeSignal<Error>();
		const sendWaitPromise = tx.sendWait(1, {abort$});
		expect(rx.filledInboxSlots).to.eq(1);
		await sleep(10);
		expect(rx.filledInboxSlots).to.eq(1);
		abort$.emit(new Error('abort sendWait'));
		expect(await rx.recv()).to.eq(1);
		await expect(sendWaitPromise).to.eventually.be.fulfilled;
	});
	it('tests that an aborted sendWait restore the channel buffer', async () => {
		const {rx, tx} = makeChannel<number>({capacity: 2});
		const abort$ = makeSignal<Error>();
		const sendWaitPromise = tx.sendWait(1, {abort$});
		expect(rx.filledInboxSlots).to.eq(1);
		await sleep(10);
		expect(rx.filledInboxSlots).to.eq(1);
		abort$.emit(new Error('abort sendWait'));
		await sleep(1);
		const recvPromise = rx.recv();
		await expect(
			Promise.race([recvPromise, sleep(10).then(() => Promise.reject(new ChannelTimeoutError()))]),
		).to.eventually.be.rejectedWith(ChannelTimeoutError);
		await expect(sendWaitPromise).to.eventually.be.rejectedWith(Error);
	});
	it('tests that an aborted recv does not consume the channel buffer', async () => {
		const {rx, tx} = makeChannel<number>({capacity: 2});
		const abort$ = makeSignal<Error>();
		const recvPromise = rx.recv({abort$});
		expect(rx.pendingRecvPromises).to.eq(1);
		await sleep(10);
		expect(rx.pendingRecvPromises).to.eq(1);
		abort$.emit(new Error('abort sendWait'));
		await sleep(1);
		expect(rx.pendingRecvPromises).to.eq(0);
		await expect(recvPromise).to.eventually.be.rejectedWith(Error);
		tx.send(1);
		expect(rx.filledInboxSlots).to.eq(1);
	});
	it('tests that an aborted recv tests fulfills if send and abort$ happen almost at the same time', async () => {
		const {rx, tx} = makeChannel<number>({capacity: 2});
		const abort$ = makeSignal<Error>();
		const recvPromise = rx.recv({abort$});
		expect(rx.pendingRecvPromises).to.eq(1);
		await sleep(10);
		expect(rx.pendingRecvPromises).to.eq(1);
		abort$.emit(new Error('abort recv'));
		expect(rx.pendingRecvPromises).to.eq(1);
		tx.send(1);
		await expect(recvPromise).to.eventually.be.fulfilled;
		expect(rx.filledInboxSlots).to.eq(0);
	});
	it('tests a multiple producer single consumer scenario', async () => {
		const {rx, tx} = makeChannel<number>({capacity: 20});
		const throttlePromise = Promise.all([
			(async () => {
				// eslint-disable-next-line no-constant-condition
				while (tx.canWrite) {
					tx.send(1);
				}
			})(),
			(async () => {
				// eslint-disable-next-line no-constant-condition
				while (tx.canWrite) {
					tx.send(2);
				}
			})(),
			(async () => {
				// eslint-disable-next-line no-constant-condition
				while (tx.canWrite) {
					tx.send(3);
				}
			})(),
			(async () => {
				// eslint-disable-next-line no-constant-condition
				while (tx.canWrite) {
					tx.send(4);
				}
			})(),
			(async () => {
				// eslint-disable-next-line no-constant-condition
				while (true) {
					expect(await rx.recv()).to.be.oneOf([1, 2, 3, 4]);
				}
			})(),
		]);
		await sleep(50).then(() => tx.close());
		await expect(throttlePromise).to.eventually.be.rejectedWith(ChannelClosedError);
	});
});
