/** @type {string} */
export const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self' data:;
    frame-src 'self' https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self';
`;