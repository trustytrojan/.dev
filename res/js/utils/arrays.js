/**
 * @template T
 * @param  {T[]} values 
 * @param {(t: T) => (string | number)} [key]
 */
export const max = (values, key) => {
	if (!values?.length)
		throw new Error('values is empty or undefined');
	return values.reduce(key
		? (prev, curr) => (key(prev) > key(curr)) ? prev : curr
		: (prev, curr) => (prev > curr) ? prev : curr
	);
};

/**
 * @template T
 * @param  {T[]} values 
 * @param {(t: T) => (string | number)} [key]
 */
export const min = (values, key) => {
	if (!values?.length)
		throw new Error('values is empty or undefined');
	return values.reduce(key
		? (prev, curr) => (key(prev) < key(curr)) ? prev : curr
		: (prev, curr) => (prev < curr) ? prev : curr
	);
};