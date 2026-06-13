import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'ADMIN';
  createdAt: string;
  phone?: string;
  address?: string;
  city?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutos en milisegundos
const ACTIVITY_EVENTS = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private currentUser$ = new BehaviorSubject<User | null>(null);
  private token$ = new BehaviorSubject<string | null>(null);

  readonly user$ = this.currentUser$.asObservable();
  readonly isLoggedIn$ = new BehaviorSubject<boolean>(false);

  private inactivityTimer: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone,
  ) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem('mss_token');
    const user = localStorage.getItem('mss_user');
    if (token && user) {
      this.token$.next(token);
      this.currentUser$.next(JSON.parse(user));
      this.isLoggedIn$.next(true);
      this.startInactivityWatcher();
    }
  }

  register(data: { name: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(res => this.saveSession(res))
    );
  }

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(res => this.saveSession(res))
    );
  }

  logout(reason?: 'inactivity' | 'unauthorized'): void {
    this.stopInactivityWatcher();
    localStorage.removeItem('mss_token');
    localStorage.removeItem('mss_user');
    this.currentUser$.next(null);
    this.token$.next(null);
    this.isLoggedIn$.next(false);

    if (reason === 'inactivity') {
      this.router.navigate(['/login'], {
        queryParams: { reason: 'inactivity' }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  getToken(): string | null {
    return this.token$.value;
  }

  getUser(): User | null {
    return this.currentUser$.value;
  }

  isAdmin(): boolean {
    return this.currentUser$.value?.role === 'ADMIN';
  }

  isLoggedIn(): boolean {
    return this.isLoggedIn$.value;
  }

  // ── Inactividad ──────────────────────────────────────────

  private startInactivityWatcher(): void {
    this.ngZone.runOutsideAngular(() => {
      ACTIVITY_EVENTS.forEach(event => {
        window.addEventListener(event, this.resetInactivityTimer, { passive: true });
      });
    });
    this.resetInactivityTimer();
  }

  private stopInactivityWatcher(): void {
    ACTIVITY_EVENTS.forEach(event => {
      window.removeEventListener(event, this.resetInactivityTimer);
    });
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  private resetInactivityTimer = (): void => {
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    this.inactivityTimer = setTimeout(() => {
      this.ngZone.run(() => {
        if (this.isLoggedIn$.value) {
          this.logout('inactivity');
        }
      });
    }, INACTIVITY_LIMIT);
  };

  private saveSession(res: AuthResponse): void {
    localStorage.setItem('mss_token', res.token);
    localStorage.setItem('mss_user', JSON.stringify(res.user));
    this.token$.next(res.token);
    this.currentUser$.next(res.user);
    this.isLoggedIn$.next(true);
    this.startInactivityWatcher();
  }
}