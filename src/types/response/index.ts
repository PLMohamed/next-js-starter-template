export interface ListResponse<T> {
    data: T[];
    page: number;
}

export interface APIResponse {
    message: string;
    messageTranslationCode: string;
    [key: string]: any;
}