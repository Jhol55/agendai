

export function splitTextIntoSentences(text: string): string[] {
	const sentences: string[] = text
		.split(/(?<=[.!?])\s+(?=[A-Z])|(?:\n\n)/g)
		.filter((sentence) => sentence.trim() !== '');
	return sentences.map((sentence, index) => {
		const trimmed = sentence.trim();
		const hasFinalPunctuation = /[.!?]$/.test(trimmed);
		let finalText = trimmed + ((index < sentences.length - 1 || hasFinalPunctuation) ? '' : '.');
		finalText = finalText.replace(/\*\*(\S.*?\S)\*\*/g, '*$1*');
		return finalText
	});
}
