/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} type
 * @param {HTMLElementTagNameMap[K]} [attributes]
 * @param {HTMLElement[]} [children]
 * @returns {HTMLElementTagNameMap[K]}
 */
export const createElement = (type, attributes, children) => {
	const element = document.createElement(type);
	if (attributes)
		for (const key in attributes)
			switch (key) {
				case 'dataset':
					Object.assign(element.dataset, attributes.dataset);
					break;
				case 'style':
					Object.assign(element.style, attributes.style);
					break;
				default:
					element[key] = attributes[key];
			}
	if (children)
		for (const child of children)
			element.append(child);
	return element;
};
