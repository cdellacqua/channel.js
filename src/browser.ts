import './style.css';
import {makeChannel} from './lib';

const txForm = document.getElementById('tx-form') as HTMLDivElement;
const txInput = document.getElementById('tx-input') as HTMLInputElement;
const rxForm = document.getElementById('rx-form') as HTMLFormElement;
const rxSubmitButton = document.getElementById('rx-submit-button') as HTMLButtonElement;
const queueUl = document.getElementById('queue') as HTMLUListElement;

const {tx, rx, buffer} = makeChannel<string>({
	capacity: 10,
});

txForm.addEventListener('submit', (e) => {
	e.preventDefault();
	try {
		tx.send(txInput.value);
	} catch (err) {
		alert(String(err));
	}
	txInput.value = '';
});

let timeoutId: ReturnType<typeof setTimeout> | undefined;
rxForm.addEventListener('submit', (e) => {
	e.preventDefault();
	rxSubmitButton.disabled = true;
	if (timeoutId !== undefined) {
		clearTimeout(timeoutId);
		timeoutId = undefined;
	}
	rxSubmitButton.textContent = 'waiting for data...';
	rx.recv()
		.then((data) => {
			rxSubmitButton.textContent = `consumed "${data}"`;
		})
		.catch((err) => alert(String(err)))
		.finally(() => {
			rxSubmitButton.disabled = false;
			timeoutId = setTimeout(() => {
				rxSubmitButton.textContent = 'consume';
				timeoutId = undefined;
			}, 500);
		});
});

buffer.availableSlots$.subscribe(() => {
	Array.from(queueUl.children).forEach((child) => child.remove());
	buffer
		.toArray()
		.map((content) => {
			const listItem = document.createElement('li');
			listItem.textContent = content;
			return listItem;
		})
		.forEach((item) => queueUl.appendChild(item));
});
