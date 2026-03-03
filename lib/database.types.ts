export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string | null;
        };
        Insert: {
          id: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          file_url: string;
          parsed_text: string;
          ai_score: number | null;
          ai_feedback: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_url: string;
          parsed_text: string;
          ai_score?: number | null;
          ai_feedback?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_url?: string;
          parsed_text?: string;
          ai_score?: number | null;
          ai_feedback?: Json | null;
          created_at?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

