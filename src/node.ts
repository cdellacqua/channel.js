import {makeChannel} from './lib';

// Payment processing channel
const {rx, tx} = makeChannel<{amount: string; currency: 'USD' | 'EUR'}>();

(async () => {
	while (!rx.closed) {
		const {amount, currency} = await rx.recv();
		console.log(`processing a payment for ${amount.padStart(5, ' ')} ${currency}`);
	}
})().catch(console.error);

tx.send({amount: '10.21', currency: 'USD'});
tx.send({amount: '1.20', currency: 'USD'});
tx.send({amount: '4.33', currency: 'USD'});
tx.send({amount: '9.99', currency: 'EUR'});
tx.send({amount: '4.65', currency: 'EUR'});
