import { Injectable } from '@angular/core';
import { AuthService } from '~/app/services/auth/auth.service';
import { LocalApiService } from '~/app/local-api/local-api.service';

export type ActivityKind = 'lesson_completed' | 'exercise_completed' | 'exam_completed';

/** Keeps the activity pages independent of the local storage implementation. */
@Injectable({ providedIn: 'root' })
export class ActivityProgressService {
  constructor(private auth: AuthService, private localApi: LocalApiService) {}

  newEventId(): string {
    return this.auth.localSubject && this.auth.profile?.role === 'student' ? this.localApi.newId() : '';
  }

  async start(kind: 'lesson' | 'exercise' | 'exam', letter: string, total: number): Promise<string> {
    const subject = this.auth.localSubject;
    if (!subject || this.auth.profile?.role !== 'student') return '';
    const id = this.localApi.newId();
    await this.localApi.startLearningSession(subject, kind, letter, id, total);
    return id;
  }

  async update(sessionId: string, current: number, total: number): Promise<void> {
    if (sessionId) await this.localApi.updateLearningProgress(sessionId, current, total);
  }

  async answer(sessionId: string, index: number, word: string, selected: string, correct: string, elapsedMs: number): Promise<void> {
    if (sessionId) await this.localApi.recordLearningAnswer({
      id: this.localApi.newId(), sessionId, index, word, selected, correct, elapsedMs,
    });
  }

  async finishSession(sessionId: string, score: number | null = null, total: number | null = null): Promise<void> {
    if (sessionId) await this.localApi.finishLearningSession(sessionId, score, total);
  }

  async record(kind: ActivityKind, letter: string, eventId: string, score: number | null = null, total: number | null = null): Promise<void> {
    const subject = this.auth.localSubject;
    if (subject && this.auth.profile?.role === 'student') {
      await this.localApi.recordActivity(subject, kind, letter, eventId, score, total);
    }
  }
}
