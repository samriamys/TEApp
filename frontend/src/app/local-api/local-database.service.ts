import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { environment } from '~/environments/environment';
import { hashPassword, randomHex } from './local-password';

type BundledWord = { id: number; texto: string; vocal: string; dificultad: number; imagen?: string | null; audio?: string | null };
type ContentPack = { version: number; words: BundledWord[] };

/** SQLite-backed implementation of the app-owned part of the server schema. */
@Injectable({ providedIn: 'root' })
export class LocalDatabaseService {
  private readonly sqlite = new SQLiteConnection(CapacitorSQLite);
  private connection?: Promise<SQLiteDBConnection>;
  private operation: Promise<unknown> = Promise.resolve();
  private readonly name = 'teapp_local';

  private open(): Promise<SQLiteDBConnection> {
    if (!this.connection) {
      this.connection = this.createConnection().catch(error => {
        this.connection = undefined;
        throw error;
      });
    }
    return this.connection;
  }

  private async createConnection(): Promise<SQLiteDBConnection> {
    if (Capacitor.getPlatform() === 'web') {
      const { defineCustomElements } = await import('jeep-sqlite/loader');
      await defineCustomElements(window);
      if (!document.querySelector('jeep-sqlite')) {
        const element = document.createElement('jeep-sqlite');
        element.setAttribute('wasmpath', '/assets');
        document.body.appendChild(element);
      }
      await customElements.whenDefined('jeep-sqlite');
      await this.sqlite.initWebStore();
    }
    const existing = await this.sqlite.isConnection(this.name, false);
    const db = existing.result
      ? await this.sqlite.retrieveConnection(this.name, false)
      : await this.sqlite.createConnection(this.name, false, 'no-encryption', 1, false);
    if (!(await db.isDBOpen()).result) await db.open();
    await db.execute('PRAGMA foreign_keys = ON;', false);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS app_profile (
        subject TEXT PRIMARY KEY NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('student', 'tutor')),
        tutor_code TEXT UNIQUE,
        tutor_subject TEXT REFERENCES app_profile(subject),
        display_name TEXT NOT NULL,
        email TEXT NOT NULL COLLATE NOCASE UNIQUE,
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        password_iterations INTEGER NOT NULL,
        CHECK ((role = 'tutor' AND tutor_code IS NOT NULL AND tutor_subject IS NULL)
          OR (role = 'student' AND tutor_code IS NULL AND tutor_subject IS NOT NULL))
      );
      CREATE TABLE IF NOT EXISTS palabra (
        id INTEGER PRIMARY KEY,
        texto TEXT NOT NULL,
        dificultad INTEGER NOT NULL,
        vocal TEXT NOT NULL,
        url_imagen TEXT,
        url_audio TEXT
      );
      CREATE INDEX IF NOT EXISTS palabra_vocal_dificultad_idx ON palabra(vocal, dificultad);
      CREATE TABLE IF NOT EXISTS learning_event (
        id TEXT PRIMARY KEY NOT NULL,
        subject TEXT NOT NULL REFERENCES app_profile(subject),
        kind TEXT NOT NULL,
        lesson_key TEXT NOT NULL,
        score INTEGER,
        total INTEGER,
        occurred_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS learning_event_subject_idx ON learning_event(subject, kind, lesson_key);
      CREATE TABLE IF NOT EXISTS learning_session (
        id TEXT PRIMARY KEY NOT NULL,
        subject TEXT NOT NULL REFERENCES app_profile(subject),
        kind TEXT NOT NULL CHECK (kind IN ('lesson', 'exercise', 'exam')),
        lesson_key TEXT NOT NULL,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        duration_ms INTEGER NOT NULL DEFAULT 0,
        progress_current INTEGER NOT NULL DEFAULT 0,
        progress_total INTEGER NOT NULL DEFAULT 0,
        attempts INTEGER NOT NULL DEFAULT 0,
        correct_answers INTEGER NOT NULL DEFAULT 0,
        score INTEGER,
        total INTEGER
      );
      CREATE INDEX IF NOT EXISTS learning_session_subject_idx ON learning_session(subject, kind, lesson_key);
      CREATE TABLE IF NOT EXISTS learning_answer (
        id TEXT PRIMARY KEY NOT NULL,
        session_id TEXT NOT NULL REFERENCES learning_session(id) ON DELETE CASCADE,
        question_index INTEGER NOT NULL,
        word TEXT NOT NULL,
        selected_answer TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        is_correct INTEGER NOT NULL,
        elapsed_ms INTEGER NOT NULL,
        answered_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS learning_answer_session_idx ON learning_answer(session_id, question_index);
      CREATE TABLE IF NOT EXISTS local_metadata (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
    `);
    await this.installBundledContent(db);
    if (!environment.production) await this.installDemoAccounts(db);
    await this.saveWeb();
    return db;
  }

  private async installDemoAccounts(db: SQLiteDBConnection): Promise<void> {
    const tutorSubject = 'teapp-demo-tutor';
    const studentSubject = 'teapp-demo-student';
    const iterations = 310000;
    const accounts = [
      { subject: tutorSubject, role: 'tutor', name: 'Profesor de prueba', email: 'profesor@teapp.test', tutorCode: 'TEAPP-DEMO', tutorSubject: null },
      { subject: studentSubject, role: 'student', name: 'Alumno de prueba', email: 'alumno@teapp.test', tutorCode: null, tutorSubject },
    ];
    for (const account of accounts) {
      const existing = await db.query('SELECT subject FROM app_profile WHERE subject = ? OR email = ? COLLATE NOCASE', [account.subject, account.email]);
      if (existing.values?.length) continue;
      if (account.role === 'student') {
        const tutor = await db.query("SELECT subject FROM app_profile WHERE subject = ? AND role = 'tutor' AND email = ? COLLATE NOCASE", [tutorSubject, accounts[0].email]);
        if (!tutor.values?.length) continue;
      }
      const salt = randomHex(16);
      const hash = await hashPassword('Teapp1234', salt, iterations);
      await db.run('INSERT OR IGNORE INTO app_profile (subject, role, tutor_code, tutor_subject, display_name, email, password_hash, password_salt, password_iterations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [account.subject, account.role, account.tutorCode, account.tutorSubject, account.name, account.email, hash, salt, iterations]);
    }
  }

  private async installBundledContent(db: SQLiteDBConnection): Promise<void> {
    const response = await fetch(new URL('assets/local-content/words.json', document.baseURI));
    if (!response.ok) throw new Error('No se pudo cargar el contenido incluido en la aplicación.');
    const pack = await response.json() as ContentPack;
    if (!Number.isInteger(pack.version) || !Array.isArray(pack.words)) throw new Error('Contenido local inválido.');
    const installed = (await db.query("SELECT value FROM local_metadata WHERE key = 'demo_pack_version'")).values?.[0]?.value;
    if (Number(installed) >= pack.version) return;
    const entries = pack.words.map(word => {
      if (!Number.isInteger(word.id) || word.id >= 0 || !word.texto || !word.vocal) {
        throw new Error('Contenido local inválido.');
      }
      return {
        statement: 'INSERT INTO palabra (id, texto, vocal, dificultad, url_imagen, url_audio) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET texto=excluded.texto, vocal=excluded.vocal, dificultad=excluded.dificultad, url_imagen=excluded.url_imagen, url_audio=excluded.url_audio',
        values: [word.id, word.texto, word.vocal, word.dificultad, word.imagen || null, word.audio || null],
      };
    });
    entries.push({
      statement: "INSERT INTO local_metadata (key, value) VALUES ('demo_pack_version', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      values: [String(pack.version)],
    });
    await db.executeSet(entries);
  }

  private async saveWeb(): Promise<void> {
    if (Capacitor.getPlatform() === 'web') await this.sqlite.saveToStore(this.name);
  }

  private enqueue<T>(work: (db: SQLiteDBConnection) => Promise<T>): Promise<T> {
    const result = this.operation.then(async () => work(await this.open()));
    this.operation = result.catch(() => undefined);
    return result;
  }

  query<T>(sql: string, values: unknown[] = []): Promise<T[]> {
    return this.enqueue(async db => (await db.query(sql, values)).values as T[] ?? []);
  }

  run(sql: string, values: unknown[] = []): Promise<void> {
    return this.enqueue(async db => {
      await db.run(sql, values);
      await this.saveWeb();
    });
  }
}
