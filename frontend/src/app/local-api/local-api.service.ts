import { Injectable } from '@angular/core';
import { LocalDatabaseService } from './local-database.service';
import { Word } from '~/app/learning/learning.models';
import { hashPassword, randomHex } from './local-password';

export type LocalRole = 'student' | 'tutor';
export type LocalProfile = { subject: string; role: LocalRole; name: string; email: string; tutorCode?: string };
type StoredAccount = { subject: string; role: LocalRole; display_name: string; email: string; tutor_code: string | null; password_hash: string; password_salt: string; password_iterations: number };

@Injectable({ providedIn: 'root' })
export class LocalApiService {
  private readonly iterations = 310000;
  constructor(private readonly db: LocalDatabaseService) {}

  async register(input: { name: string; email: string; password: string; role: LocalRole; tutorCode?: string }): Promise<LocalProfile> {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    if (!name || !email || !email.includes('@') || input.password.length < 8) {
      throw new Error('Escribe tu nombre, correo y una contraseña de al menos 8 caracteres.');
    }
    const duplicate = await this.db.query<{ subject: string }>('SELECT subject FROM app_profile WHERE email = ? COLLATE NOCASE', [email]);
    if (duplicate.length) throw new Error('Ya existe una cuenta local con ese correo.');
    let tutorSubject: string | null = null;
    if (input.role === 'student') {
      const code = (input.tutorCode ?? '').trim().toUpperCase();
      const tutors = await this.db.query<{ subject: string }>("SELECT subject FROM app_profile WHERE role = 'tutor' AND tutor_code = ?", [code]);
      if (!tutors.length) throw new Error('No se encontró un profesor local con ese código.');
      tutorSubject = tutors[0].subject;
    }
    const subject = this.newId();
    const salt = randomHex(16);
    const hash = await hashPassword(input.password, salt, this.iterations);
    const tutorCode = input.role === 'tutor' ? randomHex(8).toUpperCase() : null;
    try {
      await this.db.run('INSERT INTO app_profile (subject, role, tutor_code, tutor_subject, display_name, email, password_hash, password_salt, password_iterations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [subject, input.role, tutorCode, tutorSubject, name, email, hash, salt, this.iterations]);
    } catch (error) {
      if (String(error).toLowerCase().includes('unique')) throw new Error('La cuenta ya existe. Inténtalo de nuevo.');
      throw error;
    }
    return { subject, role: input.role, name, email, tutorCode: tutorCode ?? undefined };
  }

  async login(email: string, password: string, role: LocalRole): Promise<LocalProfile> {
    const accounts = await this.db.query<StoredAccount>('SELECT * FROM app_profile WHERE email = ? COLLATE NOCASE AND role = ?', [email.trim(), role]);
    const account = accounts[0];
    if (!account || await hashPassword(password, account.password_salt, account.password_iterations) !== account.password_hash) {
      throw new Error('Correo, contraseña o rol incorrectos.');
    }
    return this.toProfile(account);
  }

  async profile(subject: string): Promise<LocalProfile | undefined> {
    const rows = await this.db.query<StoredAccount>('SELECT * FROM app_profile WHERE subject = ?', [subject]);
    return rows[0] ? this.toProfile(rows[0]) : undefined;
  }

  async students(tutorSubject: string): Promise<{ name: string; email: string }[]> {
    return this.db.query<{ name: string; email: string }>("SELECT display_name AS name, email FROM app_profile WHERE role = 'student' AND tutor_subject = ? ORDER BY display_name", [tutorSubject]);
  }

  words(vocal: string, dificultad: number): Promise<Word[]> {
    return this.db.query<Word>('SELECT texto, url_imagen AS imagen, url_audio AS audio FROM palabra WHERE vocal = ? AND dificultad = ?', [vocal, dificultad]);
  }

  async recordActivity(subject: string, kind: 'lesson_completed' | 'exercise_completed' | 'exam_completed', letter: string, eventId: string, score: number | null = null, total: number | null = null): Promise<void> {
    await this.db.run(
      'INSERT OR IGNORE INTO learning_event (id, subject, kind, lesson_key, score, total, occurred_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [eventId, subject, kind, letter.toLowerCase(), score, total, new Date().toISOString()],
    );
  }

  async startLearningSession(subject: string, kind: 'lesson' | 'exercise' | 'exam', letter: string, id: string, total: number): Promise<void> {
    await this.db.run(
      'INSERT INTO learning_session (id, subject, kind, lesson_key, started_at, progress_total) VALUES (?, ?, ?, ?, ?, ?)',
      [id, subject, kind, letter.toLowerCase(), new Date().toISOString(), total],
    );
  }

  async updateLearningProgress(id: string, current: number, total: number): Promise<void> {
    await this.db.run('UPDATE learning_session SET progress_current = ?, progress_total = ? WHERE id = ? AND completed_at IS NULL', [current, total, id]);
  }

  async recordLearningAnswer(input: { id: string; sessionId: string; index: number; word: string; selected: string; correct: string; elapsedMs: number }): Promise<void> {
    const now = new Date().toISOString();
    const isCorrect = input.selected.toLocaleLowerCase() === input.correct.toLocaleLowerCase();
    await this.db.run(
      'INSERT INTO learning_answer (id, session_id, question_index, word, selected_answer, correct_answer, is_correct, elapsed_ms, answered_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [input.id, input.sessionId, input.index, input.word, input.selected, input.correct, isCorrect ? 1 : 0, Math.max(0, input.elapsedMs), now],
    );
    await this.db.run('UPDATE learning_session SET attempts = attempts + 1, correct_answers = correct_answers + ? WHERE id = ? AND completed_at IS NULL', [isCorrect ? 1 : 0, input.sessionId]);
  }

  async finishLearningSession(id: string, score: number | null = null, total: number | null = null): Promise<void> {
    await this.db.run(
      'UPDATE learning_session SET completed_at = ?, duration_ms = MAX(0, CAST((julianday(?) - julianday(started_at)) * 86400000 AS INTEGER)), score = ?, total = ? WHERE id = ? AND completed_at IS NULL',
      [new Date().toISOString(), new Date().toISOString(), score, total, id],
    );
  }

  async completedLessons(subject: string): Promise<string[]> {
    return this.completedActivities(subject, 'lesson_completed');
  }

  async completedActivities(subject: string, kind: 'lesson_completed' | 'exercise_completed' | 'exam_completed'): Promise<string[]> {
    const rows = await this.db.query<{ lesson_key: string }>(
      'SELECT DISTINCT lesson_key FROM learning_event WHERE subject = ? AND kind = ?', [subject, kind],
    );
    return rows.map(row => row.lesson_key);
  }

  private toProfile(account: StoredAccount): LocalProfile {
    return { subject: account.subject, role: account.role, name: account.display_name, email: account.email, tutorCode: account.tutor_code ?? undefined };
  }

  newId(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

}
