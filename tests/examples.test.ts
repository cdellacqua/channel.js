import chai, {expect} from 'chai';
import chaiAsPromises from 'chai-as-promised';
import {ChannelClosedError, makeChannel} from '../src/lib/index';

chai.use(chaiAsPromises);

describe('examples', () => {
	it('readme 1', async () => {
		// Create a channel that can be used to pass strings.
		const {rx, tx} = makeChannel<string>();
		let actual = '';
		await Promise.all([rx.recv().then((message) => (actual = message)), tx.send('hello!')]); // this will resolve the above promise, printing "hello!"
		expect(actual).to.eq('hello!');
	});
	it('readme 2', async () => {
		// Create a channel that can be used to pass strings.
		const {rx, tx} = makeChannel<string>();
		let actual = '';
		tx.availableOutboxSlots$
			// this will immediately print 1024, which is the default channel capacity.
			.subscribe((n) => (actual = `Available slots: ${n}`));
		expect(actual).to.eq('Available slots: 1024');
		// this will trigger the above subscription, printing 1023,
		// because there is no pending `recv` that can consume the data.
		tx.send('hello!');
		expect(actual).to.eq('Available slots: 1023');
		// this will also trigger the subscription, printing 1024 again,
		// because `recv()` will consume the channel buffer, emptying it.
		await rx.recv();
		expect(actual).to.eq('Available slots: 1024');
	});
	it('readme 3', async () => {
		// Create a channel that can be used to pass strings.
		const {rx, tx} = makeChannel<{email: string; content: string}>();

		async function processEmailQueue() {
			while (!rx.closed$.content()) {
				try {
					const {email} = await rx.recv();
					expect(`Now sending an email to ${email}`).to.eq(
						'Now sending an email to user@example.com',
					);
					// ... your favorite email dispatcher here.
				} catch (err) {
					console.error('unable to send because of the following error:', err);
					expect(err).to.be.instanceOf(ChannelClosedError);
				}
			}
		}

		const user = {email: 'user@example.com'};
		// Somewhere in the startup of your application.
		const processingPromise = processEmailQueue();

		// Somewhere where an email should be sent, e.g. when a user subscribes to your newsletter.
		tx.send({
			email: user.email,
			content: 'Subscription activated, you will receive our best deals and coupons!',
		});
		tx.close();
		await processingPromise;
	});
	it('readme 4', async () => {
		// Create a channel that can be used to pass strings.
		const {rx} = makeChannel<{email: string; content: string}>();
		// You can abort a `recv` using a simple timeout:
		try {
			await rx.recv({signal: AbortSignal.timeout(5)});
			expect(true).to.be.false; // unreachable
		} catch (err) {
			expect(err).to.be.instanceOf(DOMException);
			if (err instanceof DOMException && err.name === 'TimeoutError') {
				// console.warn('No data to consume, timeout expired');
			} else {
				expect(true).to.be.false; // unreachable
			}
			// ...
		}
	});
	it('readme 5', async () => {
		// Create a channel that can be used to pass strings.
		const {rx} = makeChannel<{email: string; content: string}>();

		let savedCb = () => undefined as void;
		const abortButton = {
			addEventListener(_: string, cb: () => void) {
				savedCb = cb;
			},
		};

		const abortController = new AbortController();
		// Assuming you have a `abortButton` variable
		abortButton.addEventListener('click', () =>
			abortController.abort(new Error('Action cancelled by the user')),
		);

		// You can abort a `recv` using an abort signal:
		try {
			const recvPromise = rx.recv({signal: abortController.signal});
			savedCb();
			await recvPromise;
		} catch (err) {
			expect(err).to.contain({message: 'Action cancelled by the user'});
			// ...
		}
	});
	it('makeChannel example', async () => {
		const {tx, rx} = makeChannel<number>();
		let actual = '';
		const recvPromise = rx.recv().then((n) => (actual = 'Here it is: ' + n)); // doesn't print anything, the channel is currently empty.
		tx.send(1); // resolves the above promise, causing it to print 'Here it is: 1'
		await recvPromise;
		expect(actual).to.eq('Here it is: 1');
	});
});
