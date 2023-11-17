import { Observable } from "rxjs";

export interface AuthService {
    getToken(data: { email: string, password: string ,deviceId: string}): Observable<any>;
    signup(data: { name: string, email: string ,password: string, role:[string], notification: string}): Observable<any>;
    signupVerification(data: {otp: string}): Observable<any>;
}

export interface SubscriberRequest {
    request: boolean;
}

export interface subscriberResponse {
    emails: string[];
}
