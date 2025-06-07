export function formatXML(input: string): string {
    if (!input) return "";
    

    const lines = input.split(/\r?\n/);  // Divide o texto em linhas
    let formattedText = '';
    let indentLevel = 0;
    const PADDING = '    ';  // 4 espaços para indentação

    // Itera sobre cada linha do texto
    lines.forEach(line => {
        // Remove espaços extras no início e no fim da linha
        const trimmedLine = line.trim();

        // Se a linha contém uma tag de abertura (exemplo: <tag>), aumenta o nível de indentação
        if (/<\w+>/.test(trimmedLine) && !/<\/\w+>/.test(trimmedLine)) {
            formattedText += `${PADDING.repeat(indentLevel)}${trimmedLine}\n`;
            console.log(formattedText)
            indentLevel++; // Aumenta a indentação após a tag de abertura
        } 
        // Se a linha contém uma tag de fechamento (exemplo: </tag>), diminui o nível de indentação antes de adicionar
        // else if (/<\/\w+>/.test(trimmedLine)) {
        //     indentLevel--; // Diminui a indentação antes de adicionar a tag de fechamento
        //     formattedText += `${PADDING.repeat(indentLevel)}${trimmedLine}\n`;
        // } 
        // Caso contrário (não é uma tag), apenas adicione a linha com a indentação atual
        else {
            formattedText += `${PADDING.repeat(indentLevel)}${trimmedLine}\n`;
            console.log(formattedText)
        }
    });

    return formattedText.trim(); // Remove os espaços extras no final
}
