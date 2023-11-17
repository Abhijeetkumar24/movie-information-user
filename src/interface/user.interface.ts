export interface SubscriberRequest {
    request: boolean;
}

export interface subscriberResponse {
    emails: string[];
}

export interface NameEmailRequest {
    id: string;
}

export interface NameEmailResponse {
    name: string;
    email: string
}