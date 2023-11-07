import { Observable } from "rxjs";

export interface AuthService {
    getToken(data: { email: string, password: string ,deviceId: string}): Observable<any>;
}