
import { supabase } from "@/integrations/supabase/client";

export type ErrorType = 'api' | 'frontend' | 'backend' | 'database' | 'auth' | 'other';

interface ErrorLogData {
  error_type: ErrorType;
  message: string;
  stack_trace?: string;
  additional_data?: any;
  route?: string;
}

export const logError = async (error: Error | unknown, type: ErrorType, additionalData?: any) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    const errorData: ErrorLogData = {
      error_type: type,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      stack_trace: error instanceof Error ? error.stack : undefined,
      additional_data: additionalData,
      route: window.location.pathname
    };

    const { error: logError } = await supabase
      .from('error_logs')
      .insert([{ ...errorData, user_id: userId }]);

    if (logError) {
      console.error('Failed to log error:', logError);
    }
  } catch (e) {
    console.error('Error in error logging:', e);
  }
};
