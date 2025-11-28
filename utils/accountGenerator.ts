
export const generateAccountNumber = (phone?: string): string => {
    let baseNumber = '';

    if (phone) {
        // Remove non-digits
        let cleanPhone = phone.replace(/\D/g, '');
        // Remove leading '0' if present (common in Nigeria/UK etc)
        if (cleanPhone.startsWith('0')) {
            cleanPhone = cleanPhone.substring(1);
        }
        // Take first 10 digits
        if (cleanPhone.length >= 10) {
            baseNumber = cleanPhone.substring(0, 10);
        }
    }

    // If no phone or phone was too short/invalid, generate random
    if (!baseNumber) {
        const randomGroup = (len: number) => {
            return Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join('');
        };
        baseNumber = `${randomGroup(4)}${randomGroup(2)}${randomGroup(4)}`;
    }

    // Format: XXXX-XX-XXXX (10 digits total)
    // 0123456789 -> 0123-45-6789
    return `${baseNumber.substring(0, 4)}-${baseNumber.substring(4, 6)}-${baseNumber.substring(6, 10)}`;
};
