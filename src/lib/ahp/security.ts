export const sanitizeText = (text: string): string => {
    // Basic sanitization: strip HTML tags
    if (!text) return "";
    return text.replace(/<[^>]*>?/gm, '');
};
