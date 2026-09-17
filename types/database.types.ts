export type UserRole = 'player' | 'owner';
export type SlotStatus = 'available' | 'booked' | 'blocked';
export type PaymentMethod = 'jazzcash' | 'easypaisa' | 'cash';
export type PaymentStatus = 'pending' | 'confirmed';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type SubscriptionPlan = 'basic' | 'pro' | 'premium';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled';
export type CourtFormat = '5v5' | '6v6' | '7v7' | '8v8';
export type CourtPortion = 'full' | 'half';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name: string;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          phone?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      courts: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          area: string;
          address: string;
          price_per_hour: number;
          format: CourtFormat;
          allows_half_court: boolean;
          opens_at: string;
          closes_at: string;
          is_active: boolean;
          rating: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          area: string;
          address: string;
          price_per_hour: number;
          format?: CourtFormat;
          allows_half_court?: boolean;
          opens_at?: string;
          closes_at?: string;
          is_active?: boolean;
          rating?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          area?: string;
          address?: string;
          price_per_hour?: number;
          format?: CourtFormat;
          allows_half_court?: boolean;
          opens_at?: string;
          closes_at?: string;
          is_active?: boolean;
          rating?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'courts_owner_id_fkey';
            columns: ['owner_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      court_photos: {
        Row: {
          id: string;
          court_id: string;
          storage_path: string;
          is_primary: boolean;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          court_id: string;
          storage_path: string;
          is_primary?: boolean;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          court_id?: string;
          storage_path?: string;
          is_primary?: boolean;
          uploaded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'court_photos_court_id_fkey';
            columns: ['court_id'];
            referencedRelation: 'courts';
            referencedColumns: ['id'];
          },
        ];
      };
      time_slots: {
        Row: {
          id: string;
          court_id: string;
          date: string;
          start_time: string;
          end_time: string;
          status: SlotStatus;
        };
        Insert: {
          id?: string;
          court_id: string;
          date: string;
          start_time: string;
          end_time: string;
          status?: SlotStatus;
        };
        Update: {
          id?: string;
          court_id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          status?: SlotStatus;
        };
        Relationships: [
          {
            foreignKeyName: 'time_slots_court_id_fkey';
            columns: ['court_id'];
            referencedRelation: 'courts';
            referencedColumns: ['id'];
          },
        ];
      };
      bookings: {
        Row: {
          id: string;
          player_id: string;
          slot_id: string;
          court_id: string;
          duration_hours: number;
          court_portion: CourtPortion;
          total_amount: number;
          payment_method: PaymentMethod;
          payment_status: PaymentStatus;
          status: BookingStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          slot_id: string;
          court_id: string;
          duration_hours?: number;
          court_portion?: CourtPortion;
          total_amount: number;
          payment_method: PaymentMethod;
          payment_status?: PaymentStatus;
          status?: BookingStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          slot_id?: string;
          court_id?: string;
          duration_hours?: number;
          court_portion?: CourtPortion;
          total_amount?: number;
          payment_method?: PaymentMethod;
          payment_status?: PaymentStatus;
          status?: BookingStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bookings_player_id_fkey';
            columns: ['player_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_slot_id_fkey';
            columns: ['slot_id'];
            referencedRelation: 'time_slots';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_court_id_fkey';
            columns: ['court_id'];
            referencedRelation: 'courts';
            referencedColumns: ['id'];
          },
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          owner_id: string;
          plan: SubscriptionPlan;
          status: SubscriptionStatus;
          starts_at: string;
          ends_at: string | null;
        };
        Insert: {
          id?: string;
          owner_id: string;
          plan?: SubscriptionPlan;
          status?: SubscriptionStatus;
          starts_at?: string;
          ends_at?: string | null;
        };
        Update: {
          id?: string;
          owner_id?: string;
          plan?: SubscriptionPlan;
          status?: SubscriptionStatus;
          starts_at?: string;
          ends_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'subscriptions_owner_id_fkey';
            columns: ['owner_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_booking: {
        Args: {
          p_slot_id: string;
          p_duration_hours: number;
          p_payment_method: PaymentMethod;
          p_court_portion?: CourtPortion;
        };
        Returns: Database['public']['Tables']['bookings']['Row'];
      };
      generate_slots_for_court: {
        Args: {
          p_court_id: string;
          p_date: string;
        };
        Returns: void;
      };
      generate_upcoming_slots: {
        Args: {
          p_court_id: string;
          p_days?: number;
        };
        Returns: void;
      };
      generate_upcoming_slots_all_courts: {
        Args: {
          p_days?: number;
        };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Court = Database['public']['Tables']['courts']['Row'];
export type CourtPhoto = Database['public']['Tables']['court_photos']['Row'];
export type TimeSlot = Database['public']['Tables']['time_slots']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];

export type CourtWithPhotos = Court & { court_photos: CourtPhoto[] };
